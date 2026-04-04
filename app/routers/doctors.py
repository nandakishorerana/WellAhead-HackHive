from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas import UserOut, HealthDataOut

from app import models
from app.database import get_db

from app.utils.dependencies import require_doctor

router = APIRouter(prefix="/doctors", tags=["Doctors"])


# =========================
# GET ALL PATIENTS
# =========================
@router.get("/patients")
def get_all_patients(
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    patients = db.query(models.User)\
        .filter(models.User.role == "patient")\
        .all()

    return patients


# =========================
# GET SINGLE PATIENT
# =========================
@router.get("/patients/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    patient = db.query(models.User)\
        .filter(
            models.User.id == patient_id,
            models.User.role == "patient"
        )\
        .first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    health_data = db.query(models.HealthData)\
        .filter(models.HealthData.user_id == patient_id)\
        .all()

    return {
        "patient": UserOut.from_orm(patient),
        "health_data": [HealthDataOut.from_orm(d) for d in health_data]
    }


# =========================
# GET ALL DOCTORS (🔥 FIXED)
# =========================
@router.get("/")
def get_doctors(db: Session = Depends(get_db)):

    doctors = db.query(models.User)\
        .filter(models.User.role == "doctor")\
        .all()

    # 🔥 RETURN CLEAN FORMAT
    return [
        {
            "id": d.id,   # 👈 VERY IMPORTANT (this matches appointment.doctor_id)
            "name": d.name,
            "specialty": d.specialty or "General Physician"
        }
        for d in doctors
    ]


# =========================
# DOCTOR STATS
# =========================
@router.get("/stats")
def get_doctor_stats(
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    patients = db.query(models.User)\
        .filter(models.User.role == "patient")\
        .all()

    total_patients = len(patients)

    high_risk = 0

    for p in patients:
        latest = db.query(models.Prediction)\
            .filter(models.Prediction.user_id == p.id)\
            .order_by(models.Prediction.id.desc())\
            .first()

        if latest and latest.risk_score and latest.risk_score > 0.7:
            high_risk += 1

    return {
        "total_patients": total_patients,
        "high_risk_patients": high_risk
    }


# =========================
# PRIORITY PATIENTS
# =========================
@router.get("/priority")
def get_priority_patients(
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    patients = db.query(models.User)\
        .filter(models.User.role == "patient")\
        .all()

    result = []

    for p in patients:
        latest = db.query(models.Prediction)\
            .filter(models.Prediction.user_id == p.id)\
            .order_by(models.Prediction.created_at.desc())\
            .first()

        if latest:
            result.append({
                "name": p.name,
                "risk": round((latest.risk_score if latest.risk_score <= 1 else latest.risk_score/100) * 100)
            })

    result.sort(key=lambda x: x["risk"], reverse=True)

    return result[:3]