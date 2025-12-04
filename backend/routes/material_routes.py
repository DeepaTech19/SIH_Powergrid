# routes/material_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Material
from schemas import MaterialCreate, MaterialResponse

router = APIRouter(prefix="/materials", tags=["Materials"])


@router.post("/create", response_model=MaterialResponse)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    new_mat = Material(
        project_id=material.project_id,
        material_name=material.material_name,
        quantity=material.quantity,
        cost=material.cost,
    )
    db.add(new_mat)
    db.commit()
    db.refresh(new_mat)
    return new_mat


@router.get("/project/{project_id}", response_model=list[MaterialResponse])
def get_materials_for_project(project_id: int, db: Session = Depends(get_db)):
    mats = db.query(Material).filter(Material.project_id == project_id).all()
    return mats


# NEW: summary endpoint (dummy summary — NO Inventory model needed)
@router.get("/summary")
def material_summary(db: Session = Depends(get_db)):
    mats = db.query(Material).all()

    summary = []
    for m in mats:
        summary.append({
            "id": m.id,
            "name": m.material_name,
            "currentStock": m.quantity,   # no inventory table → we reuse quantity
            "reorderLevel": 0,
            "status": "Good"
        })

    return summary
