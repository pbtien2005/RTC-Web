# repositories/conversation_repo.py
from sqlalchemy.orm import Session
from models.conversations import Conversation
from sqlalchemy import select

class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(self, conv: Conversation) -> Conversation:
        """Thêm conversation mới vào session."""
        self.db.add(conv)
        # Lưu ý: Không commit ở đây. Service layer sẽ commit toàn bộ transaction.
        return conv

    def get_conversation_by_users(self, user_a_id: int, user_b_id: int) -> Conversation | None:
        """Tìm conversation giữa 2 user"""
        user_a, user_b = sorted([user_a_id, user_b_id])
        stmt = select(Conversation).where(
            Conversation.user_a_id == user_a,
            Conversation.user_b_id == user_b,
        )
        return self.db.execute(stmt).scalar_one_or_none()