from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.route import RouteCreate, RouteUpdate, RouteResponse
import app.crud.route as crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/routes",
    tags=["routes"],
    responses={404: {"description": "Route not found"}}
)

@router.get("/", response_model=dict)
def read_routes(
    skip: int = 0,
    limit: int = 10000,
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None,
    vdom_name: Optional[str] = Query(None, description="Filter routes by VDOM name"),
    include_vdom: bool = Query(False, description="Include VDOM details in the response"),
    sort_by: Optional[str] = Query(None, description="Sort by field: route_type, exit_interface_name, vdom_name"),
    sort_order: Optional[str] = Query("asc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    """
    Retrieve routes with optional filtering and sorting in paginated format.
    """
    db_routes = crud.get_routes(
        db, skip=skip, limit=limit,
        vdom_id=vdom_id, route_type=route_type, vdom_name=vdom_name,
        include_vdom=include_vdom, sort_by=sort_by, sort_order=sort_order
    )
    total_count = crud.get_routes_count(
        db, vdom_id=vdom_id, route_type=route_type, vdom_name=vdom_name
    )
    routes = [RouteResponse.model_validate(route) for route in db_routes]
    return {"items": routes, "total_count": total_count}

@router.get("/{route_id}", response_model=RouteResponse)
def read_route(route_id: int, db: Session = Depends(get_db)):
    """
    Get a specific route by ID.
    """
    db_route = crud.get_route(db, route_id=route_id)
    if db_route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return RouteResponse.model_validate(db_route)

@router.get("/vdom/{vdom_id}", response_model=dict)
def read_routes_by_vdom(
    vdom_id: int,
    skip: int = 0,
    limit: int = 10000,
    db: Session = Depends(get_db)
):
    """
    Retrieve routes for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    db_routes = crud.get_routes_by_vdom(
        db, vdom_id=vdom_id, skip=skip, limit=limit
    )
    total_count = crud.get_routes_count(db, vdom_id=vdom_id)
    routes = [RouteResponse.model_validate(route) for route in db_routes]
    return {"items": routes, "total_count": total_count}

@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """
    Create a new route.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=route.vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    return crud.create_route(db=db, route=route)

@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int, 
    route: RouteUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a route by ID.
    """
    db_route = crud.update_route(db, route_id=route_id, route=route)
    if db_route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return db_route

@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """
    Delete a route by ID.
    """
    success = crud.delete_route(db, route_id=route_id)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return None
