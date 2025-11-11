# auth/dependencies.py
import uuid
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from core.db import get_db
from models.user import User
from core.config import SECRET_KEY,ALGORITHM_TOKEN,ACCESS_TOKEN_EXPIRE_MINUTES,REFRESH_TOKEN_EXPIRE_DAYS
from jose import jwt
from datetime import datetime,timedelta,timezone

def _now():
    return datetime.now(timezone.utc)
 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):  
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM_TOKEN, options={"verify_sub": False})
        user_id: int = payload.get("sub")
    except ExpiredSignatureError:
        print("alo")
        raise HTTPException(status_code=401,detail="token out of date")
    except JWTError:
        print(JWTError)
        raise HTTPException(status_code=401, detail="Invalidzsdz token")

    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def create_access_token(sub: str, extra: dict | None = None) -> str:
    to_encode = {
        "sub": str(sub),
        "type": "access",
        "exp": _now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": _now(),
        "jti": str(uuid.uuid4()),
    }
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM_TOKEN)

def create_refresh_token(sub: str, extra: dict | None = None) -> str:
    to_encode = {
        "sub": str(sub),
        "type": "refresh",
        "exp": _now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": _now(),
        "jti": str(uuid.uuid4()),
        # có thể thêm "rot": true để đánh dấu sẽ xoay vòng
    }
    if extra:
        to_encode.update(extra)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM_TOKEN)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM_TOKEN)
    except JWTError as e:
        raise ValueError("invalid_token") from e
    