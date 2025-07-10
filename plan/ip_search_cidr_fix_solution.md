# IP Search CIDR Notation Fix

## Problem Analysis

After examining the code, I've identified the issue with the IP search functionality that fails to match IPs when using CIDR notation like "192.168.0.0/16". The current implementation has these issues:

1. The backend is using simple string matching with SQL `ILIKE` operators:
   - `Interface.ip_address.ilike(f"%{ip_address_query}%")`
   - `Route.destination_network.ilike(f"%{ip_address_query}%")`
   - `VIP.external_ip.ilike(f"%{ip_address_query}%") | VIP.mapped_ip.ilike(f"%{ip_address_query}%")`

2. This string matching approach works for partial IP searches like "192." but fails for CIDR notation:
   - When searching for "192.168.0.0/16", the system looks for that exact string
   - IP addresses like "192.168.101.125" don't contain "192.168.0.0/16" as a substring
   - The system doesn't interpret the CIDR notation as an IP range specification

3. Interestingly, the code already imports the `ipaddress` module in interface.py with a comment about CIDR/subnet matching, but it's not being utilized.

## Solution Plan

Here's a comprehensive solution that properly handles CIDR notation and subnet searches:

## Step 1: Create an IP Search Utility Module

Create a new file: `fortinet-api/app/utils/ip_utils.py`

```python
import ipaddress
from typing import Union, List, Tuple, Optional

def parse_ip_query(query: str) -> Tuple[Optional[Union[ipaddress.IPv4Network, ipaddress.IPv6Network]], bool]:
    """
    Parse an IP address query into an ipaddress.IPv4Network or ipaddress.IPv6Network object.
    
    Returns a tuple of (network_object, is_cidr) where:
    - network_object: The parsed network object or None if parsing failed
    - is_cidr: Boolean indicating if the query was in CIDR notation
    """
    # Check if query is in CIDR notation
    is_cidr = '/' in query
    
    try:
        # Try to parse as a network with prefix
        if is_cidr:
            return ipaddress.ip_network(query, strict=False), True
        
        # Try to parse as a simple IP
        if query.count('.') == 3:  # Full IPv4 address
            return ipaddress.ip_network(f"{query}/32", strict=False), False
            
        # Partial IP address (e.g., "192.168")
        # Add appropriate wildcard suffix based on the completeness
        parts = query.strip().rstrip('.').split('.')
        if len(parts) == 1:  # Just one octet (e.g., "192")
            return ipaddress.ip_network(f"{parts[0]}.0.0.0/8", strict=False), False
        elif len(parts) == 2:  # Two octets (e.g., "192.168")
            return ipaddress.ip_network(f"{parts[0]}.{parts[1]}.0.0/16", strict=False), False
        elif len(parts) == 3:  # Three octets (e.g., "192.168.1")
            return ipaddress.ip_network(f"{parts[0]}.{parts[1]}.{parts[2]}.0/24", strict=False), False
        
        return None, False
    except ValueError:
        # If not valid IP notation, return None and let the original string matching work
        return None, False

def ip_is_in_network(ip_str: str, network: Union[ipaddress.IPv4Network, ipaddress.IPv6Network]) -> bool:
    """
    Check if an IP address is within a network.
    Returns True if the IP is in the network, False otherwise or if the IP is invalid.
    """
    try:
        ip = ipaddress.ip_address(ip_str)
        return ip in network
    except ValueError:
        return False
```

## Step 2: Update Interface Search Function

Modify `fortinet-api/app/crud/interface.py`:

```python
import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.interface import Interface
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_interfaces_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[Interface], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(Interface).options(joinedload(Interface.vdom))
    
    if network and is_cidr:
        # For CIDR notation, we need to fetch all potential matches first
        # because we can't do the network containment check directly in SQL
        potential_matches = base_query.all()
        
        # Filter interfaces where the IP is in the specified network
        matches = [
            iface for iface in potential_matches 
            if iface.ip_address and ip_is_in_network(iface.ip_address, network)
        ]
        
        # Handle pagination manually since we're filtering in Python
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit]
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(Interface.ip_address.ilike(f"%{ip_address_query}%"))
        total_count = query.count()
        interfaces = query.offset(skip).limit(limit).all()
        return interfaces, total_count
```

## Step 3: Update Route Search Function

