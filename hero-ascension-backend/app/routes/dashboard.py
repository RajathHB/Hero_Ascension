"""
routes/dashboard.py
────────────────────
GET /dashboard  →  one-shot summary for the frontend dashboard screen
"""

from datetime import date
from fastapi import APIRouter, Depends
from app.db import get_supabase
from app.services.auth_service import get_current_user
from app.services.xp_engine import get_tier_index, get_tier_name, xp_to_next_tier

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/")
def get_dashboard(user_id: str = Depends(get_current_user)):
    """
    Returns everything the Dashboard screen needs in one request:
    - today's habit completion
    - total XP
    - heroes with tier info
    - active goal count
    """
    db = get_supabase()
    today = date.today().isoformat()

    # ── Habits ───────────────────────────────────────────────────────
    habits_res = db.table("habits").select("id, hero_id").eq("user_id", user_id).execute()
    habits = habits_res.data or []
    total_habits = len(habits)
    habit_ids = [h["id"] for h in habits]

    done_today = 0
    if habit_ids:
        logs_res = (
            db.table("habit_logs")
            .select("id")
            .eq("user_id", user_id)
            .in_("habit_id", habit_ids)
            .eq("log_date", today)
            .eq("completed", True)
            .execute()
        )
        done_today = len(logs_res.data or [])

    # ── Heroes ───────────────────────────────────────────────────────
    heroes_res = db.table("user_heroes").select("*").eq("user_id", user_id).execute()
    total_xp = sum(h["total_xp"] for h in (heroes_res.data or []))

    heroes_enriched = []
    for row in heroes_res.data or []:
        xp = row["total_xp"]
        tier_idx = get_tier_index(xp)
        progress = xp_to_next_tier(xp)
        heroes_enriched.append({
            "hero_id": row["hero_id"],
            "total_xp": xp,
            "current_tier": tier_idx,
            "tier_name": get_tier_name(row["hero_id"], tier_idx),
            "tier_pct": progress["pct"],
            "xp_to_next": progress["xp_needed"],
        })

    # ── Goals ────────────────────────────────────────────────────────
    goals_res = (
        db.table("goals")
        .select("id")
        .eq("user_id", user_id)
        .eq("status", "active")
        .execute()
    )
    active_goals = len(goals_res.data or [])

    return {
        "date": today,
        "total_habits": total_habits,
        "done_today": done_today,
        "overall_pct": round((done_today / total_habits * 100)) if total_habits else 0,
        "total_xp": total_xp,
        "active_goals": active_goals,
        "heroes": heroes_enriched,
    }
