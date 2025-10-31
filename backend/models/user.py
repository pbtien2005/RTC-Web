from sqlalchemy import String,Boolean
from sqlalchemy.orm import Mapped,mapped_column,relationship
from core.db import Base

class User(Base):
    __tablename__="users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str]= mapped_column(String(30))
    email: Mapped[str]=mapped_column(String(256),unique=True)
    # phone: Mapped[str]=mapped_column(String(11),unique=True)
    password_hash: Mapped[str]=mapped_column(String(10000))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    


