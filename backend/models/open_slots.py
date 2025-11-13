from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func, Time
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from enum import Enum
from datetime import datetime, date, time

from core.db import Base


# Nhớ import các model liên quan nếu chúng nằm ở file khác
from models.user import Coach
# from models.coacher_availability import CoacherAvailability

class OpenSlotStatus(str, Enum):
    OPEN = "open"  # Đang mở, chưa ai đặt
    ON_HOLD = "on_hold"  # Đang có người giữ chỗ (đang thanh toán...)
    BOOKED = "booked"  # Đã được đặt thành công
    EXPIRED = "expired"  # Đã qua thời gian mà không ai đặt
    CANCELLED = "cancelled"  # Coacher hủy slot này


class OpenSlot(Base):
    __tablename__ = "open_slots"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    coacher_id: Mapped[int] = mapped_column(
        ForeignKey("coaches.account_id", ondelete="CASCADE"),
        nullable=False
    )

    # Link tới cấu hình gốc (để biết slot này sinh ra từ rule nào)
    coacher_availability_id: Mapped[int | None] = mapped_column(
        ForeignKey("coacher_availability.id", ondelete="SET NULL"),
        nullable=True
    )

    # Thời gian thực tế của slot (VD: Ngày 12/11/2025, từ 19:00 đến 19:30)
    # Lưu ý: start_at và end_at nên là datetime (có cả ngày và giờ)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    status: Mapped[OpenSlotStatus] = mapped_column(
        String(20),  # Dùng String để lưu Enum trong DB cho đơn giản, hoặc dùng Enum type của SQLAlchemy
        default=OpenSlotStatus.OPEN,
        nullable=False
    )

    # Relationships
    coacher: Mapped["Coach"] = relationship(foreign_keys=[coacher_id])
    availability: Mapped["CoacherAvailability"] = relationship(foreign_keys=[coacher_availability_id])

    # Nếu có bảng booking_request_items như trong sơ đồ:
    booking_items: Mapped[List["BookingRequestItem"]] = relationship(back_populates="open_slot")

    __table_args__ = (
        # Đảm bảo slot kết thúc sau khi bắt đầu
        CheckConstraint("end_at > start_at", name="ck_openslot_time_valid"),
        # Index để tìm kiếm slot theo thời gian và trạng thái nhanh hơn
        Index("idx_openslot_search", "coacher_id", "start_at", "end_at", "status"),
    )

    def __repr__(self) -> str:
        return f"<OpenSlot id={self.id} coach={self.coacher_id} [{self.start_at} - {self.end_at}] status={self.status}>"