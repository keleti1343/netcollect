from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Tuple # Import Tuple
from app.models.route import Route
from app.models.vdom import VDOM # Import VDOM model
from app.schemas.route import RouteCreate, RouteUpdate

def get_route(db: Session, route_id: int) -> Optional[Route]:
    return db.query(Route).filter(Route.route_id == route_id).first()

def get_routes(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None,
    vdom_name: Optional[str] = None, # Add vdom_name parameter
    include_vdom: bool = False
) -> List[Route]:
    query = db.query(Route)

    if include_vdom or vdom_name: # Ensure join if filtering by vdom_name or including vdom details
        query = query.join(VDOM, Route.vdom_id == VDOM.vdom_id) # Explicit join for filtering
        if include_vdom: # If also including vdom, ensure it's loaded efficiently
             query = query.options(joinedload(Route.vdom))


    if vdom_id:
        query = query.filter(Route.vdom_id == vdom_id)
    if route_type:
        query = query.filter(Route.route_type == route_type)
    if vdom_name:
        query = query.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%")) # Filter by vdom_name
        
    return query.offset(skip).limit(limit).all()

def get_routes_count(
    db: Session,
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None,
    vdom_name: Optional[str] = None # Add vdom_name parameter
) -> int:
    query = db.query(Route)

    if vdom_name: # Join if filtering by vdom_name
        query = query.join(VDOM, Route.vdom_id == VDOM.vdom_id)
    
    if vdom_id:
        query = query.filter(Route.vdom_id == vdom_id)
    if route_type:
        query = query.filter(Route.route_type == route_type)
    if vdom_name:
        query = query.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%")) # Filter by vdom_name
        
    return query.count()

def create_route(db: Session, route: RouteCreate) -> Route:
    db_route = Route(
        vdom_id=route.vdom_id,
        destination_network=route.destination_network,
        mask_length=route.mask_length,
        route_type=route.route_type,
        gateway=route.gateway,
        exit_interface_name=route.exit_interface_name,
        exit_interface_details=route.exit_interface_details
    )
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

def update_route(
    db: Session, 
    route_id: int, 
    route: RouteUpdate
) -> Optional[Route]:
    db_route = get_route(db, route_id)
    if db_route is None:
        return None
    
    update_data = route.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_route, key, value)
    
    db.commit()
    db.refresh(db_route)
    return db_route

def delete_route(db: Session, route_id: int) -> bool:
    db_route = get_route(db, route_id)
    if db_route is None:
        return False
    
    db.delete(db_route)
    db.commit()
    return True

def search_routes_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15 # Default limit to 15 as per requirement
) -> Tuple[List[Route], int]:
    query = db.query(Route).options(joinedload(Route.vdom))
    
    # Search for routes where destination_network contains the query string
    query = query.filter(Route.destination_network.ilike(f"%{ip_address_query}%"))
    
    total_count = query.count()
    routes = query.offset(skip).limit(limit).all()
    return routes, total_count