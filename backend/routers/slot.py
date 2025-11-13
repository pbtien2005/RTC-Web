# routers/slot_management_router.py
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time, datetime
from models.user import User
from models.open_slots import OpenSlotStatus  # <-- Import
from core.db import get_db
from auth.dependencies import get_current_user
from repositories.slot_repo import SlotRepository  # <-- Import repo
from schemas.coacher_schema import OpenSlotOut  # <-- Tái sử dụng schema cũ

router = APIRouter(prefix="/coachers/me/slots", tags=["Coach Slots (Manage)"])


@router.get("/calendar", response_model=List[OpenSlotOut])
def get_my_calendar_slots(
        start_date: date = Query(...),
        end_date: date = Query(...),
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Coach) Lấy TẤT CẢ slots (booked, open, etc.) trong 1 khoảng ngày."""
    repo = SlotRepository(db)
    start_dt = datetime.combine(start_date, time.min)
    end_dt = datetime.combine(end_date, time.max)

    slots = repo.get_all_slots_for_coach_in_range(
        current_user.user_id, start_dt, end_dt
    )
    return slots

@router.get("/", response_model=List[OpenSlotOut])
def get_my_generated_slots(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    (Coach) Lấy tất cả các slot cụ thể đã được sinh ra,
    sắp diễn ra (bao gồm 'open', 'on_hold', 'booked').
    """
    if current_user.role != 'coacher':
        raise HTTPException(status_code=403, detail="Chỉ Coacher")

    repo = SlotRepository(db)
    slots = repo.get_future_slots_for_coach(current_user.user_id)
    return slots


@router.put("/{slot_id}/cancel", response_model=OpenSlotOut)
def cancel_a_specific_slot(
        slot_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """(Coach) Hủy một slot 'OPEN' hoặc 'ON_HOLD' cụ thể."""
    if current_user.role != 'coacher':
        raise HTTPException(status_code=403, detail="Chỉ Coacher")

    repo = SlotRepository(db)
    slot_to_cancel = repo.get_slot_by_id_and_coach(slot_id, current_user.user_id)

    if not slot_to_cancel:
        raise HTTPException(status_code=404, detail="Không tìm thấy slot hoặc bạn không có quyền")

    # Ràng buộc: Không cho hủy slot đã được đặt (booked)
    if slot_to_cancel.status == OpenSlotStatus.BOOKED:
        raise HTTPException(status_code=400,
                            detail="Slot đã được đặt. Vui lòng hủy 'Buổi học (Session)' tương ứng."
                            )

    # Hủy các slot 'open' hoặc 'on_hold' (đang chờ)
    if slot_to_cancel.status == OpenSlotStatus.OPEN or slot_to_cancel.status == OpenSlotStatus.ON_HOLD:
        slot_to_cancel.status = OpenSlotStatus.CANCELLED  # Đổi status
        updated_slot = repo.save_slot(slot_to_cancel)  # Lưu (hàm này tự commit)
        return updated_slot

    return slot_to_cancel  # Trả về nếu nó đã bị 'cancelled'