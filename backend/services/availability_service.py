# services/availability_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List
from datetime import datetime, date, time, timedelta, timezone

from repositories.availability_repo import AvailabilityRepository
from models.open_slots import OpenSlot, OpenSlotStatus
from models.coacher_availability import CoacherAvailability


class AvailabilityService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AvailabilityRepository(db)

    def generate_slots_from_rules(
            self,
            coacher_id: int,
            start_date: date,
            days_to_generate: int,
            slot_duration_minutes: int
    ) -> dict:

        # 1. Tính toán khoảng thời gian
        end_date = start_date + timedelta(days=days_to_generate)
        start_dt = datetime.combine(start_date, time.min)
        end_dt = datetime.combine(end_date, time.max)

        # 2. Lấy các quy tắc rảnh và các slot đã tồn tại
        rules = self.repo.get_by_coacher_id(coacher_id)
        existing_slots_list = self.repo.get_slots_in_range(coacher_id, start_dt, end_dt)

        # Dùng Set để tra cứu O(1), nhanh hơn
        existing_slots_set = {slot.start_at for slot in existing_slots_list}

        slots_to_create = []
        slot_duration = timedelta(minutes=slot_duration_minutes)

        # 3. Lặp qua từng ngày trong khoảng thời gian
        current_date = start_date
        while current_date <= end_date:
            # Lấy quy tắc rảnh cho ngày này (0 = T2, 6 = CN)
            current_weekday = current_date.weekday()
            rules_for_day = [r for r in rules if r.weekday == current_weekday]

            if rules_for_day:
                for rule in rules_for_day:
                    # 4. Logic "băm" (chop) slot
                    # Bắt đầu tại: (ngày) + (giờ bắt đầu quy tắc)
                    current_slot_start = datetime.combine(current_date, rule.start_time)
                    # Giờ kết thúc quy tắc
                    rule_end_time = datetime.combine(current_date, rule.end_time)

                    while current_slot_start + slot_duration <= rule_end_time:
                        slot_start_dt = current_slot_start
                        slot_end_dt = current_slot_start + slot_duration

                        # 5. Kiểm tra trùng lặp
                        if slot_start_dt not in existing_slots_set:
                            slots_to_create.append(
                                OpenSlot(
                                    coacher_id=coacher_id,
                                    coacher_availability_id=rule.id,
                                    start_at=slot_start_dt,
                                    end_at=slot_end_dt,
                                    status=OpenSlotStatus.OPEN
                                )
                            )

                        # Chuyển đến slot tiếp theo
                        current_slot_start = slot_end_dt

            # Chuyển sang ngày tiếp theo
            current_date += timedelta(days=1)

        # 6. Lưu vào DB
        newly_created_count = self.repo.bulk_create_slots(slots_to_create)

        return {
            "total_rules_found": len(rules),
            "new_slots_created": newly_created_count,
            "existing_slots_skipped": len(slots_to_create) - newly_created_count + len(existing_slots_set),
            "start_date": start_date,
            "end_date": end_date
        }