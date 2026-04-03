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