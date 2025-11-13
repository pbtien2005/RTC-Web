from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func, Time
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime

from core.db import Base
from enum import Enum

from models.user import User, Coach, Student

class BookingStatus(str, Enum):
    PENDING = "pending"     # Đang chờ coacher duyệt
    APPROVED = "approved"   # Coacher đã đồng ý
    REJECTED = "rejected"   # Coacher từ chối
    EXPIRED = "expired"     # Quá hạn xử lý
    CANCELLED = "cancelled" # Student tự hủy yêu cầu

class DecidedBy(str, Enum):
    COACH = "coach"
    SYSTEM = "system"       # Ví dụ: tự động hết hạn
    STUDENT = "student"     # Student tự hủy




class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.account_id", ondelete="CASCADE"),
        nullable=False
    )
    coacher_id: Mapped[int] = mapped_column(
        ForeignKey("coaches.account_id", ondelete="CASCADE"),
        nullable=False
    )

    message: Mapped[str | None] = mapped_column(Text, nullable=True)  # Lời nhắn của student khi đặt

    status: Mapped[BookingStatus] = mapped_column(
        String(20),
        default=BookingStatus.PENDING,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    decided_by: Mapped[DecidedBy | None] = mapped_column(String(20), nullable=True)

    # Relationships
    student: Mapped["Student"] = relationship(foreign_keys=[student_id])
    coacher: Mapped["Coach"] = relationship(foreign_keys=[coacher_id])

    items: Mapped[List["BookingRequestItem"]] = relationship(
        back_populates="booking_request",
        cascade="all, delete-orphan"  # Xóa request thì xóa luôn các item con
    )

    def __repr__(self) -> str:
        return f"<BookingRequest id={self.id} student={self.student_id} coach={self.coacher_id} status={self.status}>"