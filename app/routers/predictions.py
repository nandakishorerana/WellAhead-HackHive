from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app import models
from app.services.ml.predict import predict_patient
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/predictions", tags=["Predictions"])


#HELPER FUNCTIONS
def convert_yes_no(value):
    if value in ["Yes", "yes", 1, "1", True]:
        return 1
    return 0


def convert_gender(value):
    if value in ["Female", "female", 1, "1"]:
        return 1
    return 0

#PREDICT FROM FRONTEND
@router.post("/predict")
def predict(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        # NORMALIZE INPUT (SAFE)
        formatted = {
            "Age": int(data.get("Age") or 0),
            "Gender": convert_gender(data.get("Gender")),

            "Polyuria": convert_yes_no(data.get("Polyuria")),
            "Polydipsia": convert_yes_no(data.get("Polydipsia")),
            "sudden_weight_loss": convert_yes_no(data.get("sudden_weight_loss")),
            "weakness": convert_yes_no(data.get("weakness")),
            "Polyphagia": convert_yes_no(data.get("Polyphagia")),
            "Genital_thrush": convert_yes_no(data.get("genital_thrush")),
            "visual_blurring": convert_yes_no(data.get("visual_blurring")),
            "Itching": convert_yes_no(data.get("itching")),
            "Irritability": convert_yes_no(data.get("Irritability")),
            "delayed_healing": convert_yes_no(data.get("delayed_healing")),
            "partial_paresis": convert_yes_no(data.get("partial_paresis")),
            "muscle_stiffness": convert_yes_no(data.get("muscle_stiffness")),
            "Alopecia": convert_yes_no(data.get("alopecia")),
            "Obesity": convert_yes_no(data.get("Obesity")),

            "Glucose": float(data.get("Glucose") or 0),
            "BloodPressure": float(data.get("BloodPressure") or 0),
            "Insulin": float(data.get("Insulin") or 0)
        }

        #SAVE HEALTH DATA
        new_data = models.HealthData(
            user_id=current_user.id,
            **formatted
        )

        db.add(new_data)
        db.commit()
        db.refresh(new_data)

        #RUN MODEL
        result = predict_patient(formatted)

        #SAFE RESULT HANDLING
        risk = float(result.get("risk", 0))
        stage = result.get("stage", "Low")
        confidence = result.get("confidence", "Medium")
        explanation = result.get("explanation", [])

        #clamp risk
        if risk > 1:
            risk = 1
        if risk < 0:
            risk = 0

        #SAVE PREDICTION
        new_prediction = models.Prediction(
            user_id=current_user.id,
            risk_score=risk,
            risk_level=stage,
            confidence=confidence,
            shap_data=json.dumps(explanation)
        )

        db.add(new_prediction)
        db.commit()

        return {
            "risk": risk,
            "stage": stage,
            "confidence": confidence,
            "explanation": explanation
        }

    except Exception as e:
        print("🔥 ERROR IN PREDICT:", e)
        raise HTTPException(status_code=500, detail=str(e))


#HISTORY
@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    data = db.query(models.Prediction)\
        .filter(models.Prediction.user_id == current_user.id)\
        .order_by(models.Prediction.created_at)\
        .all()

    result = []

    for item in data:
        result.append({
            "id": item.id,
            "risk_score": float(item.risk_score or 0),
            "risk_level": item.risk_level,
            "confidence": item.confidence,
            "created_at": item.created_at,
            "explanation": json.loads(item.shap_data) if item.shap_data else []
        })

    return result

#HISTORY FOR DOCTOR
@router.get("/history/{user_id}")
def get_patient_history_for_doctor(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    #Only doctor can access
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Not authorized")

    data = db.query(models.Prediction)\
        .filter(models.Prediction.user_id == user_id)\
        .order_by(models.Prediction.created_at)\
        .all()

    result = []

    for item in data:
        result.append({
            "id": item.id,
            "risk_score": float(item.risk_score or 0),
            "risk_level": item.risk_level,
            "confidence": item.confidence,
            "created_at": item.created_at,
            "explanation": json.loads(item.shap_data) if item.shap_data else []
        })

    return result