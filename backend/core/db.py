from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import DeclarativeBase
from core.config import settings

engine = create_engine(settings.DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class Base(DeclarativeBase):
    pass

