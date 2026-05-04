"""
routes/auth.py
──────────────
"""

from fastapi import APIRouter, HTTPException, Depends, status
from app.db import get_supabase
from app.models.schemas import SignupRequest, LoginRequest, TokenResponse, UserOut
from app.services.auth_service import (
    hash_password, verify_password, create_token, get_current_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(body: SignupRequest):
    db = get_supabase()

    # Check if email already exists
    existing = (
        db.table("users")
        .select("id")
        .eq("email", body.email)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    new_user = db.table("users").insert({
        "name": body.name.strip(),
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
    }).execute()

    if not new_user.data:
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = new_user.data[0]
    
    # Create profile for the new user
    db.table("profiles").insert({
        "user_id": user["id"],
        "xp": 0,
        "onboarded": False
    }).execute()

    token = create_token(user["id"])

    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    db = get_supabase()

    result = (
        db.table("users")
        .select("id, name, email, password_hash")
        .eq("email", body.email.lower())
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"])

    return TokenResponse(
        access_token=token,
        user_id=user["id"],
        name=user["name"],
        email=user["email"],
    )


@router.get("/me", response_model=UserOut)
def get_me(user_id: str = Depends(get_current_user)):
    db = get_supabase()

    result = (
        db.table("users")
        .select("id, name, email, created_at")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return result.data
