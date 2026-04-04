from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import get_db
from app import models

SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# =========================
# 👤 GET CURRENT USER
# =========================
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# =========================
# 👨‍⚕️ REQUIRE DOCTOR
# =========================
def require_doctor(current_user: models.User = Depends(get_current_user)):
    role = getattr(current_user, "role", "patient")

    if role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")

    return current_user


# =========================
# 🧑 REQUIRE PATIENT
# =========================
def require_patient(current_user: models.User = Depends(get_current_user)):
    role = getattr(current_user, "role", "patient")

    if role != "patient":
        raise HTTPException(status_code=403, detail="Patient access required")

    return current_user


# =========================
# 🛠 REQUIRE ADMIN
# =========================
def require_admin(current_user: models.User = Depends(get_current_user)):
    role = getattr(current_user, "role", "patient")

    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    return current_user