# ⚡ Hero Ascension — Backend API

Python FastAPI backend for Hero Ascension.
Connects to Supabase for data storage.
Handles auth, XP, streaks, and monthly hero evolution.

---

## Folder Structure

```
hero-ascension-backend/
│
├── app/
│   ├── main.py                  # FastAPI app, CORS, all routers registered
│   │
│   ├── routes/                  # One file per feature area
│   │   ├── auth.py              # POST /auth/signup, /auth/login, GET /auth/me
│   │   ├── heroes.py            # GET /heroes/roster, POST /heroes/select, etc.
│   │   ├── habits.py            # CRUD for habits
│   │   ├── tracker.py           # POST /logs/toggle, GET /logs/today, etc.
│   │   ├── goals.py             # CRUD for goals + progress update
│   │   └── dashboard.py         # GET /dashboard — one-shot summary
│   │
│   ├── models/
│   │   └── schemas.py           # All Pydantic request/response models
│   │
│   ├── services/                # Business logic (no routes, no DB calls except what's needed)
│   │   ├── auth_service.py      # JWT creation/verification, password hashing
│   │   ├── xp_engine.py         # XP math, tier calculation (pure functions)
│   │   ├── streak_engine.py     # Streak calculation from habit_logs
│   │   └── evolution.py         # Monthly hero evaluation logic
│   │
│   └── db/
│       └── supabase_client.py   # Shared Supabase client (lazy singleton)
│
├── frontend-api-client/
│   └── client.js                # Drop-in API client for the React frontend
│
├── schema.sql                   # Run this in Supabase SQL Editor to create all tables
├── .env.example                 # Copy to .env and fill in your keys
├── requirements.txt             # Python dependencies
└── README.md
```

---

## Step-by-Step Setup

### Step 1 — Set up Supabase

1. Go to **https://supabase.com** and create a free account
2. Click **"New project"** → give it a name → set a database password → create
3. Wait ~2 minutes for the project to be ready
4. Go to **SQL Editor** (left sidebar) → click **"New query"**
5. Open `schema.sql` from this folder, paste the entire contents, click **Run**
6. All 6 tables are now created ✓

### Step 2 — Get your Supabase keys

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **service_role key** (under "Project API keys" — the secret one, not anon)

### Step 3 — Create your .env file

```bash
# In the hero-ascension-backend folder:
cp .env.example .env
```

Open `.env` and fill in:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=any-long-random-string-here
```

To generate a strong JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 4 — Install Python (if not already installed)

Download from https://python.org (version 3.11 or 3.12 recommended).
Check if installed: `python --version`

### Step 5 — Create a virtual environment

```bash
# Inside the hero-ascension-backend folder:
python -m venv venv
```

Activate it:
- **Mac/Linux:** `source venv/bin/activate`
- **Windows:**   `venv\Scripts\activate`

You'll see `(venv)` appear in your terminal — that means it's active.

### Step 6 — Install dependencies

```bash
pip install -r requirements.txt
```

This downloads FastAPI, Supabase client, JWT library, etc. (~30 seconds)

### Step 7 — Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

You'll see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### Step 8 — Test it

Open your browser and go to:
- **http://localhost:8000** → should show `{"status": "online"}`
- **http://localhost:8000/docs** → interactive Swagger UI with all endpoints

---

## All API Endpoints

### Auth
| Method | Path | What it does |
|--------|------|-------------|
| POST | `/auth/signup` | Create account, returns JWT token |
| POST | `/auth/login` | Login, returns JWT token |
| GET | `/auth/me` | Get current user info |

### Heroes
| Method | Path | What it does |
|--------|------|-------------|
| GET | `/heroes/roster` | List all available heroes |
| POST | `/heroes/select` | Save user's chosen heroes |
| GET | `/heroes/my` | Get user's heroes with XP and tier |
| POST | `/heroes/evaluate` | Run monthly evaluation for all heroes |
| POST | `/heroes/evaluate/{hero_id}` | Run evaluation for one hero |

### Habits
| Method | Path | What it does |
|--------|------|-------------|
| GET | `/habits/` | List all user's habits |
| POST | `/habits/` | Create a habit |
| DELETE | `/habits/{id}` | Delete a habit |
| GET | `/habits/{id}/streak` | Get current streak for a habit |

### Daily Logs
| Method | Path | What it does |
|--------|------|-------------|
| POST | `/logs/toggle` | Check or uncheck a habit for a date |
| GET | `/logs/today` | All habits with today's completion status |
| GET | `/logs/history/{habit_id}` | 30-day calendar data for a habit |
| GET | `/logs/summary/{date}` | Completion summary for any date |

### Goals
| Method | Path | What it does |
|--------|------|-------------|
| GET | `/goals/` | List all goals |
| POST | `/goals/` | Create a goal |
| PATCH | `/goals/{id}` | Update goal progress |
| DELETE | `/goals/{id}` | Delete a goal |

### Dashboard
| Method | Path | What it does |
|--------|------|-------------|
| GET | `/dashboard/` | Full summary — habits, XP, heroes, goals |

---

## How XP Works

```
Every habit check     →  +xp_value to linked hero (default: 10)
Every habit uncheck   →  -xp_value from linked hero (min 0)

Tier thresholds:
  Tier 0 (base)   →    0 XP
  Tier 1          →  500 XP
  Tier 2          → 1500 XP
  Tier 3 (max)   → 3500 XP
```

## How Monthly Evolution Works

Call `POST /heroes/evaluate` at the end of each month.

```
≥ 80% habits completed  →  +200 XP bonus  →  may evolve to next tier
50–79%                  →  no change
< 50%                   →  -100 XP (never drops below current tier floor)
```

---

## Connecting the Frontend

### Step 1 — Add the API URL to your frontend

In your `hero-ascension` (frontend) folder, create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

### Step 2 — Copy the API client

Copy `frontend-api-client/client.js` into your frontend:
```
hero-ascension/src/api/client.js
```

### Step 3 — Update AppContext to use real API calls

Replace the localStorage-based functions in `AppContext.jsx` with API calls.

**Example — replace login:**
```js
// BEFORE (localStorage only):
const login = (email, name) => {
  setUser({ email, name, joinedAt: new Date().toISOString() })
}

// AFTER (real API):
import { login as apiLogin } from '../api/client'

const login = async (email, password) => {
  const data = await apiLogin(email, password)
  setUser({ email: data.email, name: data.name, id: data.user_id })
}
```

**Example — replace toggleHabitLog:**
```js
// BEFORE (localStorage):
const toggleHabitLog = (habitId, date) => {
  // ... localStorage logic
}

// AFTER (real API):
import { toggleLog } from '../api/client'

const toggleHabitLog = async (habitId, date) => {
  const result = await toggleLog(habitId, date)
  // result.completed, result.streak, result.xp_delta
  // Re-fetch state from API after toggle
}
```

### Step 4 — Run both servers together

Open **two terminals**:

Terminal 1 (backend):
```bash
cd hero-ascension-backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Terminal 2 (frontend):
```bash
cd hero-ascension
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:8000
API Docs: http://localhost:8000/docs

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `SUPABASE_URL not set` | Check your `.env` file exists and has the right values |
| `401 Unauthorized` | Token expired or wrong — log in again |
| `400 Hero not found` | Call `POST /heroes/select` before creating habits |
| CORS error in browser | Make sure `FRONTEND_URL` in `.env` matches your frontend URL |
| `ModuleNotFoundError` | Make sure your venv is activated (`source venv/bin/activate`) |
