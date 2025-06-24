from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

# Base schema with common attributes
class FirewallBase(BaseModel):
    fw_name: str
    fw_ip: str
    fmg_ip: Optional[str] = None
    faz_ip: Optional[str] = None
    site: Optional[str] = None

# Schema for creating a new firewall
class FirewallCreate(FirewallBase):
    pass

# Schema for updating a firewall (all fields optional)
class FirewallUpdate(BaseModel):
    fw_name: Optional[str] = None
    fw_ip: Optional[str] = None
    fmg_ip: Optional[str] = None
    faz_ip: Optional[str] = None
    site: Optional[str] = None

# Schema for firewall responses (includes ID and timestamp)
class FirewallResponse(FirewallBase):
    firewall_id: int
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)

# Schema for paginated firewall response
class FirewallPaginationResponse(BaseModel):
    items: List[FirewallResponse]
    total_count: int