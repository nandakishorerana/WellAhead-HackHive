from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta   # ✅ FIXED

from app.database import get_db
from app import models
from app.utils.dependencies import get_current_user, require_doctor

router = APIRouter(prefix="/appointments", tags=["Appointments"])


# =========================
# 📌 CREATE APPOINTMENT
# =========================
@router.post("/create")
def create_appointment(
    data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    doctor_id = data.get("doctor_id")
    time = data.get("time")

    if not doctor_id or not time:
        raise HTTPException(status_code=400, detail="Missing fields")

    try:
        appointment_time = datetime.fromisoformat(time)
    except:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    if appointment_time < datetime.now():
        raise HTTPException(status_code=400, detail="Cannot book past time")

    existing = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.time == time,
        models.Appointment.status != "rejected"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Slot already booked")

    new_app = models.Appointment(
        patient_id=current_user.id,
        doctor_id=doctor_id,
        time=time,
        status="pending"
    )

    db.add(new_app)
    db.commit()
    db.refresh(new_app)

    return {
        "message": "Appointment requested",
        "appointment_id": new_app.id
    }


# =========================
# 📌 DOCTOR VIEW
# =========================
@router.get("/doctor")
def get_doctor_appointments(
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    apps = db.query(models.Appointment)\
        .filter(models.Appointment.doctor_id == current_user.id)\
        .order_by(models.Appointment.id.desc())\
        .all()

    result = []

    for a in apps:
        patient = db.query(models.User)\
            .filter(models.User.id == a.patient_id)\
            .first()

        result.append({
            "id": a.id,
            "patient_name": patient.name if patient else "Unknown",
            "time": a.time,
            "status": a.status
        })

    return result


# =========================
# 📌 PATIENT VIEW (🔥 FIXED)
# =========================
@router.get("/patient")
def get_patient_appointments(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    apps = db.query(models.Appointment)\
        .filter(models.Appointment.patient_id == current_user.id)\
        .order_by(models.Appointment.id.desc())\
        .all()

    result = []

    for a in apps:
        doctor = db.query(models.User)\
            .filter(models.User.id == a.doctor_id)\
            .first()

        result.append({
            "id": a.id,
            "doctor_id": a.doctor_id,   # 🔥 CRITICAL FIX
            "doctor_name": doctor.name if doctor else "Unknown",
            "time": a.time,
            "status": a.status
        })

    return result


# =========================
# 📌 ACCEPT
# =========================
@router.patch("/{appointment_id}/accept")
def accept_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    app = db.query(models.Appointment)\
        .filter(models.Appointment.id == appointment_id)\
        .first()

    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if app.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    app.status = "confirmed"
    db.commit()

    return {"message": "Appointment accepted"}


# =========================
# 📌 REJECT
# =========================
@router.patch("/{appointment_id}/reject")
def reject_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_doctor)
):
    app = db.query(models.Appointment)\
        .filter(models.Appointment.id == appointment_id)\
        .first()

    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if app.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    app.status = "rejected"
    db.commit()

    return {"message": "Appointment rejected"}


# =========================
# 📌 SLOT SYSTEM (🔥 FIXED)
# =========================
@router.get("/slots/{doctor_id}")
def get_slots(doctor_id: int, date: str, db: Session = Depends(get_db)):

    selected_date = datetime.fromisoformat(date)

    start = selected_date.replace(hour=9, minute=0)
    end = selected_date.replace(hour=17, minute=0)

    slots = []
    current = start

    while current < end:
        slots.append(current.isoformat())
        current += timedelta(minutes=30)

    booked = db.query(models.Appointment).filter(
        models.Appointment.doctor_id == doctor_id,
        models.Appointment.time.like(f"{selected_date.date()}%"),
        models.Appointment.status != "rejected"
    ).all()

    booked_times = [b.time for b in booked]

    return {
        "slots": slots,
        "booked": booked_times
    }