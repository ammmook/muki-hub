/* Data layer. Two backends behind the same API, so pages never care which is used:
   - Firebase Realtime Database (when VITE_FIREBASE_* is set): one shared list at
     /projects, live-updated on every device. Who may write is decided by
     database.rules.json on Firebase's servers, not by this file.
   - localStorage (demo mode, no Firebase config): works offline for development.

   Every page reads through useProjects(), which re-renders on writes from this
   tab, other tabs (localStorage) or other devices (Firebase). */
import { useSyncExternalStore } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { db, isDemo } from './firebase.js';
import { insertAt, reorder } from './lib/reorder.js';

const KEY = 'hub.projects.v1';
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());
let cache = { raw: undefined, value: [] };

/* ---- sync status (Firebase only): lets the UI wait for data and show save errors ---- */
let status = { ready: isDemo, error: '' };
const setStatus = (patch) => {
  status = { ...status, ...patch };
  notify();
};

function readLocal() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* storage blocked */
  }
  if (raw === cache.raw) return cache.value; // stable reference until the data changes
  let value = [];
  try {
    value = JSON.parse(raw) || [];
  } catch {
    /* corrupt JSON -> empty */
  }
  cache = { raw, value };
  return value;
}

const read = isDemo ? readLocal : () => cache.value;

function write(items) {
  if (isDemo) {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage blocked */
    }
    cache = { raw: undefined, value: items }; // force a re-read next time
  } else {
    cache = { raw: undefined, value: items }; // show it at once; Firebase confirms or reverts
    // JSON round-trip drops `undefined` fields, which Firebase refuses to store
    set(ref(db, 'projects'), JSON.parse(JSON.stringify(items))).then(
      () => status.error && setStatus({ error: '' }),
      (e) =>
        setStatus({
          error: /permission_denied/i.test(e?.code + ' ' + e?.message)
            ? 'Only the owner can change this list.'
            : 'Could not save. Check your connection and try again.'
        })
    );
  }
  notify();
  return items;
}

/* Firebase stores a list as {0: …, 1: …}; turn it back into an array. */
const fromRemote = (v) =>
  (Array.isArray(v) ? v : v ? Object.values(v) : []).filter(Boolean).map((p) => ({ ...p, tags: p.tags || [] }));

let unsubscribe = null;
export function startSync() {
  if (isDemo || unsubscribe) return;
  unsubscribe = onValue(
    ref(db, 'projects'),
    (snap) => {
      cache = { raw: undefined, value: fromRemote(snap.val()) };
      setStatus({ ready: true });
    },
    () => setStatus({ ready: true, error: 'Could not load your sites. Sign out and in again.' })
  );
}
export function stopSync() {
  if (isDemo) return;
  unsubscribe?.();
  unsubscribe = null;
  cache = { raw: undefined, value: [] }; // never keep one account's data after sign-out
  setStatus({ ready: false, error: '' });
}

export function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (isDemo && (e.key === KEY || e.key === null)) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export const useProjects = () => useSyncExternalStore(subscribe, read);
export const useSyncStatus = () => useSyncExternalStore(subscribe, () => status);
export const listProjects = () => read();
export const saveProjects = write;
export const addProject = (p) => write([...read(), { ...p, id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }]);
export const updateProject = (id, patch) => write(read().map((x) => (x.id === id ? { ...x, ...patch } : x)));
export const removeProject = (id) => write(read().filter((x) => x.id !== id));
export const restoreProject = (item, index) =>
  write(
    insertAt(
      read().filter((x) => x.id !== item.id),
      item,
      index
    )
  );
export const makeMain = (id) => write(reorder(read(), id, 0) || read());

/* "example.com/x" -> safe https URL, or null */
export function normalizeUrl(raw) {
  let s = (raw || '').trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    return u.hostname.includes('.') || u.hostname === 'localhost' ? u.href : null;
  } catch {
    return null;
  }
}
export const domainOf = (u) => {
  try {
    return new URL(u).host.replace(/^www\./, '');
  } catch {
    return u;
  }
};
