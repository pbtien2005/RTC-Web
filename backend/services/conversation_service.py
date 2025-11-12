from sqlalchemy.orm import Session
from repositories.conversation_repo import ConversationRepository
from repositories.user_repo import UserRepository
from repositories.conversation_state_repo import ConversationStateRepository
from repositories.message_repo import MessageRepository
from datetime import datetime,timedelta

class ConversationService:
    def __init__(self, db: Session):
        self.db = db
        self.conversation_repo = ConversationRepository(db)
        self.user_repo = UserRepository(db)
        self.conversation_state_repo=ConversationStateRepository(db)
        self.message_repo=MessageRepository(db)
        
    async def get_user_conversation(self,user_id:int,limit: int=20,offset: int=0, search:str=None):
        conversations = self.conversation_repo.find_by_user_id(
            user_id, limit, offset, search
        )
        
        # 2. Enrich data
        enriched_conversations = []
        for conv in conversations:
            # Xác định participant (người còn lại)
            participant_id = conv.user_b_id if conv.user_a_id == user_id else conv.user_a_id
            participant = self.user_repo.get_by_id(participant_id)
            
            # Lấy tin nhắn cuối
            last_message = self.message_repo.find_last_message(conv.conversation_id)
            
            # Đếm unread
            unread_count = self.conversation_state_repo.get_unread_count(
                conv.conversation_id, 
                user_id
            )
            
            # Kiểm tra online status

            
            enriched_conversations.append({
                'id': conv.conversation_id,
                'participant': {
                    'id': participant.user_id,
                    'name': participant.username or participant.email.split('@')[0],
                    'avatar': participant.avatar_url,
                    'isOnline': False
                },
                'lastMessage': {
                    'id': last_message.id,
                    'content': last_message.content,
                    'senderId': last_message.sender_id,
                    'timestamp': last_message.created_at.isoformat(),
                    'isRead': last_message.sender_id == user_id
                } if last_message else None,
                'unreadCount': unread_count,
                'updatedAt': conv.last_message_at.isoformat() if conv.last_message_at else None,
                'isPinned': False
            })
        
        # 3. Đếm tổng số
        total = self.conversation_repo.count_by_user_id(user_id)
        
        return {
            'conversations': enriched_conversations,
            'total': total,
            'hasMore': len(conversations) == limit
        }
    
    async def _check_user_online(self, user_id: int) -> bool:
        """Kiểm tra user có online không"""
        last_login = self.user_repo.get_last_login_time(user_id)
        if not last_login:
            return False
        
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
        return last_login > five_minutes_ago
    def find_remainer_user_id(self,conversation_id:int,user_id:int):
        return self.conversation_repo.find_remainer_id(conversation_id,user_id)
    
    def check_user_access(self, conversation_id: int, user_id: int) -> bool:
        """Kiểm tra quyền truy cập"""
        return self.conversation_repo.check_user_access(conversation_id, user_id)
    
    def mark_as_read(self, conversation_id: int, user_id: int):
        """Đánh dấu đã đọc"""
        last_message = self.message_repo.find_last_message(conversation_id)
        if last_message:
            self.conversation_state_repo.mark_as_read(
                conversation_id, 
                user_id, 
                last_message.id
            )