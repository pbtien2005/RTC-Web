
from sqlalchemy import (
    DateTime, ForeignKey, Integer, String,  func
)
from sqlalchemy.orm import Mapped,mapped_column,relationship
from typing import List, Optional
from core.db import Base
from enum import Enum
from datetime import datetime,date

class UserCertificate(Base):
    __tablename__ = "user_certificates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255))
    image_url: Mapped[str | None] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="certificates")
