from sqlalchemy.orm import Session
from sqlalchemy import func, and_,select
from models.conversation_state import ConversationState
from models.messages import Message
from datetime import datetime

class ConversationStateRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(
        self,
        conversation_id: int,
        user_id: int,
        last_read_message_id: int | None = None,
        last_read_at: datetime | None = None,
    ) -> ConversationState:
        """
        Nếu (conversation_id, user_id) đã tồn tại -> update
        Ngược lại -> insert mới
        """
        now = last_read_at or datetime.utcnow()
        print(last_read_message_id)
        try:
            # Kiểm tra tồn tại
            state = self.db.execute(
                select(ConversationState).where(
                    and_(
                        ConversationState.conversation_id == conversation_id,
                        ConversationState.user_id == user_id
                    )
                )
            ).scalar_one_or_none()

            if state:
                # Update nếu có, chỉ nâng con trỏ đọc (không lùi)
                if last_read_message_id is not None and (
                    state.last_read_message_id is None
                    or last_read_message_id > state.last_read_message_id
                ):
                    state.last_read_message_id = last_read_message_id
                    state.last_read_at = now
            else:
                # Insert mới
                state = ConversationState(
                    conversation_id=conversation_id,
                    user_id=user_id,
                    last_read_message_id=last_read_message_id,
                    last_read_at=now,
                )
                self.db.add(state)

            self.db.commit()
            self.db.refresh(state)
            return state

        except Exception:
            self.db.rollback()
            raise
        
    def get_unread_count(self, conversation_id: int, user_id: int) -> int:
        """Đếm số tin nhắn chưa đọc"""
        state = self.db.query(ConversationState).filter(
            ConversationState.conversation_id == conversation_id,
            ConversationState.user_id == user_id
        ).first()
        
        query = self.db.query(func.count(Message.id)).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.deleted_at.is_(None)
        )
        
        if state and state.last_read_message_id:
            query = query.filter(Message.id > state.last_read_message_id)
        
        return query.scalar() or 0
    
    def mark_as_read(self, conversation_id: int, user_id: int, message_id: int):
        """Đánh dấu đã đọc đến tin nhắn cụ thể"""
        state = self.db.query(ConversationState).filter(
            ConversationState.conversation_id == conversation_id,
            ConversationState.user_id == user_id
        ).first()
        
        if state:
            state.last_read_message_id = message_id
            state.last_read_at = datetime.utcnow()
        else:
            state = ConversationState(
                conversation_id=conversation_id,
                user_id=user_id,
                last_read_message_id=message_id,
                last_read_at=datetime.utcnow()
            )
            self.db.add(state)
        
        self.db.commit()