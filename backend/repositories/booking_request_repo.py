# repositories/booking_request_repo.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime

# Import các model liên quan
from models.booking_requests import BookingRequest, BookingStatus, DecidedBy
from models.booking_request_items import BookingRequestItem
from models.open_slots import OpenSlot, OpenSlotStatus  # Cần để xử lý slot


class BookingRequestRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_booking_request(self, request: BookingRequest) -> BookingRequest:

        try:
            self.db.add(request)

            self.db.refresh(request)
            return request
        except Exception as e:
            raise e

    def get_request_by_id(self, request_id: int) -> BookingRequest | None:
        stmt = select(BookingRequest).where(BookingRequest.id == request_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_requests_for_student(self, student_id: int) -> List[BookingRequest]:
        """Lấy tất cả request một student đã tạo"""
        stmt = (
            select(BookingRequest)
            .where(
                BookingRequest.student_id == student_id,
                # ✅ XÓA BẤT KỲ LỌC TRẠNG THÁI NÀO Ở ĐÂY (chỉ lọc theo ID)
            )
            .order_by(BookingRequest.created_at.desc())
        )
        return self.db.execute(stmt).scalars().all()

    def get_requests_for_coacher(self, coacher_id: int) -> List[BookingRequest]:
        stmt = (
            select(BookingRequest)
            .where(
                BookingRequest.coacher_id == coacher_id,
                BookingRequest.status == BookingStatus.PENDING
            )
            .order_by(BookingRequest.created_at.desc())
        )
        return self.db.execute(stmt).scalars().all()

    def update_request_status(
            self,
            request: BookingRequest,
            new_status: BookingStatus,
            handler_id: int,
            decided_by: DecidedBy
    ) -> BookingRequest:

        request.status = new_status
        request.decided_by = decided_by
        request.decided_at = datetime.utcnow()
        return request

    def get_items_for_request(self, request_id: int) -> List[BookingRequestItem]:
        stmt = select(BookingRequestItem).where(BookingRequestItem.booking_request_id == request_id)
        return self.db.execute(stmt).scalars().all()