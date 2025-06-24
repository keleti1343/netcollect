from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from .vdom import VDOMResponse # Import VDOMResponse

class InterfaceBase(BaseModel):
    firewall_id: int
    vdom_id: Optional[int] = None
    interface_name: str
    ip_address: Optional[str] = None
    mask: Optional[str] = None
    type: str
    vlan_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    physical_interface_name: Optional[str] = None

class InterfaceCreate(InterfaceBase):
    pass

class InterfaceUpdate(BaseModel):
    vdom_id: Optional[int] = None
    interface_name: Optional[str] = None
    ip_address: Optional[str] = None
    mask: Optional[str] = None
    type: Optional[str] = None
    vlan_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    physical_interface_name: Optional[str] = None

class InterfaceResponse(InterfaceBase):
    interface_id: int
    last_updated: datetime
    vdom: Optional[VDOMResponse] = None # Add vdom field

    model_config = ConfigDict(from_attributes=True)

class InterfacePaginationResponse(BaseModel):
    items: List[InterfaceResponse]
    total_count: int