Modify `fortinet-api/app/crud/route.py`:

```python
import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.route import Route
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_routes_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[Route], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(Route).options(joinedload(Route.vdom))
    
    if network and is_cidr:
        # For CIDR notation, fetch all potential matches first
        potential_matches = base_query.all()
        
        # Filter routes where the network contains or is contained by the query network
        matches = []
        for route in potential_matches:
            if route.destination_network and route.mask_length:
                try:
                    # Create network from route destination and mask
                    route_network = ipaddress.ip_network(
                        f"{route.destination_network}/{route.mask_length}", 
                        strict=False
                    )
                    
                    # Check for network overlap (either direction)
                    if route_network.overlaps(network) or network.overlaps(route_network):
                        matches.append(route)
                except (ValueError, AttributeError):
                    pass
        
        # Handle pagination manually
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit]
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(Route.destination_network.ilike(f"%{ip_address_query}%"))
        total_count = query.count()
        routes = query.offset(skip).limit(limit).all()
        return routes, total_count
```

## Step 4: Update VIP Search Function

Modify `fortinet-api/app/crud/vip.py`:

```python
import ipaddress
from typing import Tuple, List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.vip import VIP
from app.utils.ip_utils import parse_ip_query, ip_is_in_network

def search_vips_by_ip(
    db: Session,
    ip_address_query: str,
    skip: int = 0,
    limit: int = 15
) -> Tuple[List[VIP], int]:
    # Parse the query string
    network, is_cidr = parse_ip_query(ip_address_query)
    
    # Base query with eager loading
    base_query = db.query(VIP).options(joinedload(VIP.vdom))
    
    if network and is_cidr:
        # For CIDR notation, fetch all potential matches first
        potential_matches = base_query.all()
        
        # Filter VIPs where either external_ip or mapped_ip is in the network
        matches = [
            vip for vip in potential_matches 
            if (vip.external_ip and ip_is_in_network(vip.external_ip, network)) or
               (vip.mapped_ip and ip_is_in_network(vip.mapped_ip, network))
        ]
        
        # Handle pagination manually
        total_count = len(matches)
        paginated_results = matches[skip:skip + limit]
        
        return paginated_results, total_count
    else:
        # Fall back to the original string-based search
        query = base_query.filter(
            (VIP.external_ip.ilike(f"%{ip_address_query}%")) |
            (VIP.mapped_ip.ilike(f"%{ip_address_query}%"))
        )
        total_count = query.count()
        vips = query.offset(skip).limit(limit).all()
        return vips, total_count
```

## Step 5: Create the Utils Directory (if needed)

If the `utils` directory doesn't exist yet:

```bash
mkdir -p fortinet-api/app/utils
touch fortinet-api/app/utils/__init__.py
```

## Implementation Notes

1. **How the Solution Works**:
   - For CIDR notation queries (e.g., "192.168.0.0/16"), we use Python's `ipaddress` module to:
     - Parse the query into a network object
     - Fetch potential matches from the database
     - Filter results by checking if each IP is contained within the network
     - Handle pagination manually after filtering

   - For non-CIDR queries (e.g., "192."), we maintain the original string matching behavior

2. **Performance Considerations**:
   - This solution fetches all potential matches when using CIDR notation, which works well for moderate-sized datasets
   - For very large installations, you might want to consider:
     - Database-specific IP range functions (if supported by your DB)
     - Indexed views for common queries
     - Caching strategies for frequently used searches

3. **Backward Compatibility**:
   - The solution maintains compatibility with existing search patterns
   - All current search functionality continues to work as expected

4. **Potential Future Enhancements**:
   - Add database indices on IP address columns for better performance
   - Implement DB-specific IP range functions if using PostgreSQL (which has excellent IP type support)
   - Add caching for common searches
   - Create a more sophisticated frontend for building complex IP queries

## Testing

1. After implementing these changes, test with the following queries:
   - "192.168.0.0/16" - Should return all IPs in the 192.168.x.x range
   - "10.0.0.0/8" - Should return all IPs in the 10.x.x.x range
   - "192." - Should continue to work as before
   - "192.168.101.125" - Should return the exact IP match

2. Ensure pagination works correctly with the updated search logic

This implementation properly handles CIDR notation while maintaining backward compatibility with the existing search functionality.