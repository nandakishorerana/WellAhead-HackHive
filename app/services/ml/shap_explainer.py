import shap
import pandas as pd
import numpy as np
from .model_loader import get_model

explainer = None


def get_explainer():
    global explainer

    if explainer is None:
        model, _, _ = get_model()
        explainer = shap.Explainer(model)

    return explainer


def get_shap_values(data_dict):
    model, scaler, columns = get_model()

    df = pd.DataFrame([data_dict], columns=columns)
    df_scaled = scaler.transform(df)

    explainer = get_explainer()
    shap_values = explainer(df_scaled)

    values = shap_values.values[0]

    result = []

    for col, val in zip(columns, values):
        try:
            val = float(np.array(val).flatten()[0])
        except:
            val = 0.0

        result.append({
            "feature": col,
            "impact": val
        })

    result = sorted(result, key=lambda x: abs(x["impact"]), reverse=True)

    return result[:8]