from sqlalchemy.orm import Session, joinedload # Import joinedload
from typing import List, Optional, Tuple # Import Tuple
from app.models.vip import VIP
from app.schemas.vip import VIPCreate, VIPUpdate
from app.models.vdom import VDOM # Added for eager loading

def get_vip(db: Session, vip_id: int) -> Optional[VIP]:
    return db.query(VIP).options(joinedload(VIP.vdom).joinedload(VDOM.firewall)).filter(VIP.vip_id == vip_id).first()

def get_vips(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vdom_id: Optional[int] = None,
    vip_type: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> Tuple[List[VIP], int]: # Return list and total count
    query = db.query(VIP)
    
    # Join with VDOM if needed for sorting by vdom_name
    if sort_by == "vdom_name":
        query = query.join(VDOM, VIP.vdom_id == VDOM.vdom_id)
        # Add eager loading of both VDOM and Firewall
        query = query.options(joinedload(VIP.vdom).joinedload(VDOM.firewall))
    else:
        # Add eager loading of both VDOM and Firewall
        query = query.options(joinedload(VIP.vdom).joinedload(VDOM.firewall))
    
    if vdom_id:
        query = query.filter(VIP.vdom_id == vdom_id)
    if vip_type:
        query = query.filter(VIP.vip_type == vip_type)
    
    # Add sorting
    if sort_by:
        if sort_by == "vdom_name":
            sort_column = VDOM.vdom_name
        else:
            # Fallback to external_ip if sort_by is not recognized
            sort_column = VIP.external_ip
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        # Default sorting by external IP
        query = query.order_by(VIP.external_ip.asc())
        
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

import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.vip import VIP
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_vips_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[VIP], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(VIP).options(joinedload(VIP.vdom).joinedload(VDOM.firewall))
    
    if network and is_cidr:
        # For CIDR notation, fetch all potential matches first
        potential_matches = base_query.all()
        
        # Filter VIPs where either external_ip or mapped_ip is in the network
        matches = [
            vip for vip in potential_matches
            if (vip.external_ip and ip_is_in_network(vip.external_ip, network)) or
               (vip.mapped_ip and ip_is_in_network(vip.mapped_ip, network))
        ]
        
        # Handle pagination manually
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit] if skip < len(matches) else []
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(
            (VIP.external_ip.ilike(f"%{ip_address_query}%")) |
            (VIP.mapped_ip.ilike(f"%{ip_address_query}%"))
        )
        total_count = query.count()
        vips = query.offset(skip).limit(limit).all()
        return vips, total_count