from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.firewall import Firewall
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
    fw_name: Optional[str] = None
) -> (List[Firewall], int):
    query = db.query(Firewall)
    if fw_name:
        query = query.filter(Firewall.fw_name.ilike(f"%{fw_name}%"))
    
    total_count = query.count()
    items = query.offset(skip).limit(limit).all()
    return items, total_count

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