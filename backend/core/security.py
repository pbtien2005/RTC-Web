import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from core.config import SECRET_KEY, ALGORITHM_TOKEN

# hàm hash mật khẩu
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

# hàm kiểm tra mật khẩu khi login
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire=datetime.now(timezone.utc)+expires_delta #Tinh toan thoi diem het han
    to_encode.update({"exp":expire})
    encode_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM_TOKEN) #Tạo ra cấu trúc JWT và mã hóa chúng
    return encode_jwt

