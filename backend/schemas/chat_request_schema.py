from pydantic import BaseModel

class ChatRequestInput(BaseModel):
    target_id: int
    intro_text: str | None = None

class ChatRequestOut(BaseModel):
    requester_id: int
    target_id: int
    intro_text: str
    
    model_config = { "from_attributes": True }
