from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.utils.dependencies import require_patient

router = APIRouter(prefix="/patients", tags=["Patients"])


# ✅ ADD HEALTH DATA
@router.post("/health-data")
def add_health_data(
    data: schemas.HealthDataCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_patient)
):

    new_data = models.HealthData(
        user_id=current_user.id,  # ✅ FIXED

        Age=data.Age,
        Gender=data.Gender,

        Polyuria=data.Polyuria,
        Polydipsia=data.Polydipsia,
        sudden_weight_loss=data.sudden_weight_loss,
        weakness=data.weakness,
        Polyphagia=data.Polyphagia,
        Genital_thrush=data.Genital_thrush,
        visual_blurring=data.visual_blurring,
        Itching=data.Itching,
        Irritability=data.Irritability,
        delayed_healing=data.delayed_healing,
        partial_paresis=data.partial_paresis,
        muscle_stiffness=data.muscle_stiffness,
        Alopecia=data.Alopecia,
        Obesity=data.Obesity,

        Glucose=data.Glucose,
        BloodPressure=data.BloodPressure,
        Insulin=data.Insulin
    )

    db.add(new_data)
    db.commit()
    db.refresh(new_data)

    return {"message": "Health data saved"}


# ✅ GET HISTORY
@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user = Depends(require_patient)
):

    data = db.query(models.HealthData)\
        .filter(models.HealthData.user_id == current_user.id)\
        .all()

    return data


# ✅ GET LATEST
@router.get("/latest")
def get_latest(
    db: Session = Depends(get_db),
    current_user = Depends(require_patient)
):

    data = db.query(models.HealthData)\
        .filter(models.HealthData.user_id == current_user.id)\
        .order_by(models.HealthData.id.desc())\
        .first()

    return data