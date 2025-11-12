from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Enum, Text, TIMESTAMP, func, Index
import enum
from sqlalchemy import CheckConstraint
from core.db import Base
from datetime import datetime

class MessageRequestStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    expired = "expired"
    blocked = "blocked"


class MessageRequest(Base):
    __tablename__ = "message_requests"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    requester_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    target_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    intro_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[MessageRequestStatus] = mapped_column(
        Enum(MessageRequestStatus, name="message_request_status"),
        default=MessageRequestStatus.pending,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    responded_at: Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    expires_at: Mapped[datetime|None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    handled_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL"),
        nullable=True
    )

    related_conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversations.conversation_id", ondelete="SET NULL"),
        nullable=True
    )

    # Optional relationships (nếu muốn dùng ORM join)
    requester: Mapped["User"] = relationship(
        back_populates="message_requests_sent",
        foreign_keys=[requester_id]
    )

    target: Mapped["User"] = relationship(
        back_populates="message_requests_received",
        foreign_keys=[target_id]
    )

    conversation: Mapped["Conversation | None"] = relationship(
        back_populates="message_requests",
        foreign_keys=[related_conversation_id]
    )

    __table_args__ = (
        CheckConstraint("requester_id <> target_id", name="ck_not_self_request"),
    )
