"""
services/evolution.py
──────────────────────
Monthly hero evaluation logic.

Rules:
  ≥ 80% habit completion  →  hero earns bonus XP + may evolve
  50–79%                  →  no change
  < 50%                   →  hero loses XP (never below tier floor)

This can be called:
  • Manually via POST /heroes/evaluate (for testing)
  • Automatically via a cron job / Supabase Edge Function at month end
"""

from datetime import date
import calendar
from app.db import get_supabase
from app.services.xp_engine import (
    get_tier_index,
    get_tier_name,
    TIER_XP_THRESHOLDS,
)

# Bonus / penalty XP applied during evaluation
EVOLUTION_BONUS_XP = 200
DEMOTION_PENALTY_XP = 100


def evaluate_hero_for_month(
    user_id: str,
    hero_id: str,
    month: int,
    year: int,
) -> dict:
    """
    Evaluate a single hero for the given month.
    Returns evaluation result and updates user_heroes in Supabase.
    """
    db = get_supabase()

    # ── 1. Get all habits for this hero ──────────────────────────────
    habits_res = (
        db.table("habits")
        .select("id, created_at")
        .eq("user_id", user_id)
        .eq("hero_id", hero_id)
        .execute()
    )
    habits = habits_res.data or []
    if not habits:
        return {"error": "No habits found for this hero"}

    habit_ids = [h["id"] for h in habits]

    # ── 2. Count expected vs actual completions ───────────────────────
    #    Respect each habit's created_at so new habits aren't penalized
    days_in_month = calendar.monthrange(year, month)[1]
    month_start = date(year, month, 1)
    month_end = date(year, month, days_in_month)

    habits_target = 0
    for h in habits:
        # Parse the habit's creation date
        created_at_str = h.get("created_at", "")
        if created_at_str:
            habit_start = date.fromisoformat(created_at_str[:10])  # handle datetime strings
        else:
            habit_start = month_start  # fallback: assume start of month

        # Only count days from when the habit existed within this month
        effective_start = max(habit_start, month_start)
        if effective_start > month_end:
            continue  # habit was created after this month
        applicable_days = (month_end - effective_start).days + 1
        habits_target += applicable_days

    logs_res = (
        db.table("habit_logs")
        .select("id")
        .eq("user_id", user_id)
        .in_("habit_id", habit_ids)
        .eq("completed", True)
        .gte("log_date", f"{year}-{month:02d}-01")
        .lte("log_date", f"{year}-{month:02d}-{days_in_month:02d}")
        .execute()
    )
    habits_done = len(logs_res.data or [])
    completion_rate = habits_done / habits_target if habits_target > 0 else 0.0

    # ── 3. Get current XP ────────────────────────────────────────────
    hero_res = (
        db.table("user_heroes")
        .select("total_xp, current_tier")
        .eq("user_id", user_id)
        .eq("hero_id", hero_id)
        .single()
        .execute()
    )
    if not hero_res.data:
        return {"error": "Hero not found for user"}

    current_xp = hero_res.data["total_xp"]
    old_tier = get_tier_index(current_xp)

    # ── 4. Apply XP delta based on performance ────────────────────────
    if completion_rate >= 0.80:
        xp_delta = EVOLUTION_BONUS_XP
    elif completion_rate >= 0.50:
        xp_delta = 0
    else:
        # Penalize but don't drop below current tier floor
        tier_floor = TIER_XP_THRESHOLDS[old_tier]
        xp_delta = max(-DEMOTION_PENALTY_XP, tier_floor - current_xp)

    new_xp = max(0, current_xp + xp_delta)
    new_tier = get_tier_index(new_xp)
    evolved = new_tier > old_tier

    # ── 5. Update user_heroes ─────────────────────────────────────────
    db.table("user_heroes").update({
        "total_xp": new_xp,
        "current_tier": new_tier,
        "current_month_xp": 0,  # reset monthly XP
    }).eq("user_id", user_id).eq("hero_id", hero_id).execute()

    # ── 6. Write evaluation record ────────────────────────────────────
    eval_record = {
        "user_id": user_id,
        "hero_id": hero_id,
        "month": month,
        "year": year,
        "habits_target": habits_target,
        "habits_done": habits_done,
        "completion_rate": round(completion_rate, 4),
        "xp_earned": xp_delta,
        "evolved": evolved,
        "new_tier": new_tier,
    }
    db.table("monthly_evaluations").upsert(
        eval_record,
        on_conflict="user_id,hero_id,month,year",
    ).execute()

    return {
        **eval_record,
        "tier_name": get_tier_name(hero_id, new_tier),
    }


def evaluate_all_heroes(user_id: str, month: int, year: int) -> list[dict]:
    """Run evaluation for every hero the user has selected."""
    db = get_supabase()
    heroes_res = (
        db.table("user_heroes")
        .select("hero_id")
        .eq("user_id", user_id)
        .execute()
    )
    results = []
    for row in heroes_res.data or []:
        result = evaluate_hero_for_month(user_id, row["hero_id"], month, year)
        results.append(result)
    return results
