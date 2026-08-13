import uuid
from fastapi import APIRouter, HTTPException, status

from app.database import users_collection
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, UserRole
from app.core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _normalize_role(role: str) -> UserRole:
    if role == "admin":
        return UserRole.admin
    return UserRole.user


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    doc = {
        "_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
    }
    await users_collection.insert_one(doc)

    token = create_access_token({"sub": user_id, "role": doc["role"]})
    user_out = UserOut(id=user_id, name=doc["name"], email=doc["email"], role=_normalize_role(doc["role"]))
    return Token(access_token=token, user=user_out)


@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    role = _normalize_role(user["role"]).value
    token = create_access_token({"sub": user["_id"], "role": role})
    user_out = UserOut(id=user["_id"], name=user["name"], email=user["email"], role=_normalize_role(user["role"]))
    return Token(access_token=token, user=user_out)
