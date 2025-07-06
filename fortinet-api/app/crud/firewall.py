from sqlalchemy.orm import Session
from sqlalchemy import func # Import func
from typing import List, Optional, Tuple # Import Tuple
from app.models.firewall import Firewall
from app.models.vdom import VDOM # Import VDOM model
from app.schemas.firewall import FirewallCreate, FirewallUpdate

def get_firewall(db: Session, firewall_id: int) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.firewall_id == firewall_id).first()

def get_firewall_by_name(db: Session, fw_name: str) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.fw_name == fw_name).first()

def get_firewall_by_ip(db: Session, fw_ip: str) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.fw_ip == fw_ip).first()

def get_firewalls(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    fw_name: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> (List[Firewall], int):
    # Start with the base query for Firewalls
    query = db.query(Firewall)

    # Apply filters for total count
    if fw_name:
        query = query.filter(Firewall.fw_name.ilike(f"%{fw_name}%"))
    
    total_count = query.count()

    # Subquery to count VDOMs for each Firewall
    vdom_count_subquery = (
        db.query(func.count(VDOM.vdom_id))
        .filter(VDOM.firewall_id == Firewall.firewall_id)
        .scalar_subquery()
    )

    # Modify the main query to select Firewall and the VDOM count
    query_with_count = db.query(
        Firewall,
        vdom_count_subquery.label("total_vdoms")
    )

    # Apply filters to this new query
    if fw_name:
        query_with_count = query_with_count.filter(Firewall.fw_name.ilike(f"%{fw_name}%"))

    # Apply sorting
    if sort_by:
        if sort_by == "fw_name":
            sort_column = Firewall.fw_name
        elif sort_by == "total_vdoms":
            sort_column = vdom_count_subquery
        else:
            sort_column = Firewall.fw_name  # Default fallback
        
        if sort_order.lower() == "desc":
            query_with_count = query_with_count.order_by(sort_column.desc())
        else:
            query_with_count = query_with_count.order_by(sort_column.asc())
    else:
        # Default sorting by firewall name
        query_with_count = query_with_count.order_by(Firewall.fw_name.asc())

    # Get paginated items
    items_with_count = query_with_count.offset(skip).limit(limit).all()

    # Reconstruct Firewall objects with total_vdoms attribute for Pydantic
    processed_items = []
    for firewall_obj, total_vdoms_count in items_with_count:
        firewall_obj.total_vdoms = total_vdoms_count if total_vdoms_count is not None else 0
        processed_items.append(firewall_obj)

    return processed_items, total_count

def create_firewall(db: Session, firewall: FirewallCreate) -> Firewall:
    db_firewall = Firewall(
        fw_name=firewall.fw_name,
        fw_ip=firewall.fw_ip,
        fmg_ip=firewall.fmg_ip,
        faz_ip=firewall.faz_ip,
        site=firewall.site
    )
    db.add(db_firewall)
    db.commit()
    db.refresh(db_firewall)
    return db_firewall

def update_firewall(
    db: Session, 
    firewall_id: int, 
    firewall: FirewallUpdate
) -> Optional[Firewall]:
    db_firewall = get_firewall(db, firewall_id)
    if db_firewall is None:
        return None
    
    update_data = firewall.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_firewall, key, value)
    
    db.commit()
    db.refresh(db_firewall)
    return db_firewall

def delete_firewall(db: Session, firewall_id: int) -> bool:
    db_firewall = get_firewall(db, firewall_id)
    if db_firewall is None:
        return False
    
    db.delete(db_firewall)
    db.commit()
    return True