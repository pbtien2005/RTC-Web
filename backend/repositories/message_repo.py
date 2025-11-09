from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc,asc
from models.messages import Message
from datetime import datetime
from typing import List, Optional

class MessageRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def find_by_conversation_id(
        self, 
        conversation_id: int, 
        limit: int = 50,
        before: Optional[datetime] = None
    ) -> List[Message]:
        """Lấy tin nhắn theo conversation_id"""
        query = self.db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.deleted_at.is_(None)
        )
        
        if before:
            query = query.filter(Message.created_at < before)
        
        # Eager load sender
        query = query.options(joinedload(Message.sender))
        
        messages = query.order_by(asc(Message.created_at))\
            .limit(limit)\
            .all()
        
        return messages
    
    def find_last_message(self, conversation_id: int) -> Optional[Message]:
        """Lấy tin nhắn cuối cùng"""
        return self.db.query(Message)\
            .filter(
                Message.conversation_id == conversation_id,
                Message.deleted_at.is_(None)
            )\
            .order_by(desc(Message.created_at))\
            .first()
    
    def create(self, message: Message) -> Message:
        """Tạo tin nhắn mới"""
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        return message
    
    def find_by_id(self, message_id: int) -> Optional[Message]:
        """Lấy tin nhắn theo ID"""
        return self.db.query(Message)\
            .options(joinedload(Message.sender))\
            .filter(Message.id == message_id)\
            .first()
    
    def update(self, message_id: int, content: str) -> Optional[Message]:
        """Cập nhật nội dung tin nhắn"""
        message = self.db.query(Message).filter(Message.id == message_id).first()
        if message:
            message.content = content
            message.edited_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(message)
        return message
    
    def soft_delete(self, message_id: int):
        """Xóa mềm tin nhắn"""
        message = self.db.query(Message).filter(Message.id == message_id).first()
        if message:
            message.deleted_at = datetime.utcnow()
            self.db.commit()