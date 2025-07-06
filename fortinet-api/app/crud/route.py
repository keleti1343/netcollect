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
    include_vdom: bool = False,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
) -> List[Route]:
    query = db.query(Route)

    if include_vdom or vdom_name or sort_by == "vdom_name": # Ensure join if filtering by vdom_name, including vdom details, or sorting by vdom_name
        query = query.join(VDOM, Route.vdom_id == VDOM.vdom_id) # Explicit join for filtering
        if include_vdom: # If also including vdom, ensure it's loaded efficiently
             query = query.options(joinedload(Route.vdom))


    if vdom_id:
        query = query.filter(Route.vdom_id == vdom_id)
    if route_type:
        query = query.filter(Route.route_type == route_type)
    if vdom_name:
        query = query.filter(VDOM.vdom_name.ilike(f"%{vdom_name}%")) # Filter by vdom_name

    # Apply sorting
    if sort_by:
        if sort_by == "route_type":
            sort_column = Route.route_type
        elif sort_by == "exit_interface_name":
            sort_column = Route.exit_interface_name
        elif sort_by == "vdom_name":
            sort_column = VDOM.vdom_name
        else:
            sort_column = Route.route_type  # Default fallback
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    else:
        # Default sorting by route type
        query = query.order_by(Route.route_type.asc())
        
    return query.offset(skip).limit(limit).all()

def get_routes_count(
    db: Session,
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None,
    vdom_name: Optional[str] = None, # Add vdom_name parameter
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = "asc"
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

import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.route import Route
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_routes_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[Route], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(Route).options(joinedload(Route.vdom))
    
    if network and is_cidr:
        # For CIDR notation, fetch all potential matches first
        potential_matches = base_query.all()
        
        # Filter routes where the network contains or is contained by the query network
        matches = []
        for route in potential_matches:
            if route.destination_network and route.mask_length:
                try:
                    # Create network from route destination and mask
                    route_network = ipaddress.ip_network(
                        f"{route.destination_network}/{route.mask_length}",
                        strict=False
                    )
                    
                    # Check for network overlap (either direction)
                    if route_network.overlaps(network) or network.overlaps(route_network):
                        matches.append(route)
                except (ValueError, AttributeError):
                    pass
        
        # Handle pagination manually
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit] if skip < len(matches) else []
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(Route.destination_network.ilike(f"%{ip_address_query}%"))
        total_count = query.count()
        routes = query.offset(skip).limit(limit).all()
        return routes, total_count