# Fix Pydantic `from_attributes=True` Error

## Problem Description

The API server is throwing a `pydantic.errors.PydanticUserError: You must set the config attribute from_attributes=True to use from_orm` error. This occurs when Pydantic models are used to serialize ORM objects (e.g., SQLAlchemy models) without the necessary configuration.

The traceback indicates the error originates in `fortinet-api/app/routers/search.py` at line 52, specifically during the serialization of `VIPResponse` objects using `from_orm`. This implies that the Pydantic models used for responses (e.g., `InterfaceResponse`, `RouteResponse`, `VIPResponse`) need to be updated.

## Root Cause

Pydantic v2 (and later versions) requires explicit configuration to allow models to be created from ORM attributes. This is done by setting `from_attributes=True` within the `Config` class of the Pydantic model.

## Step-by-Step Solution

To fix this, we need to locate all relevant Pydantic response models and add `Config.from_attributes = True` to them. These models are typically defined in the `fortinet-api/app/schemas` directory.

### Step 1: Modify `InterfaceResponse` Schema

1.  Open the file `fortinet-api/app/schemas/interface.py`.
2.  Locate the `InterfaceResponse` class.
3.  Add or update the `Config` inner class to include `from_attributes = True`.

```python
# fortinet-api/app/schemas/interface.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .vdom import VDOMResponse  # Assuming VDOMResponse is also a Pydantic model

class InterfaceResponse(BaseModel):
    interface_id: str
    interface_name: str
    ip_address: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    vdom_id: Optional[str] = None
    vdom: Optional[VDOMResponse] = None
    last_updated: datetime

    class Config:
        from_attributes = True # Add this line
```

### Step 2: Modify `RouteResponse` Schema

1.  Open the file `fortinet-api/app/schemas/route.py`.
2.  Locate the `RouteResponse` class.
3.  Add or update the `Config` inner class to include `from_attributes = True`.

```python
# fortinet-api/app/schemas/route.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .vdom import VDOMResponse

class RouteResponse(BaseModel):
    route_id: str
    destination_network: str
    mask_length: int
    exit_interface_name: Optional[str] = None
    route_type: Optional[str] = None
    gateway: Optional[str] = None
    vdom_id: Optional[str] = None
    vdom: Optional[VDOMResponse] = None
    last_updated: datetime

    class Config:
        from_attributes = True # Add this line
```

### Step 3: Modify `VIPResponse` Schema

1.  Open the file `fortinet-api/app/schemas/vip.py`.
2.  Locate the `VIPResponse` class.
3.  Add or update the `Config` inner class to include `from_attributes = True`.

```python
# fortinet-api/app/schemas/vip.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .vdom import VDOMResponse

class VIPResponse(BaseModel):
    vip_id: str
    external_ip: str
    mapped_ip: str
    vip_type: Optional[str] = None
    vdom_id: Optional[str] = None
    vdom: Optional[VDOMResponse] = None
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True) # Update this line
```

### Step 4: Restart the API Server

After making these changes, it is crucial to restart the FastAPI server for the changes to take effect.

1.  Navigate to the `fortinet-api` directory in your terminal.
2.  Stop the currently running server (if any).
3.  Start the server again:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8800 --reload
    ```

## Verification

After restarting the API server, try performing an IP search in the frontend application again. The `TypeError: Failed to fetch` should now be resolved, and the search results should display correctly.