from sqlalchemy.orm import Session
from sqlalchemy import select,ScalarResult
from models.user import User
from typing import Optional
from datetime import datetime


class UserRepository:
    def __init__(self,db):
        self.db=db

    def get_by_id(self,user_id: int):
        return self.db.execute(select(User).where(User.user_id==user_id)).scalars().first()

    def create_user(self, new_user: User):
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user
    
    def get_by_email(self, email: str):
        return self.db.execute(select(User).where(User.email==email)).scalars().first()
    
    def get_all_by_role(self,role: str):
        return self.db.execute(select(User).where(User.role==role)).scalars().all()
    
    def get_last_login_time(self, user_id: int) -> Optional[datetime]:
        """Lấy thời gian đăng nhập cuối"""
        user = self.db.query(User.last_login_at).filter(User.user_id == user_id).first()
        return user.last_login_at if user else None
