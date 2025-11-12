from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta,timezone
from core.config import SECRET_KEY,ALGORITHM_TOKEN

# tạo context hash với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto",bcrypt__rounds=12)

# hàm hash mật khẩu
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# hàm kiểm tra mật khẩu khi login
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode=data.copy() #Tao ban sao cua du lieu
    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])
    expire=datetime.now(timezone.utc)+expires_delta #Tinh toan thoi diem het han
    to_encode.update({"exp":expire})
    encode_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM_TOKEN) #Tạo ra cấu trúc JWT và mã hóa chúng
    return encode_jwt

