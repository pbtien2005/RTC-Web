from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List
from models.user import User
from core.db import get_db
from auth.dependencies import get_current_user
from repositories.availability_repo import AvailabilityRepository
from schemas.availability_schema import AvailabilityCreate, AvailabilityOut, GenerateSlotsInput, GenerateSlotsOutput
from services.availability_service import AvailabilityService

# Chúng ta gắn API này vào /coachers
# (ví dụ: /coachers/me/availability)
router = APIRouter(prefix="/coachers", tags=["Coacher Availability"])


@router.get("/me/availability", response_model=List[AvailabilityOut])
def get_my_availability_rules(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Lấy danh sách các lịch rảnh (quy tắc) của Coacher."""
    if current_user.role != 'coacher':
        raise HTTPException(status_code=403, detail="Chỉ Coacher mới có lịch rảnh")

    # ✅ SỬA: Gọi Service
    service = AvailabilityService(db)
    # Repo đã được chuyển vào trong service
    return service.repo.get_by_coacher_id(current_user.user_id)


@router.post("/me/availability", response_model=AvailabilityOut, status_code=status.HTTP_201_CREATED)
def create_my_availability_rule(
        body: AvailabilityCreate,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Tạo một quy tắc rảnh mới (VD: Thứ 6, 20:00 - 23:00)."""
    if current_user.role != 'coacher':
        raise HTTPException(status_code=403, detail="Chỉ Coacher mới có thể tạo lịch")

    # ✅ SỬA: Gọi Service
    service = AvailabilityService(db)
    new_rule = service.repo.create(current_user.user_id, body)
    return new_rule


@router.delete("/me/availability/{avail_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_availability_rule(
        avail_id: int,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Xóa một quy tắc rảnh."""
    if current_user.role != 'coacher':
        raise HTTPException(status_code=403, detail="Không có quyền")

    # ✅ SỬA: Gọi Service
    service = AvailabilityService(db)
    rule_to_delete = service.repo.get_by_id(avail_id)

    if not rule_to_delete:
        raise HTTPException(status_code=404, detail="Không tìm thấy lịch rảnh")

    if rule_to_delete.coacher_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Không được xóa lịch của người khác")

    service.repo.delete(rule_to_delete)
    return None
@router.post("/me/generate-slots", response_model=GenerateSlotsOutput)
def generate_my_open_slots(
    body: GenerateSlotsInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Tự động 'băm' các quy tắc rảnh thành các OpenSlot cụ thể.
    """
    if current_user.role != 'coacher':
         raise HTTPException(status_code=403, detail="Chỉ Coacher mới có thể tạo slot")

    service = AvailabilityService(db)
    result = service.generate_slots_from_rules(
        coacher_id=current_user.user_id,
        start_date=body.start_date,
        days_to_generate=body.days_to_generate,
        slot_duration_minutes=body.slot_duration_minutes
    )
    return result