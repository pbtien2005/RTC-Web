from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime


class OpenSlotBriefOut(BaseModel):
    id: int
    start_at: datetime
    end_at: datetime
    status: str

    model_config = {"from_attributes": True}


class BookingRequestItemOut(BaseModel):
    id: int
    open_slot_id: int
    open_slot: OpenSlotBriefOut  # Lấy luôn thông tin slot

    model_config = {"from_attributes": True}


class BookingCreateInput(BaseModel):
    coacher_id: int
    slot_ids: List[int] = Field(..., min_length=1, description="Danh sách ID các slot cần đặt")
    message: str | None = None


class BookingRespondAction(BaseModel):
    action: Literal["approve", "reject"]


class BookingRequestOut(BaseModel):
    id: int
    student_id: int
    coacher_id: int
    message: str | None
    status: str
    created_at: datetime
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None

    items: List[BookingRequestItemOut] = []

    model_config = {"from_attributes": True}