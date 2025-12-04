# routes/project_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Project
from schemas import ProjectCreate, ProjectResponse

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/create", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    new_project = Project(
        user_id=project.user_id,
        project_name=project.project_name,
        project_budget=project.project_budget,
        location=project.location,
        category=project.category,
        tower_type=project.tower_type,
        terrain=project.terrain,
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@router.get("/user/{user_id}", response_model=list[ProjectResponse])
def get_projects_for_user(user_id: int, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.user_id == user_id).all()
    return projects
