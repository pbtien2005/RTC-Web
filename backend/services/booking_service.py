from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from typing import List
from datetime import datetime

# Import Repositories
from repositories.booking_request_repo import BookingRequestRepository
# Import Models
from models.user import Student, Coach
from models.open_slots import OpenSlot, OpenSlotStatus
from models.booking_requests import BookingRequest, BookingStatus, DecidedBy
from models.booking_request_items import BookingRequestItem
from models.session import Session, SessionStatus


class BookingService:
    def __init__(self, db: Session):
        self.db = db
        # Giả định repo KHÔNG tự commit
        self.repo = BookingRequestRepository(db)

    def create_booking(self, student_id: int, coacher_id: int, slot_ids: List[int],
                       message: str | None) -> BookingRequest:

        try:
            # 1. Lấy thông tin student và các slot cần đặt
            student = self.db.get(Student, student_id)
            if not student:
                raise HTTPException(status_code=404, detail="Student not found")

            slots = self.db.scalars(
                select(OpenSlot).where(OpenSlot.id.in_(slot_ids)).with_for_update()
                # with_for_update để khóa các hàng này lại
            ).all()

            # 2. Validate dữ liệu
            if len(slots) != len(slot_ids):
                raise HTTPException(status_code=404, detail="One or more slots not found")

            if (student.slot_quota - student.slot_used) < len(slots):
                raise HTTPException(status_code=400, detail="Not enough slot quota")

            for slot in slots:
                if slot.coacher_id != coacher_id:
                    raise HTTPException(status_code=400, detail=f"Slot {slot.id} does not belong to coach {coacher_id}")
                if slot.status != OpenSlotStatus.OPEN:
                    raise HTTPException(status_code=409, detail=f"Slot {slot.id} is no longer available")

            # 3. Tiến hành cập nhật
            # Đổi trạng thái các slot thành "đang chờ"
            for slot in slots:
                slot.status = OpenSlotStatus.ON_HOLD

                # Tạo các booking item
            items = [BookingRequestItem(open_slot_id=s.id) for s in slots]

            # Tạo booking request chính
            booking_request = BookingRequest(
                student_id=student_id,
                coacher_id=coacher_id,
                message=message,
                status=BookingStatus.PENDING,
                items=items  # Gán list items vào đây (nhờ relationship)
            )

            # 4. Lưu vào DB (Giả định repo.create_booking_request chỉ add)
            # self.repo.create_booking_request(booking_request)
            # Nếu repo có commit, bạn phải tự add:
            self.db.add(booking_request)

            self.db.commit()  # Commit 1 lần duy nhất cho tất cả thay đổi

            self.db.refresh(booking_request)
            return booking_request

        except Exception as e:
            self.db.rollback()  # Hoàn tác tất cả nếu có lỗi
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

    def respond_to_booking(self, request_id: int, coach_id: int, action: str) -> BookingRequest:

        req = self.repo.get_request_by_id(request_id)

        # 1. Validate
        if not req:
            raise HTTPException(status_code=404, detail="Booking request not found")
        if req.coacher_id != coach_id:
            raise HTTPException(status_code=403, detail="You are not authorized to respond")
        if req.status != BookingStatus.PENDING:
            raise HTTPException(status_code=400, detail=f"Request is already {req.status.value}")

        student = self.db.get(Student, req.student_id)
        if not student:
            raise HTTPException(status_code=404, detail="Student account not found")

        try:
            if action == "approve":

                new_sessions = []
                slots_booked = 0

                for item in req.items:
                    # Kiểm tra quota lần cuối
                    if (student.slot_quota - student.slot_used - slots_booked) <= 0:
                        raise HTTPException(status_code=400, detail="Student quota exceeded. Cannot approve.")

                    item.open_slot.status = OpenSlotStatus.BOOKED

                    # Tạo Session (buổi học thực tế)
                    new_session = Session(
                        coacher_id=req.coacher_id,
                        student_id=req.student_id,
                        booking_item_id=item.id,
                        start_at=item.open_slot.start_at,
                        end_at=item.open_slot.end_at,
                        status=SessionStatus.SCHEDULED
                    )
                    new_sessions.append(new_session)
                    slots_booked += 1

                self.db.add_all(new_sessions)
                student.slot_used += slots_booked  # Trừ quota của student

                # Cập nhật request (Giả định repo.update... không commit)
                self.repo.update_request_status(req, BookingStatus.APPROVED, coach_id, DecidedBy.COACH)

            elif action == "reject":
                for item in req.items:
                    item.open_slot.status = OpenSlotStatus.OPEN  # Trả slot về trạng thái OPEN

                self.repo.update_request_status(req, BookingStatus.REJECTED, coach_id, DecidedBy.COACH)

            self.db.commit()  # Commit 1 lần
            self.db.refresh(req)
            return req

        except Exception as e:
            self.db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=f"Internal server error: {e}")

    def get_student_bookings(self, student_id: int):
        return self.repo.get_requests_for_student(student_id)

    def get_coach_bookings(self, coacher_id: int):
        return self.repo.get_requests_for_coacher(coacher_id)