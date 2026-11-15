import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production-only Content-Security-Policy (dev needs inline scripts for hot reload).
// Firebase (sign-in popup + Realtime Database) and Google Fonts are the only third-party origins.
const CSP = [
  "default-src 'self'",
  "script-src 'self' https://apis.google.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com/gsi/style",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: https://*.googleusercontent.com",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebasedatabase.app wss://*.firebasedatabase.app",
  'frame-src https://accounts.google.com https://*.firebaseapp.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

const csp = {
  name: 'csp-meta',
  apply: 'build',
  transformIndexHtml: (html) => html.replace('<head>', `<head>\n<meta http-equiv="Content-Security-Policy" content="${CSP}">`)
};

export default defineConfig({
  plugins: [react(), csp],
  server: { port: 5173 },
  // tests always run in demo mode, even when .env.local holds real Firebase values
  test: { environment: 'jsdom', env: { VITE_FIREBASE_API_KEY: '', VITE_FIREBASE_DATABASE_URL: '' }, include: ['src/**/*.test.{js,jsx}'] }
});
