from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey
from app.database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # patient / doctor
    is_verified = Column(Boolean, default=False)