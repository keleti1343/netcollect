# Fix `NameError: name 'ConfigDict' is not defined`

## Problem Description

The API server is failing to start with a `NameError: name 'ConfigDict' is not defined` error. This occurs in `fortinet-api/app/schemas/vip.py` after updating the Pydantic configuration.

## Root Cause

The `ConfigDict` class was used to configure the `VIPResponse` model, but it was not imported from the `pydantic` library.

## Step-by-Step Solution

To fix this, we need to import `ConfigDict` from `pydantic` in `fortinet-api/app/schemas/vip.py`.

### Step 1: Modify `fortinet-api/app/schemas/vip.py`

1.  Open the file `fortinet-api/app/schemas/vip.py`.
2.  Locate the import statement from `pydantic` at the top of the file.
3.  Add `ConfigDict` to the list of imported classes.

```python
# fortinet-api/app/schemas/vip.py

from pydantic import BaseModel, ConfigDict # Add ConfigDict here
from typing import Optional, List
from datetime import datetime
from .vdom import VDOMResponse

# ... rest of the file remains the same
```

### Step 2: Restart the API Server

After making this change, restart the FastAPI server for the changes to take effect.

1.  Navigate to the `fortinet-api` directory in your terminal.
2.  Stop the currently running server (if any).
3.  Start the server again:
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8800 --reload
    ```

## Verification

After restarting the API server, it should start without any errors. The IP search functionality in the frontend application should now work as expected.