from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from models.conversation_state import ConversationState
from models.messages import Message
from datetime import datetime

class ConversationStateRepository:
    def __init__(self, db: Session):
        self.db = db
    
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