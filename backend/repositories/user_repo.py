from sqlalchemy.orm import Session
from sqlalchemy import select,ScalarResult
from models.user import User


class UserRepository:
    def __init__(self,db):
        self.db=db

    def get_user(self,user_id: int):
        return self.db.execute(select(User).where(User.id==id))

    def create_user(self, new_user: User):
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        return new_user
    
    def get_by_email(self, email: str):
        return self.db.execute(select(User).where(User.email==email)).scalars().first()