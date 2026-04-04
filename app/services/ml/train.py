import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# from xgboost import XGBClassifier

from .config import DATA_PATH, MODEL_PATH


def train_model():
    data = pd.read_csv(DATA_PATH)

    # Separate Target and features
    target = data["class"]
    features = data.drop("class", axis=1)

    # Store column names
    feature_list = features.columns.tolist()

    # Scale data
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)

    X_train, X_test, y_train, y_test = train_test_split(
        scaled_features, target, test_size=0.2, random_state=42
    )

    # Initialize models
    models = {
        "RandomForest": RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            random_state=42
        ),
        "LogisticRegression": LogisticRegression(max_iter=1000),
        # "XGBoost": XGBClassifier(
        #     n_estimators=200,
        #     max_depth=6,
        #     learning_rate=0.1,
        #     random_state=42,
        #     use_label_encoder=False,
        #     eval_metric='logloss'
        # )
    }

    model = None
    best_accuracy = 0
    best_model_name = ""

    # Train and evaluate all models
    for name, m in models.items():
        m.fit(X_train, y_train)
        predictions = m.predict(X_test)
        acc = accuracy_score(y_test, predictions)

        print(f"{name} Accuracy: {acc:.4f}")

        if acc > best_accuracy:
            best_accuracy = acc
            model = m
            best_model_name = name

    print(f"\nBest Model: {best_model_name} with accuracy {best_accuracy:.4f}")

    # Save best model
    joblib.dump((model, scaler, feature_list), MODEL_PATH)

    print("Model trained successfully")