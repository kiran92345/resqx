from enum import Enum
from pydantic import BaseModel, EmailStr


class UserRole(str, Enum):
    admin = "admin"
    user = "user"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
