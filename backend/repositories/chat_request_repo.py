# repositories/chat_request_repo.py
from typing import List

from sqlalchemy.orm import Session
from models.message_requests import MessageRequest, MessageRequestStatus
from sqlalchemy import select
from datetime import datetime,date





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

    def get_request_by_id(self, request_id: int) -> MessageRequest | None:
        stmt = select(MessageRequest).where(MessageRequest.id == request_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def update_request_status(self, request: MessageRequest, new_status: MessageRequestStatus,
                              handler_id: int) -> MessageRequest:
        request.status = new_status
        request.handled_by = handler_id
        request.responded_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(request)
        return request

    def get_requests_for_user(self, user_id: int, is_sender: bool = False) -> List[MessageRequest]:
        """Lấy danh sách yêu cầu liên quan đến user."""

        if is_sender:
            # ✅ SỬA: Lấy tất cả trạng thái khi là người gửi
            stmt = select(MessageRequest).where(
                MessageRequest.requester_id == user_id
                # KHÔNG LỌC status ở đây
            )
        else:
            # Giữ nguyên logic cũ: Chỉ lấy 'pending' khi là người nhận (dashboard)
            stmt = select(MessageRequest).where(
                MessageRequest.target_id == user_id,
                MessageRequest.status == MessageRequestStatus.pending
            )

        stmt = stmt.order_by(MessageRequest.created_at.desc())
        return self.db.execute(stmt).scalars().all()