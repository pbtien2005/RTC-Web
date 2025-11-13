from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func, Time
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import List, Optional
from datetime import time

from core.db import Base


# Nhớ import model Coach nếu nó nằm ở file khác
from models.user import Coach

class CoacherAvailability(Base):
    __tablename__ = "coacher_availability"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    coacher_id: Mapped[int] = mapped_column(
        ForeignKey("coaches.account_id", ondelete="CASCADE"),
        nullable=False
    )

    # 0: Monday, 6: Sunday (hoặc quy ước tùy bạn)
    weekday: Mapped[int] = mapped_column(Integer, nullable=False)

    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    # Relationships
    # Giả sử bên model Coach bạn sẽ thêm: availabilities = relationship("CoacherAvailability", back_populates="coacher")
    coacher: Mapped["Coach"] = relationship(back_populates="availabilities")

    # Nếu bạn đã có model OpenSlot:
    open_slots: Mapped[List["OpenSlot"]] = relationship(back_populates="availability")

    def __repr__(self) -> str:
        return f"<CoacherAvailability id={self.id} coacher_id={self.coacher_id} weekday={self.weekday} {self.start_time}-{self.end_time}>"