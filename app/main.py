from fastapi import FastAPI
from app.database import Base, engine
from app import models

from app.routers import doctors
from app.routers import auth, patients
from app.routers import admin
from app.routers import predictions
from app.routers import appointments
from app.routers import messages


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (for development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(admin.router)
app.include_router(predictions.router)
app.include_router(predictions.router, prefix="/predictions")
app.include_router(appointments.router)
app.include_router(messages.router)

@app.get("/")
def root():
    return {"message": "WellAhead Backend Running. "}

