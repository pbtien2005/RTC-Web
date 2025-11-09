# services/chat_request_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.chat_request_repo import ChatRequestRepository
from models.message_requests import MessageRequest, MessageRequestStatus
from ws.routes import manager



class ChatRequestService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRequestRepository(db)


    def create_request(self, requester_id: int, target_id: int, intro_text: str | None):
        # Rule: chặn tự gửi cho chính mình
        if requester_id == target_id:
            raise HTTPException(400, "Cannot send request to yourself")


        # Rule: check pending trùng (idempotent)
        existing = self.repo.get_pending_request(requester_id, target_id)
        if existing:
            print("alo")
            raise HTTPException(409, "Request already pending")


        # (Optional) check block, cooldown
        # TODO — tuỳ logic riêng của bạn


        # Tạo request mới
        req_obj = MessageRequest(
            requester_id=requester_id,
            target_id=target_id,
            intro_text=intro_text,
            status=MessageRequestStatus.pending,
        )


        req=self.repo.insert_message_request(req_obj)
      

        return req