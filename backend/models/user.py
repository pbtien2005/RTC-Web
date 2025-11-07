from sqlalchemy import String,Boolean,DateTime, func
from sqlalchemy.orm import Mapped,mapped_column,relationship
from core.db import Base

class User(Base):
    __tablename__="users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str]=mapped_column(String(256),unique=True, nullable=False)
    # phone: Mapped[str]=mapped_column(String(11),unique=True)
    password_hash: Mapped[str]=mapped_column(String(10000))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    is_email: Mapped[bool]= mapped_column(Boolean,default=True)
    last_login_at: Mapped[bool]=mapped_column(DateTime(timezone=True),server_default=func.now())
    created_at: Mapped[bool]=mapped_column(DateTime(timezone=True),server_default=func.now())
    update_at: Mapped[bool]=mapped_column(DateTime(timezone=True),server_default=func.now())

    


