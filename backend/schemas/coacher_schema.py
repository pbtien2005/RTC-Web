from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# --- Schema cho Certificate ---
class CertificateOut(BaseModel):
    id: int
    title: str
    image_url: str

    model_config = {"from_attributes": True}


# --- Schema cho Profile công khai của Coacher ---
class CoacherPublicProfileOut(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    avatar_url: str
    job: Optional[str] = None
    introduction_text: Optional[str] = None
    # Lồng danh sách bằng cấp vào đây
    certificates: List[CertificateOut] = []

    model_config = {"from_attributes": True}


# --- Schema cho Slot ---
class OpenSlotOut(BaseModel):
    id: int
    start_at: datetime
    end_at: datetime
    status: str  # Trạng thái 'open', 'booked'...

class CertificateCreate(BaseModel):
        """Schema để nhận dữ liệu khi tạo certificate mới."""
        title: str = Field(..., max_length=255)
        image_url: str = Field(..., max_length=2000)
model_config = {"from_attributes": True}