from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import UserOut,UserCreate
from core.db import get_db
from services.user_service import UserService
from fastapi import Form


router=APIRouter(prefix="/users",tags=["users"]) #Tạo nhóm endpoint

@router.post("/register",response_model=UserOut)
def create_user(username:str=Form(...),email:str=Form(...),password:str=Form(...),db: Session=Depends(get_db)):
    service=UserService(db)
    user=service.create_user(
        UserCreate(
        username=username,
        email=email,
        password=password,)
    )
    return user