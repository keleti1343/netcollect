from pydantic import BaseModel, ConfigDict
from typing import Optional, List # Import List
from datetime import datetime
from .vdom import VDOMResponse # Import VDOMResponse

class VIPBase(BaseModel):
    vdom_id: int
    external_ip: str
    external_port: Optional[int] = None
    mapped_ip: str
    mapped_port: Optional[int] = None
    vip_type: Optional[str] = None
    external_interface: Optional[str] = None
    mask: Optional[int] = None

class VIPCreate(VIPBase):
    pass

class VIPUpdate(BaseModel):
    external_ip: Optional[str] = None
    external_port: Optional[int] = None
    mapped_ip: Optional[str] = None
    mapped_port: Optional[int] = None
    vip_type: Optional[str] = None
    external_interface: Optional[str] = None
    mask: Optional[int] = None

class VIPResponse(VIPBase):
    vip_id: int
    last_updated: datetime
    vdom: Optional[VDOMResponse] = None # Add vdom field

    model_config = ConfigDict(from_attributes=True)

class VIPPaginationResponse(BaseModel):
    items: List[VIPResponse]
    total_count: int