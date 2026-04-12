"""
models/schemas.py
─────────────────
All Pydantic request/response schemas in one file.
Kept flat and simple — no deep nesting.
"""

from __future__ import annotations
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import date, datetime


# ── Auth ──────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    email: str


# ── Users ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime


# ── Heroes ────────────────────────────────────────────────────────────

class HeroSelectRequest(BaseModel):
    hero_ids: list[str] = Field(..., min_length=1)


class UserHeroOut(BaseModel):
    id: str
    user_id: str
    hero_id: str
    current_tier: int       # 0 = base tier
    total_xp: int
    current_month_xp: int


# ── Habits ────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    hero_id: str
    frequency: Literal["daily", "weekdays", "weekly"] = "daily"
    xp_value: int = Field(default=10, ge=1, le=100)


class HabitOut(BaseModel):
    id: str
    user_id: str
    hero_id: str
    name: str
    frequency: str
    xp_value: int
    created_at: datetime


# ── Habit Logs ────────────────────────────────────────────────────────

class LogToggleRequest(BaseModel):
    habit_id: str
    log_date: date = Field(default_factory=date.today)


class HabitLogOut(BaseModel):
    id: str
    habit_id: str
    user_id: str
    log_date: date
    completed: bool
    streak_count: int


# ── Goals ─────────────────────────────────────────────────────────────

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    hero_id: str
    target_value: int = Field(default=100, ge=1)
    deadline: Optional[date] = None


class GoalProgressUpdate(BaseModel):
    current_value: int = Field(..., ge=0)


class GoalOut(BaseModel):
    id: str
    user_id: str
    hero_id: str
    title: str
    target_value: int
    current_value: int
    deadline: Optional[date]
    status: str
    created_at: datetime


# ── Monthly Evaluation ────────────────────────────────────────────────

class MonthlyEvalOut(BaseModel):
    hero_id: str
    month: int
    year: int
    habits_target: int
    habits_done: int
    completion_rate: float
    xp_earned: int
    evolved: bool
    new_tier: int
    tier_name: str


# ── Dashboard summary ─────────────────────────────────────────────────

class DashboardOut(BaseModel):
    total_habits: int
    done_today: int
    overall_pct: int
    total_xp: int
    active_goals: int
    heroes: list[dict]
