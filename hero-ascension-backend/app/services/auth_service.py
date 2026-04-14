"""
services/auth_service.py
────────────────────────
JWT creation/verification and password hashing.
"""

import os
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

SECRET = os.getenv("JWT_SECRET")
if not SECRET:
    raise ValueError("JWT_SECRET not set")

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days


def _safe_password(plain: str) -> str:
    """Ensure password is within bcrypt 72-byte limit"""
    return plain.encode("utf-8")[:72].decode("utf-8", "ignore")


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(_safe_password(plain))


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(_safe_password(plain), hashed)


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def decode_token(token: str) -> str:
    """Decode JWT and return user_id. Raises 401 if invalid."""
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise ValueError("Missing sub")
        return user_id
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """FastAPI dependency — extracts user_id from Bearer token."""
    return decode_token(credentials.credentials)