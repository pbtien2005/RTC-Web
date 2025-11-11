from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func, desc,update
from models.conversations import Conversation
from models.user import User
from typing import List, Optional
from datetime import datetime

class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def find_by_user_id(
        self, 
        user_id: int, 
        limit: int = 20, 
        offset: int = 0, 
        search: Optional[str] = None
    ) -> List[Conversation]:
        """Lấy danh sách conversations của user"""
        query = self.db.query(Conversation).filter(
            or_(
                Conversation.user_a_id == user_id,
                Conversation.user_b_id == user_id
            )
        )
        
        # Tìm kiếm theo tên người dùng
        if search:
            query = query.join(
                User,
                or_(
                    and_(User.user_id == Conversation.user_a_id, Conversation.user_b_id == user_id),
                    and_(User.user_id == Conversation.user_b_id, Conversation.user_a_id == user_id)
                )
            ).filter(User.username.ilike(f'%{search}%'))
        
        # Eager loading relationships
        query = query.options(
            joinedload(Conversation.user_a),
            joinedload(Conversation.user_b),
            joinedload(Conversation.messages)
        )
        
        conversations = query.order_by(desc(Conversation.last_message_at))\
            .limit(limit)\
            .offset(offset)\
            .all()
        
        return conversations
    
    def find_remainer_id(self,conversation_id:int,current_id:int):
            query = self.db.query(Conversation).filter(Conversation.conversation_id==conversation_id).first()
            if current_id==query.user_a_id: return query.user_b_id
            return query.user_a_id
        
    
    def count_by_user_id(self, user_id: int) -> int:
        """Đếm tổng số conversations của user"""
        return self.db.query(func.count(Conversation.conversation_id)).filter(
            or_(
                Conversation.user_a_id == user_id,
                Conversation.user_b_id == user_id
            )
        ).scalar()
    
    def find_by_id(self, conversation_id: int) -> Optional[Conversation]:
        """Lấy conversation theo ID"""
        return self.db.query(Conversation)\
            .options(
                joinedload(Conversation.user_a),
                joinedload(Conversation.user_b)
            )\
            .filter(Conversation.conversation_id == conversation_id)\
            .first()
    
    def update_last_message_time(self, conversation_id: int, timestamp: datetime):
        """Cập nhật thời gian tin nhắn cuối"""
        conversation = self.db.query(Conversation).filter(
            Conversation.conversation_id == conversation_id
        ).first()
        
        if conversation:
            conversation.last_message_at = timestamp
            self.db.commit()

    def update_last_message(
        self,
        conversation_id: int,
        message_id: int,
        message_created_at: Optional[datetime] = None,
    ) -> None:
        """
        Cập nhật last_message_id và last_message_at cho conversation.
        Ghi đè không kiểm tra thứ tự thời gian.
        """
        stmt = (
            update(Conversation)
            .where(Conversation.conversation_id == conversation_id)
            .values(
                last_message_id=message_id,
                last_message_at=message_created_at if message_created_at else func.now(),
            )
            .execution_options(synchronize_session=False)
        )
        self.db.execute(stmt)
    
    def check_user_access(self, conversation_id: int, user_id: int) -> bool:
        """Kiểm tra user có quyền truy cập conversation không"""
        exists = self.db.query(Conversation).filter(
            Conversation.conversation_id == conversation_id,
            or_(
                Conversation.user_a_id == user_id,
                Conversation.user_b_id == user_id
            )
        ).first()
        
        return exists is not None