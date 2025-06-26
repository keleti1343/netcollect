from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.firewall import FirewallResponse

class VDOMBase(BaseModel):
    firewall_id: int
    vdom_name: str
    vdom_index: Optional[int] = None

class VDOMCreate(VDOMBase):
    pass

class VDOMUpdate(BaseModel):
    vdom_name: Optional[str] = None
    vdom_index: Optional[int] = None

class VDOMResponse(VDOMBase):
    vdom_id: int
    last_updated: datetime
    firewall: Optional[FirewallResponse] = None
    total_routes: Optional[int] = None
    total_interfaces: Optional[int] = None
    total_vips: Optional[int] = None

    # Updated for Pydantic V2 compatibility
    model_config = ConfigDict(from_attributes=True)

class VDOMPaginationResponse(BaseModel):
    items: List[VDOMResponse]
    total_count: int