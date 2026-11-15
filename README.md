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

## Google sign-in + Firebase (who can do what)

| Person | See sites | Open sites | Add / edit / delete / reorder |
| --- | --- | --- | --- |
| Not signed in | no | no | no |
| Guest ("Continue as a guest") or any other Google account | yes | yes | **no** |
| Owner (your Google account) | yes | yes | **yes** |

"Who can edit" is enforced by Firebase on its servers (`database.rules.json`), not by the page.
Hiding the Manage button is only for looks.

### One-time setup

1. [Firebase console](https://console.firebase.google.com) > **Add project**.
2. **Build > Authentication > Get started > Sign-in method > Google > Enable** (pick a support email).
2b. Same page: **Anonymous > Enable** (this is what "Continue as a guest" uses).
3. **Authentication > Settings > Authorized domains**: add the domain you deploy to (`localhost` is already there).
4. **Build > Realtime Database > Create database** (start in locked mode). Copy its URL.
5. **Project settings > Your apps > Web (</>)**: register an app and copy the config into `.env.local` (see `.env.example`).
6. Publish the rules: paste `database.rules.json` into **Realtime Database > Rules > Publish**,
   or run `npx firebase-tools deploy --only database`.
7. In `database.rules.json` and `VITE_OWNER_EMAILS`, use **your** Google email.
   To add a second owner, extend the rule: `auth.token.email === 'a@x.com' || auth.token.email === 'b@x.com'`.
8. Sign in once with the owner account and add your sites. Open the site in a second account to check it is read-only.

With no `VITE_FIREBASE_*` values the app runs in **demo mode**: the Google button signs in as a local demo user and data stays in `localStorage`.

The Firebase config is public by design. Safety comes from the rules, so never leave the database in "test mode".

## Project map

```
src/
  main.jsx                 routes: /  and  /manage
  firebase.js              Firebase init (demo mode when not configured)
  auth.jsx                 Google sign-in via Firebase Auth, owner vs viewer
  store.js                 site list + useProjects() hook (Realtime Database, live sync)
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
