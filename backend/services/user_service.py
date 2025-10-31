from repositories.user_repo import UserRepository
from schemas.user_schema import UserCreate
from fastapi import HTTPException, status
from core.security import hash_password
from models.user import User

class UserService:

    def __init__(self,db):
        self.repo=UserRepository(db)

    def create_user(self, payload: UserCreate):
        existing=self.repo.get_user_by_email(payload.email)
        # if existing:
        #     raise HTTPException(
        #         status_code=status.HTTP_400_BAD_REQUEST,
        #         detail="Email already exists",
        #     )
        hashed=hash_password(payload.password)

        user_obj=User(
            username=payload.username,
            email=payload.email,
            password_hash=hashed,
        )
        user=self.repo.create_user(user_obj)
        return user
