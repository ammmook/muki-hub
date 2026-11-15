import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';
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
  'auth/operation-not-allowed': 'This sign-in method is not enabled yet. Turn it on under Authentication > Sign-in method in Firebase.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'auth/unauthorized-domain':
    'This site address is not allowed yet. Add it under Authentication > Settings > Authorized domains in Firebase.'
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
          name: u.isAnonymous ? 'Guest' : (u.displayName || u.email || 'Guest').split(' ')[0],
          guest: u.isAnonymous,
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

  const finishDemo = (u) => {
    try {
      localStorage.setItem(DEMO_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    setUser(u);
  };

  const signIn = useCallback(() => {
    setError('');
    if (isDemo) return finishDemo({ name: 'Owner', email: 'demo@local', demo: true, isOwner: true });
    signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') return;
      setError(ERRORS[e.code] || 'Sign-in failed. Try again.');
    });
  }, []);

  /* Guests get an anonymous Firebase session: they can read, but have no email, so the
     ".write" rule in database.rules.json always rejects them. */
  const signInGuest = useCallback(() => {
    setError('');
    if (isDemo) return finishDemo({ name: 'Guest', email: 'guest@local', demo: true, guest: true, isOwner: false });
    signInAnonymously(auth).catch((e) => setError(ERRORS[e.code] || 'Could not continue as a guest. Try again.'));
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

  return (
    <Ctx.Provider value={{ user: user || null, loading: user === undefined, error, signIn, signInGuest, signOut }}>{children}</Ctx.Provider>
  );
}
