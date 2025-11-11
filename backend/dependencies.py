from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from core.config import SECRET_KEY, ALGORITHM_TOKEN
from core.db import get_db
from repositories.user_repo import UserRepository
from models.user import User, UserRole
import sys

# 1. Tạo một scheme bảo mật đơn giản, tìm header tên "Authorization"
auth_header_scheme = APIKeyHeader(name="Authorization", auto_error=False)

# 2. Định nghĩa lỗi 401 (Dùng chung)
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

def get_current_user(
    token: str = Depends(auth_header_scheme), 
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        print("2. KẾT QUẢ: Thất bại (Token là None). Báo lỗi 401.", file=sys.stderr)
        raise credentials_exception

    try:
        scheme, token_value = token.split(" ", 1)
    except ValueError:
        print(f"2. KẾT QUẢ: Thất bại (Format không phải 'Bearer <token>'). Báo lỗi 401.", file=sys.stderr)
        raise credentials_exception
    
    if scheme.lower() != "bearer":
        print(f"2. KẾT QUẢ: Thất bại (Scheme không phải 'bearer'). Báo lỗi 401.", file=sys.stderr)
        raise credentials_exception
    
    
    try:
        payload = jwt.decode(token_value, SECRET_KEY, algorithms=[ALGORITHM_TOKEN])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
        

    except (JWTError, ValueError, TypeError) as e:
        print(f"3. KẾT QUẢ: Thất bại (Lỗi giải mã Token: {e}). Báo lỗi 401.", file=sys.stderr)
        raise credentials_exception
    
    # Load UserRepo
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id) 
    
    
    if user is None:
        print(f"5. KẾT QUẢ: Thất bại (User ID {user_id} không tìm thấy trong CSDL). Báo lỗi 401.", file=sys.stderr)
        raise credentials_exception

    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency gác cổng: Đảm bảo user hiện tại là Admin.
    """
    if current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user