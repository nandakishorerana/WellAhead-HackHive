🧠 WellAhead – AI-Powered Health Risk Analysis System

WellAhead is an AI-driven healthcare platform designed to analyze patient data and predict potential health risks. It provides intelligent insights through a clean dashboard, helping users and healthcare providers make proactive decisions.

🚀 Features
🔍 AI Risk Prediction – Predicts patient health risks using ML models
📊 Interactive Dashboard – Visualizes insights like risk distribution
🤖 Synthetic Data Generation – Uses CTGAN for realistic dataset generation
🔐 Secure Authentication – Login system for users
⚡ FastAPI Backend – High-performance API handling
📁 Structured Project Architecture – Easy to maintain and scale
🛠️ Tech Stack
💻 Backend
FastAPI
Uvicorn
SQLite
SQLAlchemy
🤖 AI / ML
Scikit-learn
XGBoost
KNN
Random Forest
Logistic Regression
🌐 Frontend
HTML, CSS, JavaScript
Bootstrap
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/nandakishorerana/WellAhead-HackHive.git
cd WellAhead-HackHive
2️⃣ Create Virtual Environment
python -m venv venv
venv\Scripts\activate   # Windows
3️⃣ Install Dependencies
pip install -r requirements.txt
4️⃣ Run the Backend Server
uvicorn main:app --reload
5️⃣ Open in Browser
Swagger Docs: http://127.0.0.1:8000/docs
Frontend: Open HTML files manually or via Live Server
📊 How It Works
User logs in
Inputs health-related data
Backend processes data using ML model
AI predicts risk level
Dashboard displays:
Risk distribution
Patient insights
AI recommendations
🧪 AI Model Details
Uses classification algorithms for risk prediction
Synthetic data generated using CTGAN to improve model training
Data preprocessing includes normalization and feature selection
🔐 Authentication
Secure login system
Password hashing using bcrypt
Token-based authentication (JWT)
📌 Future Improvements
🌍 Deploy on cloud (AWS / GCP)
📱 Mobile app integration
🧬 Advanced medical datasets
🧠 Deep learning models
This project is for educational and hackathon purposes.

⭐ Contribution

Feel free to fork, contribute, and improve the project!
