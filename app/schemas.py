from pydantic import BaseModel, EmailStr, field_validator

#Auth Signup

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

    @field_validator("email")
    def normalize_email(cls, value):
        return value.lower()


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    def normalize_email(cls, value):
        return value.lower()

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

#Health data schema

class HealthDataCreate(BaseModel):
    Age: int
    Gender: int

    Polyuria: int
    Polydipsia: int
    sudden_weight_loss: int
    weakness: int
    Polyphagia: int
    Genital_thrush: int
    visual_blurring: int
    Itching: int
    Irritability: int
    delayed_healing: int
    partial_paresis: int
    muscle_stiffness: int
    Alopecia: int
    Obesity: int

    Glucose: float
    BloodPressure: float
    Insulin: float

class HealthDataOut(BaseModel):
    id: int
    Age: int
    Gender: int
    Glucose: float
    BloodPressure: float
    Insulin: float

    Polyuria: int
    Polydipsia: int
    sudden_weight_loss: int
    weakness: int
    Polyphagia: int
    Genital_thrush: int
    visual_blurring: int
    Itching: int
    Irritability: int
    delayed_healing: int
    partial_paresis: int
    muscle_stiffness: int
    Alopecia: int
    Obesity: int

    class Config:
        from_attributes = True