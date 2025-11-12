from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func
)
from sqlalchemy.orm import Mapped,mapped_column,relationship
from typing import List, Optional
from core.db import Base
from enum import Enum
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    user_a_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    user_b_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    last_message_id: Mapped[int | None] = mapped_column(ForeignKey("messages.id", ondelete="SET NULL",use_alter=True))
    last_message_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        # tránh tạo trùng 2 chiều A-B/B-A; cần chuẩn hoá user_a_id < user_b_id ở app
        UniqueConstraint("user_a_id", "user_b_id", name="uq_conversations_pair"),
        CheckConstraint("user_a_id <> user_b_id", name="ck_conversations_distinct_users"),
        # Index phục vụ truy vấn hội thoại của 1 user
        Index("ix_conversations_user_a", "user_a_id"),
        Index("ix_conversations_user_b", "user_b_id"),
    )

    user_a: Mapped["User"] = relationship(
        back_populates="conversations_a", foreign_keys=[user_a_id]
    )
    user_b: Mapped["User"] = relationship(
        back_populates="conversations_b", foreign_keys=[user_b_id]
    )

    messages: Mapped[List["Message"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan",
        foreign_keys="Message.conversation_id",  passive_deletes=True
    )
    states: Mapped[List["ConversationState"]] = relationship(
        back_populates="conversation", cascade="all, delete-orphan"
    )

    last_message: Mapped[Message | None] = relationship(
        foreign_keys=[last_message_id], post_update=True
    )
    message_requests: Mapped[list["MessageRequest"]] = relationship(
        back_populates="conversation",
        foreign_keys="MessageRequest.related_conversation_id"
    )