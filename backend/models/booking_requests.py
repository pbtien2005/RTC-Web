from __future__ import annotations
from sqlalchemy import (
    ForeignKey, Integer, String, DateTime, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.db import Base
from datetime import datetime
from models.user import User


class BookingRequest(Base):
    __tablename__ = "booking_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    student_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), 
        nullable=False
    )
    coacher_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), 
        nullable=False
    )

    message: Mapped[str | None] = mapped_column(String(500))
    
    status: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        default='pending' 
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    
    # Mối quan hệ 
    student: Mapped[User] = relationship(foreign_keys=[student_id])
    coacher: Mapped[User] = relationship(foreign_keys=[coacher_id])