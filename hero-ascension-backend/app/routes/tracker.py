"""
routes/tracker.py
─────────────────
POST /logs/toggle          →  check or uncheck a habit for a date
GET  /logs/today           →  get all logs for today
GET  /logs/{habit_id}      →  get 30-day log history for a habit
GET  /logs/summary/{date}  →  completion summary for a specific date
"""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_supabase
from app.models.schemas import LogToggleRequest, HabitLogOut
from app.services.auth_service import get_current_user
from app.services.streak_engine import calculate_streak
from app.services.xp_engine import get_tier_index

router = APIRouter(prefix="/logs", tags=["Logs"])


def _apply_xp(db, user_id: str, habit: dict, delta: int):
    """Add or subtract XP from the linked hero. Clamps to 0."""
    hero_res = (
        db.table("user_heroes")
        .select("total_xp, current_month_xp")
        .eq("user_id", user_id)
        .eq("hero_id", habit["hero_id"])
        .single()
        .execute()
    )
    if not hero_res.data:
        return

    row = hero_res.data
    new_total = max(0, row["total_xp"] + delta)
    new_month = max(0, row["current_month_xp"] + delta)
    new_tier = get_tier_index(new_total)

    db.table("user_heroes").update({
        "total_xp": new_total,
        "current_month_xp": new_month,
        "current_tier": new_tier,
    }).eq("user_id", user_id).eq("hero_id", habit["hero_id"]).execute()


@router.post("/toggle")
def toggle_log(body: LogToggleRequest, user_id: str = Depends(get_current_user)):
    """
    Toggle a habit log for a given date.
    - If not logged yet → mark complete, add XP, return streak
    - If already logged → mark incomplete, subtract XP, return streak
    """
    db = get_supabase()

    # Verify habit belongs to user and fetch xp_value + hero_id
    habit_res = (
        db.table("habits")
        .select("id, hero_id, xp_value")
        .eq("id", body.habit_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not habit_res.data:
        raise HTTPException(status_code=404, detail="Habit not found")

    habit = habit_res.data
    log_date_str = body.log_date.isoformat()

    # Check existing log
    existing = (
        db.table("habit_logs")
        .select("id, completed")
        .eq("habit_id", body.habit_id)
        .eq("user_id", user_id)
        .eq("log_date", log_date_str)
        .execute()
    )

    if existing.data:
        # Toggle existing record
        current_completed = existing.data[0]["completed"]
        new_completed = not current_completed
        log_id = existing.data[0]["id"]

        xp_delta = habit["xp_value"] if new_completed else -habit["xp_value"]
        _apply_xp(db, user_id, habit, xp_delta)

        streak = calculate_streak(body.habit_id, user_id)
        db.table("habit_logs").update({
            "completed": new_completed,
            "streak_count": streak,
        }).eq("id", log_id).execute()

        return {
            "habit_id": body.habit_id,
            "log_date": log_date_str,
            "completed": new_completed,
            "streak": streak,
            "xp_delta": xp_delta,
        }
    else:
        # Create new log (completed = True)
        _apply_xp(db, user_id, habit, habit["xp_value"])
        streak = calculate_streak(body.habit_id, user_id)

        db.table("habit_logs").insert({
            "habit_id": body.habit_id,
            "user_id": user_id,
            "log_date": log_date_str,
            "completed": True,
            "streak_count": streak,
        }).execute()

        return {
            "habit_id": body.habit_id,
            "log_date": log_date_str,
            "completed": True,
            "streak": streak,
            "xp_delta": habit["xp_value"],
        }


@router.get("/today")
def get_today_logs(user_id: str = Depends(get_current_user)):
    """Return all habit logs for today, with completion status."""
    db = get_supabase()
    today = date.today().isoformat()

    # Get all user habits
    habits_res = (
        db.table("habits")
        .select("id, name, hero_id, xp_value, frequency")
        .eq("user_id", user_id)
        .execute()
    )
    habits = habits_res.data or []
    if not habits:
        return []

    habit_ids = [h["id"] for h in habits]

    # Get today's logs
    logs_res = (
        db.table("habit_logs")
        .select("habit_id, completed, streak_count")
        .eq("user_id", user_id)
        .in_("habit_id", habit_ids)
        .eq("log_date", today)
        .execute()
    )
    logs_by_habit = {r["habit_id"]: r for r in (logs_res.data or [])}

    return [
        {
            **h,
            "completed": logs_by_habit.get(h["id"], {}).get("completed", False),
            "streak": logs_by_habit.get(h["id"], {}).get("streak_count", 0),
        }
        for h in habits
    ]


@router.get("/history/{habit_id}")
def get_habit_history(habit_id: str, days: int = 30, user_id: str = Depends(get_current_user)):
    """Return the last N days of log data for one habit (calendar grid)."""
    db = get_supabase()

    # Verify ownership
    check = (
        db.table("habits")
        .select("id")
        .eq("id", habit_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Habit not found")

    today = date.today()
    start = (today - timedelta(days=days - 1)).isoformat()

    logs_res = (
        db.table("habit_logs")
        .select("log_date, completed")
        .eq("habit_id", habit_id)
        .eq("user_id", user_id)
        .gte("log_date", start)
        .order("log_date")
        .execute()
    )
    logs_by_date = {r["log_date"]: r["completed"] for r in (logs_res.data or [])}

    # Build full date range including missing days
    result = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        d_str = d.isoformat()
        result.append({
            "date": d_str,
            "done": logs_by_date.get(d_str, False),
            "is_today": i == 0,
        })

    return result


@router.get("/summary/{log_date}")
def get_date_summary(log_date: date, user_id: str = Depends(get_current_user)):
    """Overall completion summary for a specific date."""
    db = get_supabase()

    habits_res = (
        db.table("habits")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )
    total = len(habits_res.data or [])
    if total == 0:
        return {"date": log_date.isoformat(), "total": 0, "done": 0, "pct": 0}

    habit_ids = [h["id"] for h in habits_res.data]

    logs_res = (
        db.table("habit_logs")
        .select("id")
        .eq("user_id", user_id)
        .in_("habit_id", habit_ids)
        .eq("log_date", log_date.isoformat())
        .eq("completed", True)
        .execute()
    )
    done = len(logs_res.data or [])

    return {
        "date": log_date.isoformat(),
        "total": total,
        "done": done,
        "pct": round((done / total) * 100) if total else 0,
    }
