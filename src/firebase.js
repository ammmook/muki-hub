/* Firebase setup. Everything is optional: with no VITE_FIREBASE_* values the app
   runs in demo mode (localStorage, fake sign-in) so `npm run dev` works offline.

   The config below is NOT a secret (it ships to every browser). What protects the
   data is database.rules.json, which Firebase enforces on its servers. */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const env = import.meta.env;
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

export const isDemo = !(config.apiKey && config.authDomain && config.databaseURL && config.projectId);

const app = isDemo ? null : initializeApp(config);
export const auth = app && getAuth(app);
export const db = app && getDatabase(app);
