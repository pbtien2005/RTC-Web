from pydantic import BaseModel, EmailStr
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

# class LoginOut(BaseModel):
#     id: int
#     email: EmailStr
#     username: 


