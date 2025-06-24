from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.models.vdom import VDOM
from app.schemas.vdom import VDOMCreate, VDOMUpdate

def get_vdom(db: Session, vdom_id: int) -> Optional[VDOM]:
    return db.query(VDOM).filter(VDOM.vdom_id == vdom_id).first()

def get_vdoms(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    firewall_id: Optional[int] = None,
    vdom_name: Optional[str] = None  # Added vdom_name
) -> (List[VDOM], int): # Changed return type
    query = db.query(VDOM).options(joinedload(VDOM.firewall))
    if firewall_id:
        query = query.filter(VDOM.firewall_id == firewall_id)
    if vdom_name:
        query = query.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%"))
    
    total_count = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total_count

def get_vdom_by_name_and_firewall(
    db: Session, 
    vdom_name: str, 
    firewall_id: int
) -> Optional[VDOM]:
    return db.query(VDOM).filter(
        VDOM.vdom_name == vdom_name,
        VDOM.firewall_id == firewall_id
    ).first()

def create_vdom(db: Session, vdom: VDOMCreate) -> VDOM:
    db_vdom = VDOM(
        firewall_id=vdom.firewall_id,
        vdom_name=vdom.vdom_name,
        vdom_index=vdom.vdom_index
    )
    db.add(db_vdom)
    db.commit()
    db.refresh(db_vdom)
    return db_vdom

def update_vdom(
    db: Session, 
    vdom_id: int, 
    vdom: VDOMUpdate
) -> Optional[VDOM]:
    db_vdom = get_vdom(db, vdom_id)
    if db_vdom is None:
        return None
    
    update_data = vdom.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vdom, key, value)
    
    db.commit()
    db.refresh(db_vdom)
    return db_vdom

def delete_vdom(db: Session, vdom_id: int) -> bool:
    db_vdom = get_vdom(db, vdom_id)
    if db_vdom is None:
        return False
    
    db.delete(db_vdom)
    db.commit()
    return True