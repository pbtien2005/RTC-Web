# app/schemas/message.py
from pydantic import BaseModel,Field
from typing import Optional, List
from datetime import datetime
class Sender(BaseModel):
    id: int
    username: Optional[str]=None
    avatar_url: Optional[str]=None

class ReplyMessage(BaseModel):
    id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    conversationId: int
    sender: Sender
    content: str
    created_at:datetime
    edited_at: Optional[datetime]=None
    replyTo: Optional[ReplyMessage]=None

class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    hasMore: bool


class MessageInput(BaseModel):
    content: str = Field(..., min_length=1, max_length=100000)
    
class MessageOutput(BaseModel):
    id: int
    content: str
    created_at: datetime
    edited_at: Optional[datetime]=None