from fastapi import APIRouter,Depends,Response
from core.db import get_db
from schemas.chat_request_schema import ChatRequestInput,ChatRequestOut
from sqlalchemy.orm import Session
from auth.dependencies import get_current_user
from services.chat_request_service import ChatRequestService
from ws.routes import wsManager
router=APIRouter(prefix="/chat",tags=["chat"])

@router.post("/request",response_model=ChatRequestOut)
async def create_chat_request(body: ChatRequestInput, db: Session=Depends(get_db),current_user=Depends(get_current_user)):
    service = ChatRequestService(db)
    request = service.create_request(
        requester_id=current_user.user_id,
        target_id=body.target_id,
        intro_text=body.intro_text
    )
    
    await wsManager.send_1_to_1("chat.request",request.requester_id,request.target_id,ChatRequestOut.model_validate(request))
    return request
                