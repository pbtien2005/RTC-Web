from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from fastapi import Form

class LoginInput(BaseModel):
    email: EmailStr
    password: str

    @classmethod
    def as_form(
        cls,
        email: EmailStr=Form(...),
        password: str=Form(...)
    ): return cls(email=email,password=password)

class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    role: str
    avatar_url: Optional[str] = None
    username: Optional[str]=None

    model_config = { "from_attributes": True }

class LoginOut(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    user: UserOut


class RegisterInput(BaseModel):
    email: EmailStr
    password: str

    @classmethod
    def as_form(
        cls,
        email: EmailStr=Form(...),
        password: str=Form(...)
    ): return cls(email=email,password=password)


class RegisterOutput(BaseModel):
    user_id: int
    email: EmailStr
    
    model_config = { "from_attributes": True }