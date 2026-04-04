import joblib
import numpy as np
import os

# 🔥 path to your saved heart model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../../artifacts/heart_model.pkl")

model = None
scaler = None
features = None

def load_model():
    global model, scaler, features
    if model is None:
        model, scaler, features = joblib.load(MODEL_PATH)


def predict_heart(data: dict):

    load_model()

    # 🔥 ORDER MUST MATCH TRAINING
    input_data = [
        data.get("age", 0),
        data.get("sex", 0),
        data.get("cp", 0),
        data.get("trestbps", 0),
        data.get("chol", 0),
        data.get("fbs", 0),
        data.get("restecg", 0),
        data.get("thalach", 0),
        data.get("exang", 0),
        data.get("oldpeak", 0.0),
        data.get("slope", 0),
        data.get("ca", 0),
        data.get("thal", 0),
    ]

    X = np.array(input_data).reshape(1, -1)

    X = scaler.transform(X)

    prob = model.predict_proba(X)[0][1]

    return {
        "risk": float(prob),
        "stage": "High" if prob > 0.6 else "Medium" if prob > 0.3 else "Low",
        "confidence": "High",
        "explanation": []  # later we add SHAP
    }