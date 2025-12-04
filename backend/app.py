# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes import (
    auth_routes,
    project_routes,
    material_routes,
    prediction_routes,
    forecast,  # <-- main ML + save + fetch routes
    dashboard_routes,          # ✅ ADD THIS
    project_list_routes        # ✅ ADD THIS
)

# Auto-create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SIH Backend + ML API")

# Enable frontend connection (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to specific frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------
# ROUTE REGISTRATIONS
# -------------------
app.include_router(auth_routes.router)          # login, register
app.include_router(project_routes.router)       # project management
app.include_router(material_routes.router)      # material DB CRUD
app.include_router(prediction_routes.router)    # historical prediction logs
app.include_router(forecast.router)  
app.include_router(dashboard_routes.router)
app.include_router(project_list_routes.router)           # ML prediction + save route

@app.get("/")
def root():
    return {"message": "🚀 Backend is running successfully"}
