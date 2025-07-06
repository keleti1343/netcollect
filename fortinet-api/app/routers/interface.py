from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.interface import InterfaceCreate, InterfaceUpdate, InterfaceResponse, InterfacePaginationResponse
import app.crud.interface as crud
import app.crud.firewall as firewall_crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/interfaces",
    tags=["interfaces"],
    responses={404: {"description": "Interface not found"}}
)

@router.get("/", response_model=InterfacePaginationResponse)
def read_interfaces(
    skip: int = 0,
    limit: int = 10000,
    firewall_id: Optional[int] = None,
    vdom_id: Optional[int] = None,
    interface_type: Optional[str] = None,
    interface_name: Optional[str] = Query(None, description="Filter by interface name"),
    ip_address: Optional[str] = Query(None, description="Filter by IP address"),
    sort_by: Optional[str] = Query(None, description="Sort by field (e.g., interface_name, vdom_name)"),
    sort_order: Optional[str] = Query("asc", description="Sort order (asc or desc)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve interfaces with optional filtering, sorting, and pagination.
    """
    interfaces, total_count = crud.get_interfaces(
        db, skip=skip, limit=limit,
        firewall_id=firewall_id, vdom_id=vdom_id,
        interface_type=interface_type,
        interface_name=interface_name,
        ip_address=ip_address,
        include_vdom=True, # Pass include_vdom=True
        sort_by=sort_by,
        sort_order=sort_order
    )
    return {"items": interfaces, "total_count": total_count}

@router.get("/{interface_id}", response_model=InterfaceResponse)
def read_interface(interface_id: int, db: Session = Depends(get_db)):
    """
    Get a specific interface by ID.
    """
    db_interface = crud.get_interface(db, interface_id=interface_id)
    if db_interface is None:
        raise HTTPException(status_code=404, detail="Interface not found")
    return db_interface

@router.get("/firewall/{firewall_id}", response_model=List[InterfaceResponse])
def read_interfaces_by_firewall(
    firewall_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all interfaces for a specific firewall.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    interfaces = crud.get_interfaces(db, firewall_id=firewall_id)
    return interfaces

@router.get("/vdom/{vdom_id}", response_model=List[InterfaceResponse])
def read_interfaces_by_vdom(
    vdom_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all interfaces for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    interfaces = crud.get_interfaces(db, vdom_id=vdom_id)
    return interfaces

@router.post("/", response_model=InterfaceResponse, status_code=201)
def create_interface(interface: InterfaceCreate, db: Session = Depends(get_db)):
    """
    Create a new interface.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=interface.firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    # Verify VDOM exists if provided
    if interface.vdom_id:
        vdom = vdom_crud.get_vdom(db, vdom_id=interface.vdom_id)
        if vdom is None:
            raise HTTPException(status_code=404, detail="VDOM not found")
        
        # Verify VDOM belongs to the specified firewall
        if vdom.firewall_id != interface.firewall_id:
            raise HTTPException(
                status_code=400, 
                detail="VDOM does not belong to the specified firewall"
            )
    
    # Check for duplicate interface name
    existing_interface = crud.get_interface_by_name(
        db, 
        firewall_id=interface.firewall_id,
        vdom_id=interface.vdom_id,
        interface_name=interface.interface_name
    )
    if existing_interface:
        raise HTTPException(
            status_code=400, 
            detail=f"Interface with name '{interface.interface_name}' already exists in this context"
        )
    
    return crud.create_interface(db=db, interface=interface)

@router.put("/{interface_id}", response_model=InterfaceResponse)
def update_interface(
    interface_id: int, 
    interface: InterfaceUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an interface by ID.
    """
    # Verify interface exists
    db_interface = crud.get_interface(db, interface_id=interface_id)
    if db_interface is None:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    # If VDOM ID is provided, verify it exists
    if interface.vdom_id:
        vdom = vdom_crud.get_vdom(db, vdom_id=interface.vdom_id)
        if vdom is None:
            raise HTTPException(status_code=404, detail="VDOM not found")
        
        # Verify VDOM belongs to the correct firewall
        if vdom.firewall_id != db_interface.firewall_id:
            raise HTTPException(
                status_code=400, 
                detail="VDOM does not belong to the interface's firewall"
            )
    
    # If interface name is changed, check for duplicates
    if interface.interface_name and interface.interface_name != db_interface.interface_name:
        existing_interface = crud.get_interface_by_name(
            db, 
            firewall_id=db_interface.firewall_id,
            vdom_id=interface.vdom_id if interface.vdom_id is not None else db_interface.vdom_id,
            interface_name=interface.interface_name
        )
        if existing_interface:
            raise HTTPException(
                status_code=400, 
                detail=f"Interface with name '{interface.interface_name}' already exists in this context"
            )
    
    updated_interface = crud.update_interface(db, interface_id=interface_id, interface=interface)
    return updated_interface

@router.delete("/{interface_id}", status_code=204)
def delete_interface(interface_id: int, db: Session = Depends(get_db)):
    """
    Delete an interface by ID.
    """
    success = crud.delete_interface(db, interface_id=interface_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interface not found")
    return None