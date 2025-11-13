from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func, Time
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime
from .booking_requests import BookingRequest
from core.db import Base
class BookingRequestItem(Base):
    __tablename__ = "booking_request_items"


    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    booking_request_id: Mapped[int] = mapped_column(
        ForeignKey("booking_requests.id", ondelete="CASCADE"),
        nullable=False
    )

    open_slot_id: Mapped[int] = mapped_column(
        ForeignKey("open_slots.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    # Trạng thái riêng của từng item (optional, nếu bạn muốn quản lý chi tiết từng slot trong 1 request lớn)
    # status: Mapped[BookingStatus] = mapped_column(String(20), default=BookingStatus.PENDING)

    # Relationships
    booking_request: Mapped["BookingRequest"] = relationship(back_populates="items")
    open_slot: Mapped["OpenSlot"] = relationship()

    # Đảm bảo tính duy nhất: Một slot không thể được đặt bởi 2 request khác nhau cùng lúc (đã xử lý bằng unique=True ở cột open_slot_id, nhưng thêm UniqueConstraint cho chắc chắn nếu cần mở rộng)
    # __table_args__ = (
    #     UniqueConstraint("open_slot_id", name="uq_booking_item_slot"),
    # )

    def __repr__(self) -> str:
        return f"<BookingRequestItem id={self.id} request={self.booking_request_id} slot={self.open_slot_id}>"