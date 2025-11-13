from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, time
from models.user import UserRole
from core.db import get_db

# Import các repo
from repositories.user_repo import UserRepository
from repositories.slot_repo import SlotRepository  # Repo cho slot

# Import các schema đã tạo
from schemas.coacher_schema import CoacherPublicProfileOut, OpenSlotOut

router = APIRouter(prefix="/coachers", tags=["Coachers (Public)"])


# API 3: Lấy thông tin chi tiết (profile + bằng cấp) của Coacher
@router.get("/{user_id}", response_model=CoacherPublicProfileOut)
def get_coacher_details(
        user_id: int,
        db: Session = Depends(get_db)
):
    """Lấy profile công khai (profile + bằng cấp) của 1 coacher."""
    repo = UserRepository(db)

    # Dùng hàm get_by_id vì nó đã joinload sẵn certificates
    user = repo.get_by_id(user_id)

    if not user or user.role != UserRole.COACHER.value:
        raise HTTPException(status_code=404, detail="Coacher not found")

    # Pydantic (CoacherPublicProfileOut) sẽ tự động lọc ra các trường cần
    return user


# API 4: Lấy các slot rảnh của Coacher
@router.get("/{user_id}/slots", response_model=List[OpenSlotOut])
def get_coacher_available_slots(
        user_id: int,
        start_date: date = Query(..., description="Ngày bắt đầu, VD: 2025-11-20"),
        end_date: date = Query(..., description="Ngày kết thúc, VD: 2025-11-27"),
        db: Session = Depends(get_db)
):
    """Lấy các slot 'OPEN' của coacher trong một khoảng thời gian."""
    repo = SlotRepository(db)

    # Chuyển đổi date (ngày) sang datetime (ngày + giờ) để query
    start_dt = datetime.combine(start_date, time.min)  # 2025-11-20 00:00:00
    end_dt = datetime.combine(end_date, time.max)  # 2025-11-27 23:59:59

    slots = repo.get_available_slots_for_coach(
        coacher_id=user_id,
        start_dt=start_dt,
        end_dt=end_dt
    )
    return slots