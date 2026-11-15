<div align="center">

<img src="assets-src/bg-forest.png" alt="Muki Hub forest" width="100%" />

# 🍃 Muki <em>Hub</em> 🍃

**แหล่งรวมเว็บของมุกกี้**
*one quiet clearing in the forest, where every site Muki has grown lives*

### 🌿 [Visit the live site → muki-hub.vercel.app](https://muki-hub.vercel.app/) 🌿

![React](https://img.shields.io/badge/React-18-55793a?style=for-the-badge&logo=react&logoColor=cdee6b&labelColor=0c1a12)
![Vite](https://img.shields.io/badge/Vite-5-55793a?style=for-the-badge&logo=vite&logoColor=cdee6b&labelColor=0c1a12)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20RTDB-55793a?style=for-the-badge&logo=firebase&logoColor=cdee6b&labelColor=0c1a12)
![Vercel](https://img.shields.io/badge/Hosted%20on-Vercel-55793a?style=for-the-badge&logo=vercel&logoColor=cdee6b&labelColor=0c1a12)
![Theme](https://img.shields.io/badge/theme-forest%20night-1f4a2f?style=for-the-badge&labelColor=0c1a12)

</div>

<br />

```
        🌿        🍃              🌿
   🍃        🌿        🍃    🌿        🍃
```

## 🌱 Why this exists

Muki has built a lot of websites, each on its own domain, with links that are hard to remember
and no single place that shows what is live, what is still growing, and what is resting.

**Muki Hub** is that place: one small forest page where every site becomes a leaf-shaped card.
Open any site in one click, drag the cards into your own order, and pin the most important one
as the *main* site at the front.

## 🍃 What you can do

| | |
|---|---|
| 🌿 **Site cards** | Drag to reorder with a mouse, press and hold on touch, or use the keyboard. The first card is the main site. |
| 🍂 **Status** | Live · Building · Paused, so you see at a glance where each site stands. |
| 🌳 **Most used** | A 3D ring of your favorite sites. Scroll inside it to turn through them. |
| 🔐 **Google sign-in** | Sign in with Google, or continue as a guest to look around. |
| ✏️ **Manage** | Only the owner can add, edit, delete (with Undo) and change the main site. |
| 🧭 **Floating menu** | A header that stays on screen, with a highlight that glides to the section you are reading. |
| ⚡ **Realtime** | Change something on one device and every other device updates instantly. |

## 🌲 What it is built with

| Layer | Technology | Why |
|---|---|---|
| Front end | **React 18** + **React Router 6** | Simple pages (`/` and `/manage`) that re-render as the data changes. |
| Build tool | **Vite 5** | Instant dev server, fast and small production builds. |
| Sign-in | **Firebase Authentication** (Google, Anonymous) | No password system to build or secure. |
| Database | **Firebase Realtime Database** | Live sync across devices, with no server of your own to run. |
| Design | **Forest Hub design system** + hand-written CSS | A leaf theme with a night palette of moss and lime. |
| Testing | **Vitest**, **ESLint**, **Prettier** | Guards the storage and reordering logic against regressions. |
| CI | **GitHub Actions** | Runs lint, tests and build on every push. |
| Hosting | **Vercel** | Deploys the static build at [muki-hub.vercel.app](https://muki-hub.vercel.app/). |

## 🍁 How data and permissions work

```
   Visitor ──▶ Google / Guest ──▶ Firebase Auth ──▶ Realtime Database  /projects
                                                          ▲
                          rules (database.rules.json) are enforced on Firebase's servers
```

| Who | View sites | Add / edit / delete / reorder |
|---|---|---|
| Not signed in | ✖ | ✖ |
| Guest or any Google account | ✔ | ✖ |
| Owner (the configured email) | ✔ | ✔ |

Hiding the buttons in the page is only for looks. **The real protection is the Firebase Security Rules.**
Even if someone opens the dev tools and tries to write data directly, Firebase rejects it.
The Firebase web config is public by design and is not a secret. Safety comes from the rules, not from the key.

## 🌿 Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Without `VITE_FIREBASE_*` values in `.env.local` the app runs in **demo mode**:
a fake local sign-in, with data kept in `localStorage`. It is handy for trying things out without Firebase.

| Command | What it does |
|---|---|
| `npm run build` | Production build into `dist/` |
| `npm run lint` | Check the code with ESLint |
| `npm test` | Run the unit tests |
| `npm run format` | Check formatting with Prettier |

The full Firebase setup (create the project, enable Google and Anonymous sign-in, publish the rules) is in [CLAUDE.md](CLAUDE.md).

## 🍃 Project map

```
src/
  main.jsx            routes
  firebase.js         Firebase setup (demo mode when not configured)
  auth.jsx            Google / guest sign-in, owner vs viewer
  store.js            site list + useProjects() hook with live sync
  pages/              Home, Manage
  components/         Nav, SortableBoard, ForestScene, Modal, ...
  vendor/             Forest Hub design system
database.rules.json   Realtime Database permission rules
```

<br />

<div align="center">

```
   🌿   grown with care by Muki   🌿
```

*Every leaf is a website.*

</div>
