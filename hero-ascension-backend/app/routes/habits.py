"""
routes/habits.py
────────────────
GET    /habits          →  list all user's habits
POST   /habits          →  create a habit
DELETE /habits/{id}     →  delete a habit
GET    /habits/{id}/streak  →  get streak for one habit
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import get_supabase
from app.models.schemas import HabitCreate, HabitOut
from app.services.auth_service import get_current_user
from app.services.streak_engine import calculate_streak

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

    # Verify the hero belongs to this user
    hero_check = (
        db.table("user_heroes")
        .select("id")
        .eq("user_id", user_id)
        .eq("hero_id", body.hero_id)
        .execute()
    )
    if not hero_check.data:
        raise HTTPException(
            status_code=400,
            detail="Hero not found. Select this hero first.",
        )

    result = db.table("habits").insert({
        "user_id": user_id,
        "hero_id": body.hero_id,
        "name": body.name.strip(),
        "frequency": body.frequency,
        "xp_value": body.xp_value,
    }).execute()

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


@router.get("/{habit_id}/streak")
def get_streak(habit_id: str, user_id: str = Depends(get_current_user)):
    streak = calculate_streak(habit_id, user_id)
    return {"habit_id": habit_id, "streak": streak}
