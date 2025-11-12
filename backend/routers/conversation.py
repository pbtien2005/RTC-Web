from fastapi import APIRouter,Depends,HTTPException,Query,Body
from sqlalchemy.orm import Session
from core.db import get_db
from typing import Optional
from auth.dependencies import get_current_user
from services.conversation_service import ConversationService
from schemas.conversation_schema import MessageListResponse,MessageResponse,MessageInput,MessageOutput
from services.message_service import MessageService
from repositories.user_repo import User
from ws.routes import wsManager


router=APIRouter(prefix="/conversation",tags=["conversations"])

@router.get("")
async def get_conversation(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db:Session=Depends(get_db)
):
    service=ConversationService(db)
    result = await service.get_user_conversation(
        user_id=current_user.user_id,
        limit=limit,
        offset=offset,
        search=search
    )
    return result

@router.get("/{conversation_id}/messages",response_model=MessageListResponse)
async def get_conversation_messages(
    conversation_id: str,
    limit: Optional[int] = Query(100, ge=1, le=200),
    offset: Optional[int] = Query(0, ge=0),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages in a conversation
    
    - **conversation_id**: The ID of the conversation
    - **limit**: Maximum number of messages to return (default: 100, max: 200)
    - **offset**: Number of messages to skip (default: 0)
    """
    
    # Initialize repository and service
    message_service = MessageService(db)
    
    # Get messages through service layer
    result = message_service.get_conversation_messages(
        conversation_id=conversation_id,
        current_user_id=current_user.user_id,
        limit=limit,
    )
    
    return result

@router.post("/{conversation_id}/messages",response_model=MessageOutput)
async def send_message(
    conversation_id: str, 
    current_user:User=Depends(get_current_user),
    payload: MessageInput = Body(...),
    db: Session=Depends(get_db)
    ):
        service1=MessageService(db)
        res= await service1.send_message(conversation_id,current_user.user_id,payload.content)
        service2=ConversationService(db)
        remainer_id=service2.find_remainer_user_id(conversation_id,current_user.user_id)
        data={
            "type": "message.send",
            "sender_id":current_user.user_id,
            "receiver_id": remainer_id,
            "data": {    
                 "conversation_id":conversation_id,
                 "message_id": res.id,
                 "content": payload.content,
                 "created_at": res.created_at.isoformat()
            }
        }
        await wsManager.send_1_to_1(data)
        return res

