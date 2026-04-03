from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.utils.security import hash_password, verify_password
from app.utils.token import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


# REGISTER
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    if user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin cannot be registered publicly"
        )

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user.role == "doctor":
        is_verified = False
    else:
        is_verified = True

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role,
        is_verified=is_verified
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# LOGIN
@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if db_user.role == "doctor" and not db_user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Doctor not verified yet"
        )

    access_token = create_access_token(
        data={"user_id": db_user.id, "role": db_user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }