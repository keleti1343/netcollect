from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func # Import func
from typing import List, Optional, Tuple # Import Tuple
from app.models.vdom import VDOM
from app.models.route import Route # Import Route model
from app.models.interface import Interface # Import the Interface model
from app.models.vip import VIP # Import the VIP model
from app.schemas.vdom import VDOMCreate, VDOMUpdate

def get_vdom(db: Session, vdom_id: int) -> Optional[VDOM]:
    return db.query(VDOM).filter(VDOM.vdom_id == vdom_id).first()

def get_vdoms(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    firewall_id: Optional[int] = None,
    vdom_name: Optional[str] = None,  # Added vdom_name
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> (List[VDOM], int): # Changed return type
    # Start with the base query for VDOMs and eager load firewall
    query = db.query(VDOM).options(joinedload(VDOM.firewall))

    # Apply filters for total count
    if firewall_id:
        query = query.filter(VDOM.firewall_id == firewall_id)
    if vdom_name:
        query = query.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%"))

    # Get total count before applying limit/offset
    total_count = query.count()

    # Subquery to count routes for each VDOM
    route_count_subquery = (
        db.query(func.count(Route.route_id))
        .filter(Route.vdom_id == VDOM.vdom_id)
        .scalar_subquery()
    )

    # Subquery to count interfaces for each VDOM
    interface_count_subquery = (
        db.query(func.count(Interface.interface_id))
        .filter(Interface.vdom_id == VDOM.vdom_id)
        .scalar_subquery()
    )

    # Subquery to count VIPs for each VDOM
    vip_count_subquery = (
        db.query(func.count(VIP.vip_id))
        .filter(VIP.vdom_id == VDOM.vdom_id)
        .scalar_subquery()
    )

    # Modify the main query to select VDOM and the counts
    query_with_count = db.query(
        VDOM,
        route_count_subquery.label("total_routes"),
        interface_count_subquery.label("total_interfaces"),
        vip_count_subquery.label("total_vips") # Add VIP count
    ).options(joinedload(VDOM.firewall))

    # Apply filters to this new query
    if firewall_id:
        query_with_count = query_with_count.filter(VDOM.firewall_id == firewall_id)
    if vdom_name:
        query_with_count = query_with_count.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%"))

    # Apply sorting
    if sort_by:
        if sort_by == "vdom_name":
            sort_column = VDOM.vdom_name
        elif sort_by == "fw_name":
            # Need to join with firewall table for sorting by firewall name
            from app.models.firewall import Firewall
            query_with_count = query_with_count.join(Firewall, VDOM.firewall_id == Firewall.firewall_id)
            sort_column = Firewall.fw_name
        elif sort_by == "total_interfaces":
            sort_column = interface_count_subquery
        elif sort_by == "total_vips":
            sort_column = vip_count_subquery
        elif sort_by == "total_routes":
            sort_column = route_count_subquery
        else:
            sort_column = VDOM.vdom_name  # Default fallback
        
        if sort_order.lower() == "desc":
            query_with_count = query_with_count.order_by(sort_column.desc())
        else:
            query_with_count = query_with_count.order_by(sort_column.asc())
    else:
        # Default sorting by vdom name
        query_with_count = query_with_count.order_by(VDOM.vdom_name.asc())

    # Get paginated items
    items_with_count = query_with_count.offset(skip).limit(limit).all()

    # Reconstruct VDOM objects with total_routes attribute for Pydantic
    processed_items = []
    for vdom_obj, total_routes_count, total_interfaces_count, total_vips_count in items_with_count: # Unpack all counts
        vdom_obj.total_routes = total_routes_count if total_routes_count is not None else 0
        vdom_obj.total_interfaces = total_interfaces_count if total_interfaces_count is not None else 0
        vdom_obj.total_vips = total_vips_count if total_vips_count is not None else 0 # Set VIP count
        processed_items.append(vdom_obj)

    return processed_items, total_count

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