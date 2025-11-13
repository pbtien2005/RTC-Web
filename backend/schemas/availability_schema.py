from pydantic import BaseModel, Field
from typing import Optional
from datetime import time, date


class AvailabilityBase(BaseModel):
    weekday: int = Field(..., ge=0, le=6)
    start_time: time
    end_time: time

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityOut(AvailabilityBase):
    id: int
    coacher_id: int

class GenerateSlotsInput(BaseModel):

        start_date: date = Field(..., description="Ngày bắt đầu, VD: 2025-11-20")

        days_to_generate: int = Field(14, ge=1, le=60, description="Số ngày muốn tạo (tối đa 60)")

        slot_duration_minutes: int = Field(30, ge=15)

class GenerateSlotsOutput(BaseModel):

        total_rules_found: int
        new_slots_created: int
        existing_slots_skipped: int
        start_date: date
        end_date: date
model_config = { "from_attributes": True }