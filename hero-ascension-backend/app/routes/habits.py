"""
routes/habits.py
────────────────
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import get_supabase
from app.models.schemas import HabitCreate, HabitOut
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/habits", tags=["Habits"])


@router.get("/", response_model=list[HabitOut])
def list_habits(user_id: str = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("habits")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


@router.post("/", response_model=HabitOut, status_code=201)
def create_habit(body: HabitCreate, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    result = db.table("habits").insert({
        "id": body.id,
        "user_id": user_id,
        "title": body.title.strip(),
        "category": body.category,
        "monthly_goal": body.monthly_goal,
        "repeat_days": body.repeat_days,
        "priority": body.priority,
        "xp_reward": body.xp_reward,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create habit")

    return result.data[0]


@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    # Confirm ownership before delete
    check = (
        db.table("habits")
        .select("id")
        .eq("id", habit_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Habit not found")

    db.table("habits").delete().eq("id", habit_id).execute()
