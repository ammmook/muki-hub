import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
import { auth, isDemo } from './firebase.js';
import { startSync, stopSync } from './store.js';

export { isDemo };

const DEMO_KEY = 'hub.user.v1';
const OWNERS = (import.meta.env.VITE_OWNER_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/* UI only. The real check is the ".write" rule in database.rules.json, so editing
   this list (or the page in dev tools) never grants write access. */
const ownerOf = (email, verified) => verified && OWNERS.includes((email || '').toLowerCase());

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const loadDemo = () => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_KEY));
  } catch {
    return null;
  }
};

const ERRORS = {
  'auth/popup-blocked': 'The browser blocked the Google window. Allow pop-ups, then try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/unauthorized-domain': 'This site address is not allowed yet. Add it under Authentication > Settings > Authorized domains in Firebase.'
};

export function AuthProvider({ children }) {
  // undefined = still checking, null = signed out
  const [user, setUser] = useState(isDemo ? loadDemo : undefined);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isDemo) return;
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser({
          uid: u.uid,
          name: (u.displayName || u.email || 'Guest').split(' ')[0],
          email: u.email,
          picture: u.photoURL,
          isOwner: ownerOf(u.email, u.emailVerified)
        });
        startSync();
      } else {
        stopSync();
        setUser(null);
      }
    });
  }, []);

  const signIn = useCallback(() => {
    setError('');
    if (isDemo) {
      const u = { name: 'Owner', email: 'demo@local', demo: true, isOwner: true };
      try {
        localStorage.setItem(DEMO_KEY, JSON.stringify(u));
      } catch {
        /* ignore */
      }
      return setUser(u);
    }
    signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      setError(ERRORS[e.code] || 'Sign-in failed. Try again.');
    });
  }, []);

  const signOut = useCallback(() => {
    if (isDemo) {
      try {
        localStorage.removeItem(DEMO_KEY);
      } catch {
        /* ignore */
      }
      return setUser(null);
    }
    fbSignOut(auth);
  }, []);

  return <Ctx.Provider value={{ user: user || null, loading: user === undefined, error, signIn, signOut }}>{children}</Ctx.Provider>;
}
