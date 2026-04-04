from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.utils.dependencies import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/pending-doctors")
def get_pending_doctors(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):

    doctors = db.query(models.User)\
        .filter(models.User.role == "doctor", models.User.is_verified == False)\
        .all()

    return doctors

@router.put("/verify-doctor/{user_id}")
def verify_doctor(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):

    doctor = db.query(models.User).filter(models.User.id == user_id).first()

    if not doctor or doctor.role != "doctor":
        raise HTTPException(status_code=404, detail="Doctor not found")

    doctor.is_verified = True
    db.commit()

    return {"message": "Doctor verified successfully"}