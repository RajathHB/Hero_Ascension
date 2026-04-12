"""
routes/heroes.py
────────────────
GET  /heroes/roster           →  list all available heroes (static)
POST /heroes/select           →  save user's chosen heroes
GET  /heroes/my               →  get user's selected heroes + XP + tier
POST /heroes/evaluate         →  run monthly evaluation for all heroes
POST /heroes/evaluate/{id}    →  run monthly evaluation for one hero
"""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_supabase
from app.models.schemas import HeroSelectRequest, UserHeroOut
from app.services.auth_service import get_current_user
from app.services.xp_engine import get_tier_index, get_tier_name, xp_to_next_tier
from app.services.evolution import evaluate_hero_for_month, evaluate_all_heroes

router = APIRouter(prefix="/heroes", tags=["Heroes"])

# Static hero roster — matches frontend HERO_ROSTER
HERO_ROSTER = [
    {"id": "iron-will",   "name": "Iron Will",   "domain": "Discipline",    "icon": "⚡", "color": "plasma",
     "tiers": ["Cadet", "Sentinel", "Vanguard", "Iron Lord"]},
    {"id": "ember-fist",  "name": "Ember Fist",  "domain": "Strength",      "icon": "🔥", "color": "ember",
     "tiers": ["Brawler", "Warrior", "Protector", "King"]},
    {"id": "arcane-mind", "name": "Arcane Mind", "domain": "Learning",      "icon": "🔮", "color": "arcane",
     "tiers": ["Apprentice", "Scholar", "Sage", "Archmage"]},
    {"id": "golden-path", "name": "Golden Path", "domain": "Wealth",        "icon": "💰", "color": "gold",
     "tiers": ["Saver", "Builder", "Investor", "Sovereign"]},
    {"id": "jade-spirit", "name": "Jade Spirit", "domain": "Mindfulness",   "icon": "🌿", "color": "jade",
     "tiers": ["Seeker", "Monk", "Sage", "Enlightened"]},
    {"id": "nova-heart",  "name": "Nova Heart",  "domain": "Relationships",  "icon": "💫", "color": "rose",
     "tiers": ["Companion", "Ally", "Guardian", "Beacon"]},
]
VALID_HERO_IDS = {h["id"] for h in HERO_ROSTER}


@router.get("/roster")
def get_roster():
    """Return all available heroes (no auth needed)."""
    return HERO_ROSTER


@router.post("/select", status_code=201)
def select_heroes(
    body: HeroSelectRequest,
    user_id: str = Depends(get_current_user),
):
    db = get_supabase()

    # Validate IDs
    invalid = [hid for hid in body.hero_ids if hid not in VALID_HERO_IDS]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Unknown hero IDs: {invalid}")

    # Upsert user_heroes rows (safe to call multiple times)
    rows = [
        {
            "user_id": user_id,
            "hero_id": hid,
            "current_tier": 0,
            "total_xp": 0,
            "current_month_xp": 0,
        }
        for hid in body.hero_ids
    ]
    db.table("user_heroes").upsert(
        rows, on_conflict="user_id,hero_id"
    ).execute()

    return {"selected": body.hero_ids}


@router.get("/my")
def get_my_heroes(user_id: str = Depends(get_current_user)):
    """Return user's heroes enriched with XP progress and tier info."""
    db = get_supabase()

    result = (
        db.table("user_heroes")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )

    enriched = []
    for row in result.data or []:
        hero_meta = next((h for h in HERO_ROSTER if h["id"] == row["hero_id"]), {})
        xp = row["total_xp"]
        tier_idx = get_tier_index(xp)
        progress = xp_to_next_tier(xp)

        enriched.append({
            **row,
            **hero_meta,
            "tier_name": get_tier_name(row["hero_id"], tier_idx),
            "xp_to_next": progress["xp_needed"],
            "tier_pct": progress["pct"],
        })

    return enriched


@router.post("/evaluate")
def evaluate_all(user_id: str = Depends(get_current_user)):
    """Run monthly evaluation for ALL of the user's heroes."""
    today = date.today()
    results = evaluate_all_heroes(user_id, today.month, today.year)
    return {"evaluations": results}


@router.post("/evaluate/{hero_id}")
def evaluate_one(hero_id: str, user_id: str = Depends(get_current_user)):
    """Run monthly evaluation for a single hero."""
    if hero_id not in VALID_HERO_IDS:
        raise HTTPException(status_code=400, detail="Unknown hero ID")
    today = date.today()
    result = evaluate_hero_for_month(user_id, hero_id, today.month, today.year)
    return result
