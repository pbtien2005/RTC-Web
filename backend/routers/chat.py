from typing import List
from fastapi import APIRouter, Depends, Response, Body, Query
from core.db import get_db
from schemas.chat_schema import ChatRequestAction,ChatRequestInput,ChatRequestOut
from sqlalchemy.orm import Session
from auth.dependencies import get_current_user
from services.chat_service import ChatRequestService

router = APIRouter(prefix="/chat", tags=["chat"])


# --- 1. Gửi yêu cầu chat ---
@router.post("/request", response_model=ChatRequestOut)
async def create_chat_request(
        body: ChatRequestInput,
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    service = ChatRequestService(db)
    request = service.create_request(
        requester_id=current_user.user_id,
        target_id=body.target_id,
        intro_text=body.intro_text
    )


    return request


# --- 2. Phản hồi yêu cầu (Accept/Decline) ---
@router.put("/request/{request_id}/respond", response_model=ChatRequestOut)
async def respond_to_chat_request(
        request_id: int,
        body: ChatRequestAction,  # Schema chứa field 'action': 'accept' | 'decline'
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    service = ChatRequestService(db)
    updated_request = service.respond_to_request(
        request_id=request_id,
        user_id=current_user.user_id,
        action=body.action
    )

    # Gửi thông báo realtime lại cho người đã gửi yêu cầu ban đầu
    # action_val = "accepted" if body.action.lower() == "accept" else "declined"
    # event_type = f"chat.request_{action_val}"

    # request_out = ChatRequestOut.model_validate(updated_request)
    # await manager.send_1_to_1(event_type, current_user.user_id, updated_request.requester_id, request_out)

    return updated_request


# --- 3. Xem danh sách yêu cầu ĐẾN mình (để duyệt) ---
@router.get("/requests/received", response_model=List[ChatRequestOut])
async def get_received_requests(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    service = ChatRequestService(db)
    return service.get_incoming_requests(user_id=current_user.user_id)


# --- 4. Xem danh sách yêu cầu mình đã GỬI ĐI ---
@router.get("/requests/sent", response_model=List[ChatRequestOut])
async def get_sent_requests(
        db: Session = Depends(get_db),
        current_user=Depends(get_current_user)
):
    service = ChatRequestService(db)
    return service.get_sent_requests(user_id=current_user.user_id)