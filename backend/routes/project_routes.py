# routes/project_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Project
from schemas import ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


# ------------------------------
# CREATE PROJECT
# ------------------------------
@router.post("/create", response_model=ProjectResponse)
def create_project(data: dict, db: Session = Depends(get_db)):
    new_project = Project(
        user_id=data.get("user_id", 1),
        name=data.get("projectName"),
        region=data.get("region"),
        location=data.get("state"),
        budget=float(data.get("budget", 0) or 0),
        line_length=float(data.get("lineLength", 0) or 0),
        project_type=data.get("projectType"),
        start_date=data.get("startDate"),
        end_date=data.get("endDate"),
        status="Active",
        completion=0
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


# ------------------------------
# GET ALL PROJECTS (used by frontend)
# ------------------------------
@router.get("", response_model=list[ProjectResponse])
def get_all_projects(db: Session = Depends(get_db)):
    """Return all projects as JSON in proper schema format."""
    projects = db.query(Project).all()
    return projects


# ------------------------------
# GET PROJECTS FOR SPECIFIC USER
# ------------------------------
@router.get("/user/{user_id}", response_model=list[ProjectResponse])
def get_projects_for_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.user_id == user_id).all()
