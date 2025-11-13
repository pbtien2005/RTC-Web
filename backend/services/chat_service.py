# services/chat_request_service.py
from fastapi import HTTPException
from sqlalchemy.orm import Session
from repositories.chat_request_repo import ChatRequestRepository
from models.message_requests import MessageRequest, MessageRequestStatus
from models.conversations import Conversation
from repositories.conversation_repo import ConversationRepository
# from ws.routes import manager # Tạm thời comment nếu chưa dùng tới WS để tránh lỗi import vòng

class ChatRequestService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRequestRepository(db)
        self.conv_repo = ConversationRepository(db)

    def create_request(self, requester_id: int, target_id: int, intro_text: str | None) -> MessageRequest:
        # Rule: chặn tự gửi cho chính mình
        if requester_id == target_id:
            raise HTTPException(status_code=400, detail="Cannot send request to yourself")

        # Rule: check pending trùng (idempotent)
        existing = self.repo.get_pending_request(requester_id, target_id)
        if existing:
            raise HTTPException(status_code=409, detail="Request already pending")

        # Tạo request mới
        req_obj = MessageRequest(
            requester_id=requester_id,
            target_id=target_id,
            intro_text=intro_text,
            status=MessageRequestStatus.pending,
        )

        req = self.repo.insert_message_request(req_obj)

        # TODO: Gửi thông báo realtime qua WebSocket nếu cần
        # await manager.send_personal_message(f"New chat request from user {requester_id}", target_id)

        return req

    def respond_to_request(self, request_id: int, user_id: int, action: str) -> MessageRequest:

        req = self.repo.get_request_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Chat request not found")

        if req.target_id != user_id:
            raise HTTPException(status_code=403, detail="You are not authorized to respond to this request")

        if req.status != MessageRequestStatus.pending:
            raise HTTPException(status_code=400, detail=f"Request is already {req.status.value}")

        if action.lower() == "accept":
            new_status = MessageRequestStatus.accepted

            requester_id = req.requester_id
            target_id = req.target_id

            user_a, user_b = sorted([requester_id, target_id])

            new_conversation = Conversation(
                user_a_id=user_a,
                user_b_id=user_b
            )


            created_conv = self.conv_repo.create_conversation(new_conversation)

            req.related_conversation_id = created_conv.conversation_id

        elif action.lower() == "decline":
            new_status = MessageRequestStatus.declined

        else:
            raise HTTPException(status_code=400, detail="Hành động không hợp lệ")

        updated_req = self.repo.update_request_status(req, new_status, user_id)

        self.db.commit()
        self.db.refresh(updated_req)

        # TODO: Gửi thông báo WebSocket cho user_a biết đã được chấp nhận

        return updated_req

    def get_incoming_requests(self, user_id: int):
        return self.repo.get_requests_for_user(user_id, is_sender=False)

    def get_sent_requests(self, user_id: int):
        return self.repo.get_requests_for_user(user_id, is_sender=True)