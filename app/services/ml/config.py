import os

# Go to project root (3 levels up from this file)
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../")
)

# Correct paths
DATA_PATH = os.path.join(BASE_DIR, "dataset", "diabetes.csv")
MODEL_PATH = os.path.join(BASE_DIR, "artifacts", "pipeline.pkl")

# Debug (VERY IMPORTANT)
print("BASE_DIR:", BASE_DIR)
print("DATA_PATH:", DATA_PATH)