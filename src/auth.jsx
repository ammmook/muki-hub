import { createContext, useContext, useState, useCallback } from 'react';

const USER_KEY = 'hub.user.v1';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const OWNERS = (import.meta.env.VITE_OWNER_EMAILS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
export const isDemo = !CLIENT_ID;

/* Load Google's script only when real sign-in is configured, and only when needed. */
let gsi;
const loadGsi = () =>
  (gsi ||= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      gsi = null;
      reject(new Error('gsi'));
    };
    document.head.appendChild(s);
  }));

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};
const decode = (t) => JSON.parse(decodeURIComponent(escape(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))));

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load);
  const [error, setError] = useState('');

  const finish = (u) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setUser(u);
  };

  const startGoogle = useCallback((g) => {
    g.initialize({
      client_id: CLIENT_ID,
      callback: (res) => {
        try {
          const p = decode(res.credential);
          if (OWNERS.length && !OWNERS.includes(p.email)) return setError('This Google account is not the hub owner.');
          finish({ name: p.given_name || p.name, email: p.email, picture: p.picture });
        } catch {
          setError('Could not read the Google account details. Try again.');
        }
      }
    });
    g.prompt((n) => {
      if (n.isNotDisplayed?.()) setError('The browser blocked the Google window. Allow pop-ups, then try again.');
    });
  }, []);

  const signIn = useCallback(() => {
    setError('');
    if (isDemo) return finish({ name: 'Owner', email: 'demo@local', demo: true });
    loadGsi().then(
      () => startGoogle(window.google.accounts.id),
      () => setError('Google sign-in did not load. Refresh the page and try again.')
    );
  }, [startGoogle]);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    window.google?.accounts?.id?.disableAutoSelect?.();
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, error, signIn, signOut }}>{children}</Ctx.Provider>;
}
