from pydantic import BaseModel, EmailStr, Field
from fastapi import Form
from typing import Optional,List
from datetime import date
from schemas.coacher_schema import CertificateOut
class UserInput(BaseModel):
    pass

class UserOuput(BaseModel):
    user_id: int
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: str

class UserProfileOut(BaseModel):
    """Schema để trả về thông tin profile của user."""
    user_id: int
    email: EmailStr
    full_name: Optional[str] = None
    dob: Optional[date] = None
    username: Optional[str] = None
    avatar_url: str
    phone: Optional[str] = None
    job: Optional[str] = None
    introduction_text: Optional[str] = None
    certificates: List[CertificateOut] = []

    model_config = {"from_attributes": True}

class UserProfileUpdate(BaseModel):
        """Schema để nhận dữ liệu cập nhật profile."""
        full_name: Optional[str] = Field(None, max_length=255)
        username: Optional[str] = Field(None, max_length=255)
        dob: Optional[date] = None
        avatar_url: Optional[str] = Field(None, max_length=2000)
        phone: Optional[str] = Field(None, max_length=32)
        job: Optional[str] = Field(None, max_length=255)
        introduction_text: Optional[str] = None
    
model_config = { "from_attributes": True }

class UserBriefOut(BaseModel):
    """Một Pydantic model đơn giản cho User."""
    user_id: int
    full_name: Optional[str] = None
    avatar_url: str

    model_config = { "from_attributes": True }