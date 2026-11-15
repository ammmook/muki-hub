/* Data layer. Swap localStorage for Firebase/Supabase here; pages don't change.
   Reminder: client-side sign-in hides the UI only. Real protection needs the
   backend to verify the Google token. */
const KEY = 'hub.projects.v1';

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } }
function write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ } return items; }

export const listProjects = read;
export const saveProjects = write;
export const addProject = (p) => write([...read(), { ...p, id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5) }]);
export const updateProject = (id, patch) => write(read().map((x) => (x.id === id ? { ...x, ...patch } : x)));
export const removeProject = (id) => write(read().filter((x) => x.id !== id));
export function makeMain(id) {
  const items = read(); const i = items.findIndex((x) => x.id === id);
  if (i > 0) items.unshift(items.splice(i, 1)[0]);
  return write(items);
}

/* "example.com/x" -> safe https URL, or null */
export function normalizeUrl(raw) {
  let s = (raw || '').trim(); if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try { const u = new URL(s); return u.hostname.includes('.') || u.hostname === 'localhost' ? u.href : null; } catch { return null; }
}
export const domainOf = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return u; } };
