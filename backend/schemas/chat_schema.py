from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime
from models.message_requests import MessageRequestStatus  # Import enum nếu cần dùng trong schema



class ChatRequestInput(BaseModel):
    target_id: int
    intro_text: str | None = None


class ChatRequestAction(BaseModel):
    action: Literal["accept", "decline"] = Field(..., description="Hành động phản hồi: 'accept' hoặc 'decline'")



class ChatRequestOut(BaseModel):
    id: int
    requester_id: int
    target_id: int
    intro_text: str | None = None
    status: MessageRequestStatus
    created_at: datetime
    responded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}