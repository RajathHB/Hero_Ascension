"""
routes/goals.py
───────────────
GET    /goals           →  list all goals
POST   /goals           →  create a goal
PATCH  /goals/{id}      →  update progress
DELETE /goals/{id}      →  delete a goal
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.db import get_supabase
from app.models.schemas import GoalCreate, GoalOut, GoalProgressUpdate
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.get("/", response_model=list[GoalOut])
def list_goals(user_id: str = Depends(get_current_user)):
    db = get_supabase()
    result = (
        db.table("goals")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )
    return result.data or []


@router.post("/", response_model=GoalOut, status_code=201)
def create_goal(body: GoalCreate, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    # Verify the hero belongs to user
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

    result = db.table("goals").insert({
        "user_id": user_id,
        "hero_id": body.hero_id,
        "title": body.title.strip(),
        "target_value": body.target_value,
        "current_value": 0,
        "deadline": body.deadline.isoformat() if body.deadline else None,
        "status": "active",
    }).execute()

    return result.data[0]


@router.patch("/{goal_id}", response_model=GoalOut)
def update_progress(
    goal_id: str,
    body: GoalProgressUpdate,
    user_id: str = Depends(get_current_user),
):
    db = get_supabase()

    # Verify ownership + fetch target
    check = (
        db.table("goals")
        .select("id, target_value")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    target = check.data["target_value"]
    new_value = min(body.current_value, target)  # cap at target
    new_status = "completed" if new_value >= target else "active"

    result = db.table("goals").update({
        "current_value": new_value,
        "status": new_status,
    }).eq("id", goal_id).execute()

    return result.data[0]


@router.delete("/{goal_id}", status_code=204)
def delete_goal(goal_id: str, user_id: str = Depends(get_current_user)):
    db = get_supabase()

    check = (
        db.table("goals")
        .select("id")
        .eq("id", goal_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.table("goals").delete().eq("id", goal_id).execute()
