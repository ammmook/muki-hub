# Muki Hub

One private page that lists every website Muki has built and opens each one in a new tab.
Vite + React, styled with the Forest Hub design system (night theme).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` (adds a Content-Security-Policy meta tag) |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests (store, reorder logic) |
| `npm run format` | Prettier check |

## Google sign-in

Copy `.env.example` to `.env.local` and set:

- `VITE_GOOGLE_CLIENT_ID`: an OAuth **Web** client ID. Add your site origin (for example `http://localhost:5173`) to its Authorized JavaScript origins.
- `VITE_OWNER_EMAILS`: comma-separated Google accounts allowed in.

With no client ID the app runs in **demo mode**: the Google button signs in as a local demo user.

> **Security note.** Sign-in and data are client-side only (the signed-in user and the site list live in `localStorage`). That hides the UI but does not protect data. Before putting real data online, move the list to a backend that verifies the Google ID token (for example Supabase or Firebase with row-level rules). The data layer is `src/store.js`; sign-in is `src/auth.jsx`.

## Project map

```
src/
  main.jsx                 routes: /  and  /manage
  auth.jsx                 Google sign-in (loads Google's script only when configured)
  store.js                 site list + useProjects() hook (syncs across tabs)
  lib/reorder.js           pure list helpers (tested)
  brand.js                 name and Thai tagline
  pages/Home.jsx           hero, 3D ring, drag-to-reorder board
  pages/Manage.jsx         add, edit, remove (with undo), make main
  components/
    SortableBoard.jsx      mouse + touch + keyboard reordering
    ForestScene.jsx        forest photo and falling leaves (canvas)
    Modal.jsx              accessible dialog (focus trap, close button)
  vendor/                  compiled Forest Hub design-system bundle (needs window.React)
  assets/                  web-ready images (WebP); originals are in assets-src/
```

## Notes

- Interface text is English; Thai content uses `lang="th"` so the Thai fonts (Noto Sans/Serif Thai) apply.
- Touch reordering: press and hold a card for about a quarter of a second, then drag.
- `assets-src/` holds the original PNGs. Regenerate the WebP files if you replace them.
