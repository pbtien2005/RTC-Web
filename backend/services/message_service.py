from typing import List
from fastapi import HTTPException, status
from repositories.message_repo import MessageRepository
from schemas.conversation_schema import MessageResponse, Sender, MessageListResponse
from sqlalchemy.orm import Session
from datetime import datetime
from repositories.conversation_repo import ConversationRepository
from models.messages import Message
from repositories.conversation_state_repo import ConversationStateRepository
class MessageService:
    def __init__(self, db: Session):
        self.db = db
        self.message_repo = MessageRepository(db)
        self.conversation_repo=ConversationRepository(db)
        self.conversation_state_repo=ConversationStateRepository(db)
    
    def get_conversation_messages(
        self, 
        conversation_id: str,
        current_user_id: str,
        limit: int = 100,
    ) -> MessageListResponse:
        """Get all messages in a conversation"""

        # (Option) kiểm tra quyền truy cập
        # has_access = self.message_repo.check_user_in_conversation(current_user_id, conversation_id)
        # if not has_access:
        #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
        #                         detail="You don't have access to this conversation")
        
        before_timestamp: datetime | None = None
        

        # Lấy limit + 1 để biết còn nữa hay không
        raw_messages = self.message_repo.find_by_conversation_id(
            conversation_id=conversation_id,
            limit=limit + 1,
            before=before_timestamp
        )

        conv=self.conversation_repo.find_by_id(conversation_id)

        self.conversation_state_repo.create(conversation_id,current_user_id,conv.last_message_id)

        has_more = len(raw_messages) > limit
        if has_more:
            raw_messages = raw_messages[:limit]
        
        # Map sang schema
        message_responses: List[MessageResponse] = [
            MessageResponse(
                id=msg.id,
                conversationId=conversation_id,
                sender=Sender(
                    id=msg.sender.user_id,
                    username=msg.sender.username,
                    avatar_url=getattr(msg.sender, "avatar_url", None),
                ),
                content=msg.content,
                created_at=msg.created_at,
                edited_at=msg.edited_at,
                replyTo=None
            )
            for msg in raw_messages
        ]

        # total: ưu tiên dùng hàm count trong repo nếu có
        if hasattr(self.message_repo, "count_by_conversation_id"):
            try:
                total_count = self.message_repo.count_by_conversation_id(conversation_id)
            except Exception:
                total_count = len(message_responses)
        else:
            total_count = len(message_responses)

        return MessageListResponse(
            messages=message_responses,
            total=total_count,
            hasMore=has_more
        )

    async def send_message(self,conversation_id,sender_id,content):
        message_obj=Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            content=content,
        )
        msg = self.message_repo.create(message_obj)
        self.conversation_repo.update_last_message(conversation_id,msg.id)
        return msg