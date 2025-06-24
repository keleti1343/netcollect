from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.schemas.vdom import VDOMResponse # Import VDOMResponse

class RouteBase(BaseModel):
    vdom_id: int
    destination_network: str
    mask_length: int
    route_type: str
    gateway: Optional[str] = None
    exit_interface_name: str
    exit_interface_details: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    destination_network: Optional[str] = None
    mask_length: Optional[int] = None
    route_type: Optional[str] = None
    gateway: Optional[str] = None
    exit_interface_name: Optional[str] = None
    exit_interface_details: Optional[str] = None

class RouteResponse(RouteBase):
    route_id: int
    last_updated: datetime
    vdom: Optional[VDOMResponse] = None # Add vdom field

    model_config = ConfigDict(from_attributes=True)