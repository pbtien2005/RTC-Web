# auth/dependencies.py
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError, ExpiredSignatureError
from sqlalchemy.orm import Session
from core.db import get_db
from models.user import User
from core.security import SECRET_KEY,ALGORITHM_TOKEN
from jose import jwt


 
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
