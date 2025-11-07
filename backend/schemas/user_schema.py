from pydantic import BaseModel, EmailStr
from fastapi import Form

class UserInput(BaseModel):
    pass

class UserOuput(BaseModel):
    user_id: int
    email: EmailStr
    avatar_url: str

    
    model_config = { "from_attributes": True }
