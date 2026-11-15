/* Data layer. Swap localStorage for Firebase/Supabase here; pages don't change.
   Reminder: client-side sign-in hides the UI only. Real protection needs the
   backend to verify the Google token.

   Every page reads through useProjects(), which re-renders on writes from this
   tab and from other tabs (the `storage` event), so no page keeps a stale copy. */
import { useSyncExternalStore } from 'react';
import { insertAt, reorder } from './lib/reorder.js';

const KEY = 'hub.projects.v1';
const listeners = new Set();
let cache = { raw: undefined, value: [] };

function read() {
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

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage blocked */
  }
  cache = { raw: undefined, value: items }; // force a re-read next time
  listeners.forEach((l) => l());
  return items;
}

export function subscribe(cb) {
  listeners.add(cb);
  const onStorage = (e) => {
    if (e.key === KEY || e.key === null) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

export const useProjects = () => useSyncExternalStore(subscribe, read);
export const listProjects = read;
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
