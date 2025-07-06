from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.vip import VIPCreate, VIPUpdate, VIPResponse
import app.crud.vip as crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/vips",
    tags=["vips"],
    responses={404: {"description": "VIP not found"}}
)

from app.schemas.vip import VIPCreate, VIPUpdate, VIPResponse, VIPPaginationResponse # Import VIPPaginationResponse

@router.get("/", response_model=VIPPaginationResponse)
def read_vips(
    skip: int = 0,
    limit: int = 10000,
    vdom_id: Optional[int] = None,
    vip_type: Optional[str] = None,
    sort_by: Optional[str] = Query(None, description="Sort by field (e.g., vdom_name)"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve VIPs with optional filtering, sorting, and pagination.
    """
    vips, total_count = crud.get_vips(
        db, skip=skip, limit=limit,
        vdom_id=vdom_id, vip_type=vip_type,
        sort_by=sort_by, sort_order=sort_order
    )
    return {"items": vips, "total_count": total_count}

@router.get("/{vip_id}", response_model=VIPResponse)
def read_vip(vip_id: int, db: Session = Depends(get_db)):
    """
    Get a specific VIP by ID.
    """
    db_vip = crud.get_vip(db, vip_id=vip_id)
    if db_vip is None:
        raise HTTPException(status_code=404, detail="VIP not found")
    return db_vip

@router.get("/vdom/{vdom_id}", response_model=List[VIPResponse])
def read_vips_by_vdom(
    vdom_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all VIPs for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    vips = crud.get_vips(db, vdom_id=vdom_id)
    return vips

@router.post("/", response_model=VIPResponse, status_code=201)
def create_vip(vip: VIPCreate, db: Session = Depends(get_db)):
    """
    Create a new VIP.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vip.vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    return crud.create_vip(db=db, vip=vip)

@router.put("/{vip_id}", response_model=VIPResponse)
def update_vip(
    vip_id: int, 
    vip: VIPUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a VIP by ID.
    """
    db_vip = crud.update_vip(db, vip_id=vip_id, vip=vip)
    if db_vip is None:
        raise HTTPException(status_code=404, detail="VIP not found")
    return db_vip

@router.delete("/{vip_id}", status_code=204)
def delete_vip(vip_id: int, db: Session = Depends(get_db)):
    """
    Delete a VIP by ID.
    """
    success = crud.delete_vip(db, vip_id=vip_id)
    if not success:
        raise HTTPException(status_code=404, detail="VIP not found")
    return None