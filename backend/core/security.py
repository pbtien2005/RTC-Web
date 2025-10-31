from passlib.context import CryptContext

# tạo context hash với thuật toán bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# hàm hash mật khẩu
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# hàm kiểm tra mật khẩu khi login
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
