from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["Projects List"])

@router.get("")
def get_all_projects():
    return []
