"""
services/streak_engine.py
──────────────────────────
Calculates the current streak for a habit by querying
completed log dates in reverse chronological order.
"""

from datetime import date, timedelta
from app.db import get_supabase


def calculate_streak(habit_id: str, user_id: str) -> int:
    """
    Count consecutive days (ending today or yesterday) where the habit
    was completed. Returns 0 if no streak exists.
    """
    db = get_supabase()

    # Pull all completed log dates for this habit, newest first
    result = (
        db.table("habit_logs")
        .select("log_date")
        .eq("habit_id", habit_id)
        .eq("user_id", user_id)
        .eq("completed", True)
        .order("log_date", desc=True)
        .limit(365)
        .execute()
    )

    rows = result.data or []
    if not rows:
        return 0

    # Convert to a set of date objects for O(1) lookup
    done_dates = {date.fromisoformat(r["log_date"]) for r in rows}

    today = date.today()
    streak = 0
    cursor = today

    # Allow streak to be alive if last completion was yesterday
    if cursor not in done_dates and (cursor - timedelta(days=1)) not in done_dates:
        return 0

    # If today not done yet, start from yesterday
    if cursor not in done_dates:
        cursor -= timedelta(days=1)

    # Walk backwards counting consecutive days
    while cursor in done_dates:
        streak += 1
        cursor -= timedelta(days=1)

    return streak


def get_all_streaks(user_id: str, habit_ids: list[str]) -> dict[str, int]:
    """Return a dict of {habit_id: streak} for a list of habits."""
    return {hid: calculate_streak(hid, user_id) for hid in habit_ids}
