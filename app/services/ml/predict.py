import pandas as pd
from .model_loader import get_model
from .shap_explainer import get_shap_values


def predict_patient(data_dict):

    model, scaler, columns = get_model()

    df = pd.DataFrame([data_dict], columns=columns)

    df_scaled = scaler.transform(df)

    prob = model.predict_proba(df_scaled)[0][1]

    stage = "Low" if prob < 0.3 else "Medium" if prob < 0.7 else "High"

    return {
        "risk": round(float(prob), 3),
        "risk_percent": f"{int(prob * 100)}%",
        "stage": stage,
        "confidence": "High",
        "priority": stage,
        "explanation": get_shap_values(data_dict)
    }