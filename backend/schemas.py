# schemas.py
from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


# ---------- USER ----------
class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True  # replaces orm_mode in Pydantic v2


# ---------- PROJECT ----------
class ProjectCreate(BaseModel):
    user_id: int
    project_name: str
    project_budget: float
    location: str
    category: str
    tower_type: str | None = None
    terrain: str | None = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    project_name: str
    project_budget: float
    location: str
    category: str
    tower_type: str | None
    terrain: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- MATERIAL ----------
class MaterialCreate(BaseModel):
    project_id: int
    material_name: str
    quantity: float
    cost: float


class MaterialResponse(BaseModel):
    id: int
    project_id: int
    material_name: str
    quantity: float
    cost: float

    class Config:
        from_attributes = True


# ---------- FORECAST INPUT (for Swagger + ML) ----------
class ForecastInput(BaseModel):
    project_category_main: str
    project_type: str
    project_budget_price_in_lake: float
    state: str
    terrain: str
    distance_from_storage_unit: float
    transmission_line_length_km: float
    location: str
    project_name: str


# ---------- FORECAST RESPONSE ----------
class ForecastResponse(BaseModel):
    id: int
    project_category_main: str
    project_type: str
    project_budget_price_in_lake: float
    state: str
    terrain: str
    distance_from_storage_unit: float
    transmission_line_length_km: float
    location: str
    project_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- MATERIAL PREDICTION ----------
class MaterialPrediction(BaseModel):
    material_name: str
    predicted_value: float


class ForecastWithPredictions(BaseModel):
    forecast: ForecastResponse
    predictions: List[MaterialPrediction]
