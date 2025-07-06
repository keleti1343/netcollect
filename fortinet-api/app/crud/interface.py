from sqlalchemy.orm import Session, joinedload # Import joinedload
from typing import List, Optional, Tuple # Import Tuple
from app.models.interface import Interface
from app.models.vdom import VDOM # Import VDOM model
from app.schemas.interface import InterfaceCreate, InterfaceUpdate

def get_interface(db: Session, interface_id: int) -> Optional[Interface]:
    return db.query(Interface).filter(Interface.interface_id == interface_id).first()

def get_interfaces(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    firewall_id: Optional[int] = None,
    vdom_id: Optional[int] = None,
    interface_type: Optional[str] = None,
    interface_name: Optional[str] = None, # Add interface_name
    ip_address: Optional[str] = None, # Add ip_address
    include_vdom: bool = False, # Add include_vdom
    sort_by: Optional[str] = None, # Updated parameter name
    sort_order: Optional[str] = "asc" # Updated parameter name
) -> Tuple[List[Interface], int]: # Return list and total count
    query = db.query(Interface)

    # Join with VDOM if needed for sorting by vdom_name or if include_vdom is True
    if include_vdom or sort_by == "vdom_name":
        query = query.outerjoin(VDOM, Interface.vdom_id == VDOM.vdom_id)
        if include_vdom:
            query = query.options(joinedload(Interface.vdom))
    
    if firewall_id:
        query = query.filter(Interface.firewall_id == firewall_id)
    if vdom_id:
        query = query.filter(Interface.vdom_id == vdom_id)
    if interface_type:
        query = query.filter(Interface.type == interface_type)
    if interface_name: # Filter by interface_name
        query = query.filter(Interface.interface_name.ilike(f"%{interface_name}%"))
    if ip_address: # Filter by ip_address
        query = query.filter(Interface.ip_address.ilike(f"%{ip_address}%"))
    
    # Add sorting
    if sort_by:
        if sort_by == "interface_name":
            sort_column = Interface.interface_name
        elif sort_by == "vdom_name":
            sort_column = VDOM.vdom_name
        else:
            # Fallback to interface_name if sort_by is not recognized
            sort_column = Interface.interface_name
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        # Default sorting by interface name
        query = query.order_by(Interface.interface_name.asc())
        
    total_count = query.count() # Get total count before applying limit/offset
    interfaces = query.offset(skip).limit(limit).all()
    return interfaces, total_count

def get_interface_by_name(
    db: Session, 
    firewall_id: int, 
    vdom_id: Optional[int],
    interface_name: str
) -> Optional[Interface]:
    query = db.query(Interface).filter(
        Interface.firewall_id == firewall_id,
        Interface.interface_name == interface_name
    )
    
    if vdom_id:
        query = query.filter(Interface.vdom_id == vdom_id)
    else:
        query = query.filter(Interface.vdom_id.is_(None))
        
    return query.first()

def create_interface(db: Session, interface: InterfaceCreate) -> Interface:
    db_interface = Interface(
        firewall_id=interface.firewall_id,
        vdom_id=interface.vdom_id,
        interface_name=interface.interface_name,
        ip_address=interface.ip_address,
        mask=interface.mask,
        type=interface.type,
        vlan_id=interface.vlan_id,
        description=interface.description,
        status=interface.status,
        physical_interface_name=interface.physical_interface_name
    )
    db.add(db_interface)
    db.commit()
    db.refresh(db_interface)
    return db_interface

def update_interface(
    db: Session, 
    interface_id: int, 
    interface: InterfaceUpdate
) -> Optional[Interface]:
    db_interface = get_interface(db, interface_id)
    if db_interface is None:
        return None
    
    update_data = interface.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interface, key, value)
    
    db.commit()
    db.refresh(db_interface)
    return db_interface

def delete_interface(db: Session, interface_id: int) -> bool:
    db_interface = get_interface(db, interface_id)
    if db_interface is None:
        return False
    
    db.delete(db_interface)
    db.commit()
    return True

import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.interface import Interface
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_interfaces_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[Interface], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(Interface).options(joinedload(Interface.vdom))
    
    if network and is_cidr:
        # For CIDR notation, we need to fetch all potential matches first
        # because we can't do the network containment check directly in SQL
        potential_matches = base_query.all()
        
        # Filter interfaces where the IP is in the specified network
        matches = [
            iface for iface in potential_matches
            if iface.ip_address and ip_is_in_network(iface.ip_address, network)
        ]
        
        # Handle pagination manually since we're filtering in Python
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit] if skip < len(matches) else []
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(Interface.ip_address.ilike(f"%{ip_address_query}%"))
        total_count = query.count()
        interfaces = query.offset(skip).limit(limit).all()
        return interfaces, total_count