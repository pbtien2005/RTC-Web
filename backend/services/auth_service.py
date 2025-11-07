from datetime import timedelta
from repositories.user_repo import UserRepository
from schemas.auth_schema import RegisterInput
from fastapi import HTTPException, status
from core.security import hash_password,verify_password,create_token
from models.user import User
from schemas.auth_schema import LoginInput
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES,REFRESH_TOKEN_EXPIRE_DAYS

class AuthService:

    def __init__(self,db):
        self.repo=UserRepository(db)

    def create_user(self, payload: RegisterInput):
        existing=self.repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        hashed=hash_password(payload.password)

        user_obj=User(
            email=payload.email,
            password_hash=hashed,
        )
        user=self.repo.create_user(user_obj)
        return user
    
    def login(self, payload: LoginInput):
        user=self.repo.get_by_email(payload.email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,  # Use 404 for "Not Found"
                detail="Email not found",
            )
        if not verify_password(payload.password,user.password_hash):
          raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Wrong password!",
            )
        access_token_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token=create_token(data={"sub":user.user_id, "email":user.email,"type":"access"},expires_delta=access_token_expires)

        refesh_token_exprires=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token=create_token(data={"sub":user.user_id,"email":user.email,"type":"refresh"},expires_delta=refesh_token_exprires)
        return {"access_token":access_token,"refresh_token":refresh_token, "data": user}
        
        