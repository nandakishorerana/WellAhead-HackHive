from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.utils.auth import verify_password, hash_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


#REGISTER
@router.post("/register")
def register(data: dict, db: Session = Depends(get_db)):
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "patient")

    specialty = data.get("specialization", None)

    if not name or not email or not password:
        raise HTTPException(status_code=400, detail="All fields required")

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


#LOGIN
@router.post("/login")
def login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")

    user = db.query(models.User).filter(models.User.email == email).first()

    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id   #REQUIRED FOR CHAT
    }