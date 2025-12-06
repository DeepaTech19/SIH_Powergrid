from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Project
from schemas import ProjectResponse

router = APIRouter(prefix="/projects_list", tags=["Projects List"])
