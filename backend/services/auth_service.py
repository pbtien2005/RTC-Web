from datetime import timedelta
from auth.dependencies import create_access_token, create_refresh_token, decode_token
from repositories.user_repo import UserRepository
from schemas.auth_schema import RegisterInput
from fastapi import HTTPException, status
from core.security import hash_password,verify_password,create_token
from models.user import User, Student, UserRole 
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
        
        if user_obj.role == UserRole.STUDENT.value:
            new_student_details = Student(
                slot_quota=0,  
                slot_used=0
            )
            user_obj.student = new_student_details 

        user=self.repo.create_user(user_obj)
        return user
    
    def login(self, payload: LoginInput):
        user=self.repo.get_by_email(payload.email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Email not found",
            )
        if not verify_password(payload.password,user.password_hash):
          raise HTTPException(
              status_code=status.HTTP_401_UNAUTHORIZED,
              detail="Wrong password!",
            )
        
        access_token_expires=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token=create_token(data={"sub":str(user.user_id), "email":user.email,"type":"access"},expires_delta=access_token_expires)

        refesh_token_exprires=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        refresh_token=create_token(data={"sub":str(user.user_id),"email":user.email,"type":"refresh"},expires_delta=refesh_token_exprires)
        return {"access_token":access_token,"refresh_token":refresh_token, "data": user}
        
async def rotate_refresh_and_issue_access(refresh_token: str):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    # 1) Giải mã & kiểm tra loại
    try:
        payload = decode_token(refresh_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Wrong token type")

    user_id = payload.get("sub")
    if not user_id :
        raise HTTPException(status_code=401, detail="Invalid token payload")


    new_access = create_access_token(sub=user_id)

    # 4) Xoay vòng refresh (khuyến nghị)
    new_refresh = create_refresh_token(sub=user_id)

    return new_access, new_refresh
