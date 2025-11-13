from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from typing import List

from models import OpenSlot
from models.coacher_availability import CoacherAvailability
from schemas.availability_schema import AvailabilityCreate

class AvailabilityRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_coacher_id(self, coacher_id: int) -> List[CoacherAvailability]:
        stmt = (
            select(CoacherAvailability)
            .where(CoacherAvailability.coacher_id == coacher_id)
            .order_by(CoacherAvailability.weekday, CoacherAvailability.start_time)
        )
        return self.db.execute(stmt).scalars().all()

    def get_by_id(self, avail_id: int) -> CoacherAvailability | None:
        return self.db.get(CoacherAvailability, avail_id)

    def create(self, coacher_id: int, data: AvailabilityCreate) -> CoacherAvailability:
        new_avail = CoacherAvailability(
            coacher_id=coacher_id,
            weekday=data.weekday,
            start_time=data.start_time,
            end_time=data.end_time
        )
        self.db.add(new_avail)
        self.db.commit()
        self.db.refresh(new_avail)
        return new_avail

    def delete(self, avail_obj: CoacherAvailability):
        self.db.delete(avail_obj)
        self.db.commit()

    def get_slots_in_range(self, coacher_id: int, start_dt: datetime, end_dt: datetime) -> List[OpenSlot]:
        stmt = (
            select(OpenSlot)
            .where(
                OpenSlot.coacher_id == coacher_id,
                OpenSlot.start_at >= start_dt,
                OpenSlot.start_at < end_dt
            )
        )
        return self.db.execute(stmt).scalars().all()

    # --- HÀM MỚI ---
    def bulk_create_slots(self, slots_to_create: List[OpenSlot]) -> int:
        if not slots_to_create:
            return 0

        self.db.add_all(slots_to_create)
        self.db.commit()
        return len(slots_to_create)