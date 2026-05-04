"""
app/main.py
────────────
FastAPI application entry point.
All routers are registered here. CORS is configured for the frontend URL.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import (
    auth_router,
    heroes_router,
    habits_router,
    tracker_router,
    goals_router,
    dashboard_router,
    sync_router,
)

load_dotenv()

# ── App instance ──────────────────────────────────────────────────────
app = FastAPI(
    title="Hero Ascension API",
    description="Gamified habit tracker backend — tracks XP, streaks, and hero evolution.",
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc UI
)

# ── CORS ──────────────────────────────────────────────────────────────
# Allows the React frontend (localhost:5173 in dev) to call this API.
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(heroes_router)
app.include_router(habits_router)
app.include_router(tracker_router)
app.include_router(goals_router)
app.include_router(dashboard_router)
app.include_router(sync_router)


# ── Health check ──────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "online", "app": "Hero Ascension API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
