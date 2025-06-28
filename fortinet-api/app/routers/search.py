from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database import get_db
from app.schemas.interface import InterfaceResponse
from app.schemas.route import RouteResponse
from app.schemas.vip import VIPResponse
import app.crud.interface as interface_crud
import app.crud.route as route_crud
import app.crud.vip as vip_crud

router = APIRouter(
    prefix="/api/search",
    tags=["search"],
    responses={404: {"description": "Not found"}}
)

from pydantic import BaseModel # Import BaseModel for pagination response

class SearchResultItems(BaseModel):
    items: List[InterfaceResponse | RouteResponse | VIPResponse]
    total_count: int

@router.get("/ip", response_model=Dict[str, SearchResultItems])
def search_ip(
    query: str = Query(..., min_length=1, description="IP address or subnet to search for"),
    interfaces_skip: int = Query(0, alias="interfaces.skip"),
    interfaces_limit: int = Query(15, alias="interfaces.limit"),
    routes_skip: int = Query(0, alias="routes.skip"),
    routes_limit: int = Query(15, alias="routes.limit"),
    vips_skip: int = Query(0, alias="vips.skip"),
    vips_limit: int = Query(15, alias="vips.limit"),
    db: Session = Depends(get_db)
):
    """
    Search for IP addresses across interfaces, routes, and VIPs with pagination.
    """
    interfaces, interfaces_total_count = interface_crud.search_interfaces_by_ip(
        db, ip_address_query=query, skip=interfaces_skip, limit=interfaces_limit
    )
    routes, routes_total_count = route_crud.search_routes_by_ip(
        db, ip_address_query=query, skip=routes_skip, limit=routes_limit
    )
    vips, vips_total_count = vip_crud.search_vips_by_ip(
        db, ip_address_query=query, skip=vips_skip, limit=vips_limit
    )

    # Convert interfaces to response models - ensures proper serialization
    interface_responses = [InterfaceResponse.from_orm(iface) for iface in interfaces]
    route_responses = [RouteResponse.from_orm(route) for route in routes]
    vip_responses = [VIPResponse.from_orm(vip) for vip in vips]

    return {
        "interfaces": {"items": interface_responses, "total_count": interfaces_total_count},
        "routes": {"items": route_responses, "total_count": routes_total_count},
        "vips": {"items": vip_responses, "total_count": vips_total_count}
    }