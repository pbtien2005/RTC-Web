from fastapi import APIRouter, Depends, Request,Response
from sqlalchemy.orm import Session
from schemas.auth_schema import RegisterInput,RegisterOutput
from core.db import get_db
from core.config import REFRESH_TOKEN_EXPIRE_DAYS
from services.auth_service import AuthService,rotate_refresh_and_issue_access
from fastapi import Form
from schemas.auth_schema import LoginInput


router=APIRouter(prefix="/auth",tags=["auths"]) #Tạo nhóm endpoint

@router.post("/register",response_model=RegisterOutput)
def create_user(payload: RegisterInput = Depends(RegisterInput.as_form),db: Session=Depends(get_db)):
    service=AuthService(db)
    user=service.create_user(payload)
    return user

@router.post("/login")
def login(response: Response, payload: LoginInput=Depends(LoginInput.as_form), db: Session=Depends(get_db)):
    service=AuthService(db)
    token=service.login(payload=payload)
    response.set_cookie(
        key="refresh_token",
        value=token["refresh_token"],
        httponly=True,       # Quan trọng: Ngăn JS truy cập
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60, # Thời gian sống của cookie
        samesite="lax",      # Giảm nguy cơ tấn công CSRF
        secure=False
    )
    return {"access_token": token["access_token"], "token_type": "bearer","user": token["data"]}

@router.post("/refresh")
async def refresh(request:Request, response:Response):
    print("cookies keys:", list(request.cookies.keys()))
    refresh=request.cookies.get("refresh_token",None)
    new_access,new_refresh=await rotate_refresh_and_issue_access(refresh)

    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=False,      # True khi HTTPS
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )


    return {"access_token": new_access, "token_type": "bearer"}