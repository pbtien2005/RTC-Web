from fastapi import APIRouter, Depends, Body, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.db import get_db
from auth.dependencies import get_current_user  # Giả sử đây là hàm auth của bạn
from models.user import UserRole
from models.user import User  # Model để lấy thông tin user

from schemas.booking_schema import (
    BookingCreateInput, BookingRespondAction, BookingRequestOut
)
from services.booking_service import BookingService

router = APIRouter(prefix="/booking", tags=["Booking"])


@router.post("/request", response_model=BookingRequestOut)
def create_booking_request(
        body: BookingCreateInput,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Student) Gửi yêu cầu đặt lịch với một coacher."""
    if current_user.role != UserRole.STUDENT.value:
        raise HTTPException(status_code=403, detail="Only students can create booking requests")

    service = BookingService(db)
    return service.create_booking(
        student_id=current_user.user_id,
        coacher_id=body.coacher_id,
        slot_ids=body.slot_ids,
        message=body.message
    )


@router.put("/request/{request_id}/respond", response_model=BookingRequestOut)
def respond_to_booking_request(
        request_id: int,
        body: BookingRespondAction,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Coach) Chấp nhận hoặc từ chối một yêu cầu đặt lịch."""
    if current_user.role != UserRole.COACHER.value:
        raise HTTPException(status_code=403, detail="Only coachers can respond to requests")

    service = BookingService(db)
    return service.respond_to_booking(
        request_id=request_id,
        coach_id=current_user.user_id,
        action=body.action
    )


@router.get("/requests/sent", response_model=List[BookingRequestOut])
def get_my_sent_requests(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Student) Lấy các request mình đã gửi đi."""
    if current_user.role != UserRole.STUDENT.value:
        raise HTTPException(status_code=403, detail="Only students can view sent requests")

    service = BookingService(db)
    return service.get_student_bookings(student_id=current_user.user_id)


@router.get("/requests/received", response_model=List[BookingRequestOut])
def get_my_received_requests(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Coach) Lấy các request gửi đến mình."""
    if current_user.role != UserRole.COACHER.value:
        raise HTTPException(status_code=403, detail="Only coachers can view received requests")

    service = BookingService(db)
    return service.get_coach_bookings(coacher_id=current_user.user_id)