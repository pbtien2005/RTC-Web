from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import datetime
from enum import Enum

from core.db import Base


class SessionStatus(str, Enum):
    SCHEDULED = "scheduled"  # Đã lên lịch, chờ diễn ra
    ONGOING = "ongoing"  # Đang diễn ra
    COMPLETED = "completed"  # Đã kết thúc thành công
    CANCELLED = "cancelled"  # Bị hủy trước khi diễn ra
    ABSENT_STUDENT = "absent_student"  # Học viên vắng mặt
    ABSENT_COACH = "absent_coach"  # Coach vắng mặt


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    coacher_id: Mapped[int] = mapped_column(
        ForeignKey("coaches.account_id", ondelete="RESTRICT"),  # Không cho xóa Coach nếu đã có session
        nullable=False
    )
    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.account_id", ondelete="RESTRICT"),  # Tương tự với Student
        nullable=False
    )

    # Link tới request item gốc để truy xuất nguồn gốc (optional nhưng nên có)
    booking_item_id: Mapped[int | None] = mapped_column(
        ForeignKey("booking_request_items.id", ondelete="SET NULL"),
        nullable=True,
        unique=True  # Một booking item chỉ tạo ra tối đa 1 session
    )

    # Lưu lại thời gian cụ thể (độc lập với OpenSlot để giữ lịch sử)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    status: Mapped[SessionStatus] = mapped_column(
        String(20),
        default=SessionStatus.SCHEDULED,
        nullable=False
    )

    # Link phòng học (Google Meet, Zoom...)
    meeting_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Ghi chú sau buổi học (feedback, bài tập về nhà...)
    coach_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    student_feedback: Mapped[str | None] = mapped_column(Text, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Ví dụ: 1-5 sao

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    coacher: Mapped["Coach"] = relationship(foreign_keys=[coacher_id])
    student: Mapped["Student"] = relationship(foreign_keys=[student_id])
    booking_item: Mapped["BookingRequestItem"] = relationship()

    __table_args__ = (
        CheckConstraint("end_at > start_at", name="ck_session_time_valid"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_session_rating_range"),
    )

    def __repr__(self) -> str:
        return f"<Session id={self.id} coach={self.coacher_id} student={self.student_id} status={self.status}>"