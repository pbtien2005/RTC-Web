from pydantic import BaseModel, EmailStr
from fastapi import Form


class LoginInput(BaseModel):
    email: EmailStr
    password: str

    @classmethod
    def as_form(
            cls,
            email: EmailStr = Form(...),
            password: str = Form(...)
    ): return cls(email=email, password=password)


class LoginOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    avatar_url: str

    model_config = {"from_attributes": True}


class RegisterInput(BaseModel):
    email: EmailStr
    password: str

    @classmethod
    def as_form(
            cls,
            email: EmailStr = Form(...),
            password: str = Form(...)
    ): return cls(email=email, password=password)


class RegisterOutput(BaseModel):
    user_id: int
    email: EmailStr

    model_config = {"from_attributes": True}