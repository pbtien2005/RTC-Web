# schemas/session_schema.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
# ✅ IMPORT SCHEMA MỚI
from schemas.user_schema import UserBriefOut


class SessionUserBrief(BaseModel):
    user: UserBriefOut

    model_config = {
        "from_attributes": True
    }
class SessionOut(BaseModel):
    id: int
    start_at: datetime
    end_at: datetime
    status: str
    meeting_url: Optional[str] = None
    student: Optional[SessionUserBrief] = None
    coacher: Optional[SessionUserBrief] = None

    model_config = {"from_attributes": True}