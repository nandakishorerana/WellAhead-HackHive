from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey, Text
from app.database import Base
from sqlalchemy.sql import func
from sqlalchemy import DateTime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="patient")
    specialty = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)


class HealthData(Base):
    __tablename__ = "health_data"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    Age = Column(Integer)
    Gender = Column(Integer)

    Polyuria = Column(Integer)
    Polydipsia = Column(Integer)
    sudden_weight_loss = Column(Integer)
    weakness = Column(Integer)
    Polyphagia = Column(Integer)
    Genital_thrush = Column(Integer)
    visual_blurring = Column(Integer)
    Itching = Column(Integer)
    Irritability = Column(Integer)
    delayed_healing = Column(Integer)
    partial_paresis = Column(Integer)
    muscle_stiffness = Column(Integer)
    Alopecia = Column(Integer)
    Obesity = Column(Integer)

    Glucose = Column(Float)
    BloodPressure = Column(Float)
    Insulin = Column(Float)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    risk_score = Column(Float)
    risk_level = Column(String)
    confidence = Column(String)

    shap_data = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(Integer, ForeignKey("users.id"))
    doctor_id = Column(Integer, ForeignKey("users.id"))

    time = Column(String)
    status = Column(String, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    appointment_id = Column(Integer, ForeignKey("appointments.id"))

    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    content = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())