from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_URL: str 

    class Config:
        env_file=".env"
settings = Settings()


SECRET_KEY="your-very-strong-32-byte-random-secret-key"

ALGORITHM_TOKEN = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 100  # Ví dụ: 30 phút
REFRESH_TOKEN_EXPIRE_DAYS = 7