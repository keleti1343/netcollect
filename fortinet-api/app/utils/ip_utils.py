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