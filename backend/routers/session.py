# routers/session_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.user import User, UserRole
from core.db import get_db
from auth.dependencies import get_current_user
from repositories.session_repo import SessionRepository
from schemas.session_schema import SessionOut

router = APIRouter(prefix="/sessions", tags=["Sessions (Schedule)"])


@router.get("/me", response_model=List[SessionOut])
def get_my_upcoming_sessions(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """
    Lấy lịch các buổi học (sessions) SẮP TỚI
    của user đang đăng nhập (cả Student và Coacher).
    """
    repo = SessionRepository(db)

    is_student = (current_user.role == UserRole.STUDENT.value)

    sessions = repo.get_upcoming_sessions_for_user(
        user_id=current_user.user_id,
        is_student=is_student
    )

    # Pydantic sẽ tự động lọc dữ liệu dựa trên SessionOut
    return sessions