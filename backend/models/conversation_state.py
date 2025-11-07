from __future__ import annotations
from sqlalchemy import (
    Boolean, CheckConstraint, Date, DateTime, ForeignKey, Integer, String, Text,
    UniqueConstraint, Index, func
)

from core.db import Base
from enum import Enum
from datetime import datetime
from sqlalchemy.orm import Mapped,mapped_column,relationship
from typing import List, Optional

from models.messages import Message

class ConversationState(Base):
    __tablename__ = "conversation_state"

    # composite PK (conversation, user)
    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.conversation_id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True
    )

    last_read_message_id: Mapped[int | None] = mapped_column(
        ForeignKey("messages.id", ondelete="SET NULL")
    )
    last_read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    conversation: Mapped["Conversation"] = relationship(back_populates="states")
    user: Mapped["User"] = relationship(back_populates="states")
    last_read_message: Mapped[Message | None] = relationship(foreign_keys=[last_read_message_id])
