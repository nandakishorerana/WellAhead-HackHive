import joblib
import os
from .config import MODEL_PATH
from .train import train_model

model = None
scaler = None
columns = None


def get_model():
    global model, scaler, columns

    if model is None:
        if not os.path.exists(MODEL_PATH):
            train_model()

        model, scaler, columns = joblib.load(MODEL_PATH)

    return model, scaler, columns