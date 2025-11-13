# repositories/session_repo.py
from datetime import datetime
from typing import List

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from models.session import  Session, SessionStatus
from models.user import User,Student, Coach  # Cần để join


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_upcoming_sessions_for_user(self, user_id: int, is_student: bool) -> List[Session]:
        now = datetime.now()

        query = (
            select(Session)
            .where(
                Session.status == SessionStatus.SCHEDULED,
                Session.start_at > now
            )
        )

        if is_student:
            query = query.where(Session.student_id == user_id)
            query = query.options(joinedload(Session.coacher).joinedload(Coach.user))
        else:
            query = query.where(Session.coacher_id == user_id)
            query = query.options(joinedload(Session.student).joinedload(Student.user))

        query = query.order_by(Session.start_at.asc())
        return self.db.execute(query).scalars().all()