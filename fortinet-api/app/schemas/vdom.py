from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

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

    # Updated for Pydantic V2 compatibility
    model_config = ConfigDict(from_attributes=True)

class VDOMPaginationResponse(BaseModel):
    items: List[VDOMResponse]
    total_count: int