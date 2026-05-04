"""
models/schemas.py
─────────────────
All Pydantic request/response schemas.
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


# ── Users & Profiles ──────────────────────────────────────────────────

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class ProfileOut(BaseModel):
    user_id: str
    selected_hero_id: Optional[str]
    xp: int
    onboarded: bool
    updated_at: datetime

class ProfileUpdate(BaseModel):
    selected_hero_id: Optional[str] = None
    xp: Optional[int] = None
    onboarded: Optional[bool] = None


# ── Heroes (Legacy Support) ───────────────────────────────────────────

class HeroSelectRequest(BaseModel):
    hero_ids: list[str] = Field(..., min_length=1)

class UserHeroOut(BaseModel):
    id: str
    user_id: str
    hero_id: str
    current_tier: int
    total_xp: int
    current_month_xp: int


# ── Habits ────────────────────────────────────────────────────────────

class HabitCreate(BaseModel):
    id: str # h_uuid from frontend
    title: str = Field(..., min_length=1, max_length=200)
    category: str = "fitness"
    monthly_goal: int = 25
    repeat_days: list[str] = []
    priority: str = "medium"
    xp_reward: int = 20


class HabitOut(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    monthly_goal: int
    repeat_days: list[str]
    priority: str
    xp_reward: int
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
    created_at: datetime


# ── Goals (Legacy Support) ───────────────────────────────────────────

class GoalCreate(BaseModel):
    hero_id: str
    title: str
    target_value: int
    deadline: Optional[date] = None

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

class GoalProgressUpdate(BaseModel):
    current_value: int


# ── Calendar Todos ────────────────────────────────────────────────────

class TodoCreate(BaseModel):
    id: str # ct_timestamp
    todo_date: date
    title: str
    completed: bool = False

class TodoOut(BaseModel):
    id: str
    user_id: str
    todo_date: date
    title: str
    completed: bool
    created_at: datetime


# ── Sync ──────────────────────────────────────────────────────────────

class SyncStateResponse(BaseModel):
    profile: ProfileOut
    habits: list[HabitOut]
    logs: dict[str, bool] # key: habitId_dateStr
    calendar_todos: dict[str, list[TodoOut]] # key: dateStr
