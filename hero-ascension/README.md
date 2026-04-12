# ⚡ Hero Ascension — Frontend

A gamified habit tracker with superhero-inspired identities.
Built with React + Tailwind CSS. Runs 100% in the browser — no server required.
All data is persisted to `localStorage`.

---

## How to Run (Step by Step)

### Prerequisites
You need **Node.js** installed. Download it from https://nodejs.org (LTS version).
To check if you have it: open Terminal and run `node -v`

---

### Step 1 — Open Terminal in this folder
- On Mac: right-click the `hero-ascension` folder → "Open in Terminal"
- On Windows: open the folder, click the address bar, type `cmd`, press Enter

### Step 2 — Install dependencies (one time only)
```bash
npm install
```
This downloads all the libraries the app needs. Takes ~30 seconds.

### Step 3 — Start the app
```bash
npm run dev
```
You'll see something like:
```
  VITE v5.x.x  ready in 500ms
  ➜  Local: http://localhost:5173/
```

### Step 4 — Open in browser
Go to: **http://localhost:5173**

That's it. The app is running! 🎉

---

## What Each File Does

```
src/
├── main.jsx              # Starts the React app
├── App.jsx               # Handles page routing (which screen to show)
├── index.css             # All global styles and Tailwind config
│
├── context/
│   └── AppContext.jsx    # Global state (user, habits, XP, heroes)
│                           All data logic lives here
│
├── components/           # Reusable UI pieces
│   ├── Layout.jsx        # Top bar + bottom navigation wrapper
│   ├── HeroCard.jsx      # Hero display card (select screen + compact)
│   ├── XPBar.jsx         # Animated progress bar (colored per hero)
│   ├── StreakBadge.jsx   # Streak counter badge (🔥 for hot streaks)
│   ├── CalendarGrid.jsx  # 30-day completion grid dots
│   └── StatCard.jsx      # Numeric stat display card
│
└── pages/                # Full screens
    ├── Login.jsx          # Sign up / login screen
    ├── HeroSelect.jsx     # Pick your hero identities
    ├── HabitSetup.jsx     # Add habits and goals
    ├── Dashboard.jsx      # Daily tracker (check off habits)
    └── HeroProgress.jsx   # Hero evolution + performance stats
```

---

## User Flow

1. **Login / Sign Up** → creates a local user session
2. **Hero Selection** → pick 1–6 heroes (life domains)
3. **Habit & Goal Setup** → add daily habits per hero + major goals
4. **Dashboard** → check off habits daily, see XP accumulate
5. **Hero Progress** → see each hero's tier, streaks, monthly stats

---

## How XP & Evolution Works

| Action | XP |
|--------|----|
| Check off a habit | +10 XP to that hero |
| Uncheck a habit | −10 XP |

| Tier | XP Required |
|------|-------------|
| Tier 0 (e.g. Warrior) | 0 XP |
| Tier 1 (e.g. Protector) | 500 XP |
| Tier 2 (e.g. King) | 1,500 XP |
| Tier 3 (e.g. Legend) | 3,500 XP |

Monthly evaluation (shown in Hero Progress):
- **≥ 80% habits complete** → on track to evolve
- **50–79%** → holding current tier
- **< 50%** → at risk

---

## To Build for Production

```bash
npm run build
```
Creates a `dist/` folder you can deploy to any static host (Netlify, Vercel, GitHub Pages).

---

## Next Steps (Backend Integration)

When you add the FastAPI backend:
1. Replace the `login()` function in `AppContext.jsx` with a real API call
2. Replace `localStorage` saves with API calls to your FastAPI endpoints
3. The data structures in `AppContext.jsx` match the database schema exactly
