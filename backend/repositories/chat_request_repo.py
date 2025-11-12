# repositories/chat_request_repo.py
from sqlalchemy.orm import Session
from models.message_requests import MessageRequest, MessageRequestStatus
from sqlalchemy import select




class ChatRequestRepository:
    def __init__(self, db: Session):
        self.db = db


    def get_pending_request(self, requester_id: int, target_id: int) -> MessageRequest | None:
        stmt = (
        select(MessageRequest).where(
            MessageRequest.requester_id == requester_id,
            MessageRequest.target_id == target_id,
            MessageRequest.status == MessageRequestStatus.pending,
            )
        )
        result = self.db.execute(stmt).scalar_one_or_none()
        return result


    def insert_message_request(self, req: MessageRequest):
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req