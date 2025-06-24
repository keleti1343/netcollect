from sqlalchemy.orm import Session, joinedload # Import joinedload
from typing import List, Optional, Tuple # Import Tuple
from app.models.vip import VIP
from app.schemas.vip import VIPCreate, VIPUpdate

def get_vip(db: Session, vip_id: int) -> Optional[VIP]:
    return db.query(VIP).filter(VIP.vip_id == vip_id).first()

def get_vips(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vdom_id: Optional[int] = None,
    vip_type: Optional[str] = None
) -> Tuple[List[VIP], int]: # Return list and total count
    query = db.query(VIP)
    
    if vdom_id:
        query = query.filter(VIP.vdom_id == vdom_id)
    if vip_type:
        query = query.filter(VIP.vip_type == vip_type)
        
    total_count = query.count() # Get total count before applying limit/offset
    vips = query.offset(skip).limit(limit).all()
    return vips, total_count

def create_vip(db: Session, vip: VIPCreate) -> VIP:
    db_vip = VIP(
        vdom_id=vip.vdom_id,
        external_ip=vip.external_ip,
        external_port=vip.external_port,
        mapped_ip=vip.mapped_ip,
        mapped_port=vip.mapped_port,
        vip_type=vip.vip_type,
        external_interface=vip.external_interface,
        mask=vip.mask
    )
    db.add(db_vip)
    db.commit()
    db.refresh(db_vip)
    return db_vip

def update_vip(
    db: Session, 
    vip_id: int, 
    vip: VIPUpdate
) -> Optional[VIP]:
    db_vip = get_vip(db, vip_id)
    if db_vip is None:
        return None
    
    update_data = vip.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vip, key, value)
    
    db.commit()
    db.refresh(db_vip)
    return db_vip

def delete_vip(db: Session, vip_id: int) -> bool:
    db_vip = get_vip(db, vip_id)
    if db_vip is None:
        return False
    
    db.delete(db_vip)
    db.commit()
    return True

def search_vips_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15 # Default limit to 15 as per requirement
) -> Tuple[List[VIP], int]:
    # Search for VIPs where external_ip or mapped_ip contains the query string
    query = db.query(VIP).options(joinedload(VIP.vdom)) # Eager load VDOM
    query = query.filter(
        (VIP.external_ip.ilike(f"%{ip_address_query}%")) |
        (VIP.mapped_ip.ilike(f"%{ip_address_query}%"))
    )
    
    total_count = query.count()
    vips = query.offset(skip).limit(limit).all()
    return vips, total_count