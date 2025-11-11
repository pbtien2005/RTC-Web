from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date 

# --- Student Schemas ---
class StudentCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    slot_quota: int = Field(default=0, ge=0) 
    is_active: bool = True 

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[date] = None
    phone: Optional[str] = None
    job: Optional[str] = None
    university: Optional[str] = None 
    is_active: Optional[bool] = None 
    avatar_base64: Optional[str] = None 
    goal: Optional[str] = None
    slot_quota: Optional[int] = Field(default=None, ge=0)

# --- Coacher Schemas ---
class CoacherCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: Optional[str] = None
    is_active: bool = True 
    student_number: int = Field(default=0, ge=0)

class CoacherUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[date] = None
    phone: Optional[str] = None
    job: Optional[str] = None
    university: Optional[str] = None 
    is_active: Optional[bool] = None 
    avatar_base64: Optional[str] = None 
    student_number: Optional[int] = None

# --- Dashboard Stats ---
class DashboardStats(BaseModel):
    total_students: int
    total_coachers: int
    total_active_sessions: int 

# --- Certificate Schema ---
class CertificateOutput(BaseModel):
    id: int
    title: str
    image_url: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class CertificateCreate(BaseModel):
    title: str = Field(min_length=1)
    image_base64: Optional[str] = None

# --- Output Schemas    ---
class StudentOutput(BaseModel):
    user_id: int
    email: EmailStr
    is_active: bool 
    role: str
    full_name: Optional[str]
    dob: Optional[date]
    avatar_url: str
    phone: Optional[str]
    job: Optional[str]
    university: Optional[str] = None 
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    certificates: List[CertificateOutput] = []
    goal: Optional[str]
    slot_quota: int
    slot_used: int
    class Config:
        from_attributes = True

class CoacherOutput(BaseModel):
    user_id: int
    email: EmailStr
    is_active: bool 
    role: str
    full_name: Optional[str]
    dob: Optional[date]
    avatar_url: str
    phone: Optional[str]
    job: Optional[str]
    university: Optional[str] = None 
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime]
    certificates: List[CertificateOutput] = []
    student_number: Optional[int]
    class Config:
        from_attributes = True

# --- Page Schemas    ---
class StudentPage(BaseModel):
    total_count: int
    data: List[StudentOutput]

class CoacherPage(BaseModel):
    total_count: int
    data: List[CoacherOutput]

# --- Registered Coacher Info for Student ---
class RegisteredCoacherInfo(BaseModel):
    """Thông tin Coacher rút gọn mà Student đã đăng ký"""
    user_id: int
    full_name: Optional[str]
    email: EmailStr
    avatar_url: str
    status: str 

    class Config:
        from_attributes = True

class RegisteredStudentInfo(BaseModel):
    """Thông tin Student rút gọn mà Coacher đang phụ trách"""
    user_id: int
    full_name: Optional[str]
    email: EmailStr
    avatar_url: str
    status: str 

    class Config:
        from_attributes = True
        
class CoacherRankingInfo(BaseModel):
    """Schema cho Bảng xếp hạng Coacher"""
    user_id: int
    full_name: Optional[str]
    avatar_url: str
    student_count: int