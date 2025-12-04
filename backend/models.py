# models.py
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


# ---------- USER ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    projects = relationship("Project", back_populates="user")


# ---------- PROJECT ----------
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    project_name = Column(String, nullable=False)
    project_budget = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=False)
    tower_type = Column(String, nullable=True)
    terrain = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="projects")
    materials = relationship("Material", back_populates="project")
    predictions = relationship("Prediction", back_populates="project")


# ---------- MATERIAL ----------
class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    material_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    cost = Column(Float, nullable=False)

    project = relationship("Project", back_populates="materials")


# ---------- PREDICTION (optional, for future) ----------
class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    predicted_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="predictions")


# ---------- FORECAST (linked to ML model inputs) ----------
class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(Integer, primary_key=True, index=True)

    # match ML input fields
    project_category_main = Column(String, nullable=False)           # e.g. "Transmission"
    project_type = Column(String, nullable=False)                    # e.g. "400kV"
    project_budget_price_in_lake = Column(Float, nullable=False)     # your "budget in lakh"
    state = Column(String, nullable=False)
    terrain = Column(String, nullable=False)
    distance_from_storage_unit = Column(Float, nullable=False)
    transmission_line_length_km = Column(Float, nullable=False)

    # extra info
    project_name = Column(String, nullable=False)
    location = Column(String, nullable=False)

    # forecast-specific fields
    confidence = Column(Float, nullable=True, default=90)
    status = Column(String, nullable=True, default="Active")
    actual_qty = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)

    # cost fields
    budget = Column(Float, nullable=True)  # Actual budget value
    total = Column(Float, nullable=True)   # Estimated cost including GST

    created_at = Column(DateTime, default=datetime.utcnow)

    # relationship to forecast materials
    forecast_materials = relationship("ForecastMaterial", back_populates="forecast")


# ---------- FORECAST MATERIAL ----------
class ForecastMaterial(Base):
    __tablename__ = "forecast_materials"

    id = Column(Integer, primary_key=True, index=True)
    forecast_id = Column(Integer, ForeignKey("forecasts.id"), nullable=False)
    material_name = Column(String, nullable=False)
    predicted_qty = Column(Float, nullable=False)
    unit = Column(String, nullable=True, default="units")
    unit_cost = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)

    forecast = relationship("Forecast", back_populates="forecast_materials")
