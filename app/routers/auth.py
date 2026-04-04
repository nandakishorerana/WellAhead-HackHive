from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.utils.auth import verify_password, hash_password, create_access_token
import re

router = APIRouter(prefix="/auth", tags=["Auth"])


# ================= VALIDATION FUNCTIONS =================

def validate_email(email: str):
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(email_regex, email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # OPTIONAL: restrict domains
    # allowed_domains = ["gmail.com", "yahoo.com"]
    # domain = email.split("@")[-1]
    # if domain not in allowed_domains:
    #     raise HTTPException(status_code=400, detail="Email domain not allowed")


def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Password must contain an uppercase letter")

    if not re.search(r"[a-z]", password):
        raise HTTPException(status_code=400, detail="Password must contain a lowercase letter")

    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="Password must contain a number")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Password must contain a special character")


# ================= REGISTER =================
@router.post("/register")
def register(data: dict, db: Session = Depends(get_db)):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")

    specialty = data.get("specialization", None)

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="All fields required")

    # 🔥 VALIDATION
    email = email.lower()
    validate_email(email)
    validate_password(password)

    existing = db.query(models.User).filter(models.User.email == email).first()

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(
        name=name,
        email=email,
        password=hash_password(password),
        role=role,
        specialty=specialty if role == "doctor" else None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


# ================= LOGIN =================
@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")

    email = email.lower()

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id
    }