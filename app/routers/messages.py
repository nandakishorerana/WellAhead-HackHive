from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])


# =========================
# 📌 GET MESSAGES
# =========================
@router.get("/{appointment_id}")
def get_messages(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    app = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # 🔥 only allowed users
    if current_user.id not in [app.patient_id, app.doctor_id]:
        raise HTTPException(status_code=403, detail="Not allowed")

    if app.status != "confirmed":
        raise HTTPException(status_code=400, detail="Chat not allowed yet")

    messages = db.query(models.Message)\
        .filter(models.Message.appointment_id == appointment_id)\
        .order_by(models.Message.id)\
        .all()

    return messages


# =========================
# 📌 SEND MESSAGE
# =========================
@router.post("/send")
def send_message(
    data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    appointment_id = data.get("appointment_id")
    content = data.get("content")

    if not appointment_id or not content:
        raise HTTPException(status_code=400, detail="Missing fields")

    app = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id
    ).first()

    if not app:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if app.status != "confirmed":
        raise HTTPException(status_code=400, detail="Chat not allowed")

    # determine receiver
    if current_user.id == app.patient_id:
        receiver = app.doctor_id
    else:
        receiver = app.patient_id

    msg = models.Message(
        appointment_id=appointment_id,
        sender_id=current_user.id,
        receiver_id=receiver,
        content=content
    )

    db.add(msg)
    db.commit()

    return {"message": "sent"}