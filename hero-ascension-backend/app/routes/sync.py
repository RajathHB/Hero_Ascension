from fastapi import APIRouter, Depends, HTTPException
from app.db import get_supabase
from app.models.schemas import SyncStateResponse, ProfileOut, ProfileUpdate, HabitOut, TodoOut, LogToggleRequest
from app.services.auth_service import get_current_user
from datetime import date

router = APIRouter(prefix="/sync", tags=["Sync"])

@router.get("/", response_model=SyncStateResponse)
def get_full_state(user_id: str = Depends(get_current_user)):
    db = get_supabase()
    
    # 1. Fetch Profile
    profile_res = db.table("profiles").select("*").eq("user_id", user_id).single().execute()
    if not profile_res.data:
        # Fallback create if somehow missing
        profile_res = db.table("profiles").insert({"user_id": user_id}).execute()
        profile = profile_res.data[0]
    else:
        profile = profile_res.data

    # 2. Fetch Habits
    habits_res = db.table("habits").select("*").eq("user_id", user_id).execute()
    habits = habits_res.data or []

    # 3. Fetch Logs
    logs_res = db.table("habit_logs").select("habit_id, log_date, completed").eq("user_id", user_id).execute()
    logs_dict = {}
    for l in (logs_res.data or []):
        key = f"{l['habit_id']}_{l['log_date']}"
        logs_dict[key] = l['completed']

    # 4. Fetch Todos
    todos_res = db.table("calendar_todos").select("*").eq("user_id", user_id).execute()
    todos_by_date = {}
    for t in (todos_res.data or []):
        d_str = str(t['todo_date'])
        if d_str not in todos_by_date:
            todos_by_date[d_str] = []
        todos_by_date[d_str].append(t)

    return {
        "profile": profile,
        "habits": habits,
        "logs": logs_dict,
        "calendar_todos": todos_by_date
    }

@router.post("/profile", response_model=ProfileOut)
def update_profile(body: ProfileUpdate, user_id: str = Depends(get_current_user)):
    db = get_supabase()
    update_data = body.dict(exclude_unset=True)
    update_data["updated_at"] = "now()"
    
    result = db.table("profiles").update(update_data).eq("user_id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data[0]

@router.post("/logs/toggle")
def toggle_habit_log(body: LogToggleRequest, user_id: str = Depends(get_current_user)):
    db = get_supabase()
    
    # Check if exists
    existing = db.table("habit_logs").select("id, completed").eq("user_id", user_id).eq("habit_id", body.habit_id).eq("log_date", body.log_date.isoformat()).execute()
    
    if existing.data:
        # Update
        new_val = not existing.data[0]["completed"]
        db.table("habit_logs").update({"completed": new_val}).eq("id", existing.data[0]["id"]).execute()
        return {"completed": new_val}
    else:
        # Insert
        db.table("habit_logs").insert({
            "user_id": user_id,
            "habit_id": body.habit_id,
            "log_date": body.log_date.isoformat(),
            "completed": True
        }).execute()
        return {"completed": True}
