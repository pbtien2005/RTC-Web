from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from datetime import datetime, date, time
from models.open_slots import OpenSlot, OpenSlotStatus

class SlotRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_slots_for_coach_in_range(
                self,
                coacher_id: int,
                start_dt: datetime,
                end_dt: datetime
        ) -> List[OpenSlot]:

            stmt = (
                select(OpenSlot)
                .where(
                    OpenSlot.coacher_id == coacher_id,
                    OpenSlot.start_at >= start_dt,
                    OpenSlot.start_at < end_dt
                )
                .order_by(OpenSlot.start_at.asc())
            )


            return self.db.execute(stmt).scalars().all()

    def get_available_slots_for_coach(
        self,
        coacher_id: int,
        start_dt: datetime,
        end_dt: datetime
    ) -> List[OpenSlot]:
        """Lấy các slot đang 'open' của coacher trong một khoảng thời gian."""
        stmt = (
            select(OpenSlot)
            .where(
                OpenSlot.coacher_id == coacher_id,
                OpenSlot.status == OpenSlotStatus.OPEN,
                OpenSlot.start_at >= start_dt,
                OpenSlot.start_at < end_dt
            )
            .order_by(OpenSlot.start_at)
        )
        return self.db.execute(stmt).scalars().all()

    def get_future_slots_for_coach(self, coacher_id: int) -> List[OpenSlot]:
        now = datetime.now()
        stmt = (
            select(OpenSlot)
            .where(
                OpenSlot.coacher_id == coacher_id,
                OpenSlot.start_at > now
            )
            .order_by(OpenSlot.start_at.asc())
        )
        return self.db.execute(stmt).scalars().all()

    def get_slot_by_id_and_coach(self, slot_id: int, coacher_id: int) -> OpenSlot | None:
        """Lấy 1 slot và đảm bảo nó thuộc về đúng coacher"""
        stmt = (
            select(OpenSlot)
            .where(
                OpenSlot.id == slot_id,
                OpenSlot.coacher_id == coacher_id
            )
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def save_slot(self, slot: OpenSlot) -> OpenSlot:
            self.db.add(slot)
            self.db.commit()
            self.db.refresh(slot)
            return slot