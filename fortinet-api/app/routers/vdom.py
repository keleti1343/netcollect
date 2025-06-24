from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.vdom import VDOMCreate, VDOMUpdate, VDOMResponse, VDOMPaginationResponse
import app.crud.vdom as crud
import app.crud.firewall as firewall_crud

router = APIRouter(
    prefix="/api/vdoms",
    tags=["vdoms"],
    responses={404: {"description": "VDOM not found"}}
)

@router.get("/", response_model=VDOMPaginationResponse)
def read_vdoms(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    fw_name: Optional[str] = None,
    vdom_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve VDOMs with optional filtering by firewall name and VDOM name.
    """
    firewall_id = None
    if fw_name:
        firewall = firewall_crud.get_firewall_by_name(db, fw_name=fw_name)
        if firewall:
            firewall_id = firewall.firewall_id
        else:
            return {"items": [], "total_count": 0}
            
    db_vdoms, total_count = crud.get_vdoms(db, skip=skip, limit=limit, firewall_id=firewall_id, vdom_name=vdom_name)
    # Convert to response models
    vdoms = [VDOMResponse.from_orm(vdom) for vdom in db_vdoms]
    return {"items": vdoms, "total_count": total_count}

@router.get("/{vdom_id}", response_model=VDOMResponse)
def read_vdom(vdom_id: int, db: Session = Depends(get_db)):
    """
    Get a specific VDOM by ID.
    """
    db_vdom = crud.get_vdom(db, vdom_id=vdom_id)
    if db_vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return VDOMResponse.from_orm(db_vdom)

@router.post("/", response_model=VDOMResponse, status_code=201)
def create_vdom(vdom: VDOMCreate, db: Session = Depends(get_db)):
    """
    Create a new VDOM.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=vdom.firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    # Check for duplicate VDOM name on the same firewall
    existing_vdom = crud.get_vdom_by_name_and_firewall(
        db,
        vdom_name=vdom.vdom_name,
        firewall_id=vdom.firewall_id
    )
    if existing_vdom:
        raise HTTPException(
            status_code=400,
            detail=f"VDOM with name '{vdom.vdom_name}' already exists on this firewall"
        )
    
    new_vdom = crud.create_vdom(db=db, vdom=vdom)
    return VDOMResponse.from_orm(new_vdom)

@router.put("/{vdom_id}", response_model=VDOMResponse)
def update_vdom(
    vdom_id: int,
    vdom: VDOMUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a VDOM by ID.
    """
    db_vdom = crud.update_vdom(db, vdom_id=vdom_id, vdom=vdom)
    if db_vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return VDOMResponse.from_orm(db_vdom)

@router.delete("/{vdom_id}", status_code=204)
def delete_vdom(vdom_id: int, db: Session = Depends(get_db)):
    """
    Delete a VDOM by ID.
    """
    success = crud.delete_vdom(db, vdom_id=vdom_id)
    if not success:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return None