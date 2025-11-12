
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped,mapped_column,relationship
from typing import List, Optional
from core.db import Base
from enum import Enum
from datetime import datetime

class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True
    )
    sender_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Nội dung + reply thread
    content: Mapped[str | None] = mapped_column(Text)
    reply_to_id: Mapped[int | None] = mapped_column(
        ForeignKey("messages.id", ondelete="SET NULL"), index=True
    )

    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(),default=datetime.now())

    __table_args__ = (
        # Option: cấm cả edited_at & deleted_at cùng lúc? (tuỳ nghiệp vụ)
        # CheckConstraint("NOT (edited_at IS NOT NULL AND deleted_at IS NOT NULL)", name="ck_message_not_both_edit_delete"),
    )

    conversation: Mapped["Conversation"] = relationship(back_populates="messages",foreign_keys=[conversation_id],)
    sender: Mapped["User"] = relationship(back_populates="sent_messages", foreign_keys=[sender_id])

    reply_to: Mapped["Message"] = relationship(
        remote_side=[id], foreign_keys=[reply_to_id]
    )

