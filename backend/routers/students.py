from typing import List
from fastapi import APIRouter, FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from core.db import get_db
from schemas.auth_schema import UserOut
from services.user_service import UserService

router=APIRouter(prefix="/students",tags=["student"])
@router.get("/list_coachers", response_model=List[UserOut])
async def get_all_coachers(
    db: Session = Depends(get_db)
):
    service=UserService(db)
    return service.get_list_by_role("coacher")
