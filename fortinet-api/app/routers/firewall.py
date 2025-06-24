from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.firewall import FirewallCreate, FirewallUpdate, FirewallResponse, FirewallPaginationResponse
import app.crud.firewall as crud

router = APIRouter(
    prefix="/api/firewalls",
    tags=["firewalls"],
    responses={404: {"description": "Firewall not found"}}
)

from app.schemas.firewall import FirewallPaginationResponse

@router.get("/", response_model=FirewallPaginationResponse)
def read_firewalls(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=200),
    fw_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve firewalls with optional filtering by name.
    """
    db_firewalls, total_count = crud.get_firewalls(db, skip=skip, limit=limit, fw_name=fw_name)
    # Convert SQLAlchemy models to Pydantic schemas
    firewalls = [FirewallResponse.from_orm(fw) for fw in db_firewalls]
    return {"items": firewalls, "total_count": total_count}

@router.get("/{firewall_id}", response_model=FirewallResponse)
def read_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """
    Get a specific firewall by ID.
    """
    db_firewall = crud.get_firewall(db, firewall_id=firewall_id)
    if db_firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return db_firewall

@router.post("/", response_model=FirewallResponse, status_code=201)
def create_firewall(firewall: FirewallCreate, db: Session = Depends(get_db)):
    """
    Create a new firewall.
    """
    db_firewall = crud.get_firewall_by_name(db, fw_name=firewall.fw_name)
    if db_firewall:
        raise HTTPException(status_code=400, detail="Firewall name already registered")
    
    db_firewall = crud.get_firewall_by_ip(db, fw_ip=firewall.fw_ip)
    if db_firewall:
        raise HTTPException(status_code=400, detail="Firewall IP already registered")
    
    return crud.create_firewall(db=db, firewall=firewall)

@router.put("/{firewall_id}", response_model=FirewallResponse)
def update_firewall(
    firewall_id: int, 
    firewall: FirewallUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a firewall by ID.
    """
    db_firewall = crud.update_firewall(db, firewall_id=firewall_id, firewall=firewall)
    if db_firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return db_firewall

@router.delete("/{firewall_id}", status_code=204)
def delete_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """
    Delete a firewall by ID.
    """
    success = crud.delete_firewall(db, firewall_id=firewall_id)
    if not success:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return None