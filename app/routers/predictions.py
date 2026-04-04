from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app import models
from app.services.ml.predict import predict_patient
from app.utils.dependencies import get_current_user
from app.services.ml.heart_predict import predict_heart

router = APIRouter(prefix="/predictions", tags=["Predictions"])


# =========================
# 🔄 HELPER FUNCTIONS
# =========================
def convert_yes_no(value):
    if value in ["Yes", "yes", 1, "1", True]:
        return 1
    return 0


def convert_gender(value):
    if value in ["Female", "female", 1, "1"]:
        return 1
    return 0


# =========================
# 🚀 PREDICT FROM FRONTEND
# =========================
@router.post("/predict")
def predict(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        disease_type = data.get("disease_type", "diabetes")

        if disease_type == "diabetes":
            # =========================
            # 🔄 NORMALIZE DIABETES INPUT (SAFE)
            # =========================
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

            # =========================
            # 💾 SAVE HEALTH DATA
            # =========================
            new_data = models.HealthData(
                user_id=current_user.id,
                **formatted
            )

            db.add(new_data)
            db.commit()
            db.refresh(new_data)

            result = predict_patient(formatted)

        elif disease_type == "heart":
            # =========================
            # 🔄 NORMALIZE HEART INPUT
            # =========================
            heart_data = {
                "age": int(data.get("age") or 0),
                "sex": convert_gender(data.get("sex")),  # Assuming sex is sent as Male/Female
                "cp": int(data.get("cp") or 0),
                "trestbps": int(data.get("trestbps") or 0),
                "chol": int(data.get("chol") or 0),
                "fbs": int(data.get("fbs") or 0),
                "restecg": int(data.get("restecg") or 0),
                "thalach": int(data.get("thalach") or 0),
                "exang": int(data.get("exang") or 0),
                "oldpeak": float(data.get("oldpeak") or 0),
                "slope": int(data.get("slope") or 0),
                "ca": int(data.get("ca") or 0),
                "thal": int(data.get("thal") or 0),
            }

            # For heart, we might not save to HealthData since it's different schema
            # Or create a separate HeartHealthData model, but for now skip saving

            result = predict_heart(heart_data)

        elif disease_type == "both":
            # Handle both predictions
            formatted_diabetes = {
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

            heart_data = {
                "age": int(data.get("age") or 0),
                "sex": convert_gender(data.get("sex")),
                "cp": int(data.get("cp") or 0),
                "trestbps": int(data.get("trestbps") or 0),
                "chol": int(data.get("chol") or 0),
                "fbs": int(data.get("fbs") or 0),
                "restecg": int(data.get("restecg") or 0),
                "thalach": int(data.get("thalach") or 0),
                "exang": int(data.get("exang") or 0),
                "oldpeak": float(data.get("oldpeak") or 0),
                "slope": int(data.get("slope") or 0),
                "ca": int(data.get("ca") or 0),
                "thal": int(data.get("thal") or 0),
            }

            # Save diabetes data
            new_data = models.HealthData(
                user_id=current_user.id,
                **formatted_diabetes
            )
            db.add(new_data)
            db.commit()
            db.refresh(new_data)

            result = {
                "diabetes": predict_patient(formatted_diabetes),
                "heart": predict_heart(heart_data)
            }

        # =========================
        # 🛠️ SAFE RESULT HANDLING
        # =========================
        risk = float(result.get("risk", 0))
        stage = result.get("stage", "Low")
        confidence = result.get("confidence", "Medium")
        explanation = result.get("explanation", [])

        # 🔥 clamp risk (avoid 100% bug)
        if risk > 1:
            risk = 1
        if risk < 0:
            risk = 0

        # =========================
        # 💾 SAVE PREDICTION
        # =========================
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


# =========================
# 📊 HISTORY
# =========================
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

# =========================
# 📊 HISTORY FOR DOCTOR
# =========================
@router.get("/history/{user_id}")
def get_patient_history_for_doctor(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 🔒 Only doctor can access
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

@router.post("/predict-heart")
def predict_heart_api(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = predict_heart(data)

    return result