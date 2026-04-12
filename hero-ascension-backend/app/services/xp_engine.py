"""
services/xp_engine.py
──────────────────────
Pure functions for XP calculation and tier resolution.
No database calls — just math.
"""

# XP required to reach each tier (index = tier number)
TIER_XP_THRESHOLDS = [0, 500, 1500, 3500]

# Hero roster with tier names (mirrors frontend HERO_ROSTER)
HERO_TIERS: dict[str, list[str]] = {
    "iron-will":   ["Cadet",      "Sentinel",  "Vanguard",   "Iron Lord"],
    "ember-fist":  ["Brawler",    "Warrior",   "Protector",  "King"],
    "arcane-mind": ["Apprentice", "Scholar",   "Sage",       "Archmage"],
    "golden-path": ["Saver",      "Builder",   "Investor",   "Sovereign"],
    "jade-spirit": ["Seeker",     "Monk",      "Sage",       "Enlightened"],
    "nova-heart":  ["Companion",  "Ally",      "Guardian",   "Beacon"],
}

DEFAULT_TIERS = ["Recruit", "Soldier", "Champion", "Legend"]


def get_tier_index(total_xp: int) -> int:
    """Return the tier index (0–3) for a given XP total."""
    tier = 0
    for i, threshold in enumerate(TIER_XP_THRESHOLDS):
        if total_xp >= threshold:
            tier = i
    return min(tier, len(TIER_XP_THRESHOLDS) - 1)


def get_tier_name(hero_id: str, tier_index: int) -> str:
    """Return the display name for a hero's tier."""
    tiers = HERO_TIERS.get(hero_id, DEFAULT_TIERS)
    return tiers[min(tier_index, len(tiers) - 1)]


def xp_to_next_tier(total_xp: int) -> dict:
    """Return progress info toward the next tier."""
    current_tier = get_tier_index(total_xp)
    max_tier = len(TIER_XP_THRESHOLDS) - 1

    if current_tier >= max_tier:
        return {"current_tier": current_tier, "pct": 100, "xp_needed": 0}

    floor = TIER_XP_THRESHOLDS[current_tier]
    ceil = TIER_XP_THRESHOLDS[current_tier + 1]
    pct = int(((total_xp - floor) / (ceil - floor)) * 100)

    return {
        "current_tier": current_tier,
        "pct": pct,
        "xp_needed": ceil - total_xp,
    }


def calculate_evolution(
    old_xp: int,
    new_xp: int,
    hero_id: str,
) -> dict:
    """
    Compare old and new XP to determine if a hero evolved.
    Returns a dict with evolved flag, old/new tier index and names.
    """
    old_tier = get_tier_index(old_xp)
    new_tier = get_tier_index(new_xp)
    evolved = new_tier > old_tier

    return {
        "evolved": evolved,
        "old_tier": old_tier,
        "new_tier": new_tier,
        "old_tier_name": get_tier_name(hero_id, old_tier),
        "new_tier_name": get_tier_name(hero_id, new_tier),
    }
