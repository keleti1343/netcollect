# Plan Step 5: Parsing Logic

This document details the logic for parsing the raw string outputs obtained from Fortinet devices into structured data (typically lists of dictionaries). This structured data will then be used for database insertion. The parsing functions will primarily use regular expressions.

## 1. Module Purpose and Location

-   **Purpose:** To convert unstructured command output from Fortinet devices into a structured format that aligns with the database schema. This module will house all regular expressions and the logic to apply them.
-   **Location:** `fortinet_collector/core/parsing.py`

## 2. General Parsing Approach

-   **Leverage Existing Regex:** The numerous regex patterns defined in the original `get_ip_from_fortinet_bis.py` script will serve as a strong foundation. They should be reviewed and, if necessary, refined for clarity or to handle slight variations in output.
-   **Iterative Matching:** For outputs that contain multiple records (e.g., a list of interfaces, routes, or VIPs), parsing will typically involve iterating through the lines of the output or using `re.finditer()` with multi-line regex patterns.
-   **Structured Output:** Each parsing function should return a list of dictionaries. Each dictionary represents a single record (e.g., one interface, one route) with keys corresponding to the database table columns.
-   **Helper Functions:** Common tasks like safely extracting a regex group or cleaning up a string can be put into helper functions within this module.

## 3. Regular Expression Definitions

All regex patterns from the original script should be consolidated and clearly named within `parsing.py`.

```python
# fortinet_collector/core/parsing.py
import re
from netaddr import IPAddress, AddrFormatError # For mask conversion
import logging

logger = logging.getLogger(__name__)

# --- Regex Definitions (examples from original script, to be fully listed here) ---
# VDOMs
VDOM_LIST_REGEX = re.compile(r'name=(?!vsys_hamgmt\/vsys_hamgmt|vsys_ha\/vsys_ha|vsys_fgfm\/vsys_fgfm)(?P<vdom_name>.+)\/(.+) index=(?P<vdom_index>\d+)')

# Central Management
FMG_IP_REGEX = re.compile(r'set fmg \"(?P<fmg_ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\"') # Adjusted from original: 'fmg' to 'set fmg' for 'show system central-management'
FAZ_IP_REGEX = re.compile(r'set server \"(?P<faz_ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\"') # From 'show log fortianalyzer setting'

# System Interfaces (summary for names, IPs, status)
SYSTEM_INTERFACE_SUMMARY_REGEX = re.compile(
    r'name:\s*(?P<int_name>[a-zA-Z0-9\-_.]+)\s*'
    r'(?:management-ip:\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\s*)?' # Optional management IP
    r'ip:\s*(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*(?P<mask>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s*'
    r'status:\s*(?P<status>\w+)\s*'
    r'type:\s*(?P<type>\w+)'
)

# System Interfaces (detailed from 'show system interface')
# These are more complex and involve parsing multi-line "edit <interface_name>" blocks.
# Example for VLAN interfaces (needs to be robust for various set commands)
INTERFACE_EDIT_BLOCK_REGEX = re.compile(r'edit\s+\"(?P<interface_name>[^"]+)\"(.*?)\nnext(?=\nedit|\nend)', re.DOTALL)
INTERFACE_VDOM_REGEX = re.compile(r'set\s+vdom\s+\"(?P<vdom>[^"]+)\"')
INTERFACE_IP_MASK_REGEX = re.compile(r'set\s+ip\s+(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(?P<mask>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})')
INTERFACE_TYPE_REGEX = re.compile(r'set\s+type\s+(?P<type>\w+)') # e.g., loopback, tunnel
INTERFACE_VLANID_REGEX = re.compile(r'set\s+vlanid\s+(?P<vlanid>\d+)')
INTERFACE_DESCRIPTION_REGEX = re.compile(r'set\s+description\s+\"(?P<description>[^"]*)\"')
INTERFACE_PHYSICAL_INTERFACE_REGEX = re.compile(r'set\s+interface\s+\"(?P<physical_interface_name>[^"]+)\"') # For tunnel, vlan

# Routing - Combined from original (static, connected, bgp, fib)
# This regex was quite broad; may need refinement or separate regexes for clarity.
# Example for a generic route line:
ROUTE_LINE_REGEX = re.compile(
    r'^(?P<code>[CSBKO])\s+' # C=Connected, S=Static, B=BGP, K=Kernel(FIB), O=OSPF etc.
    r'(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(?P<mask>\d{1,2})\s+'
    r'(?:\[(?P<metric_admin_dist>\d+\/\d+)\]\s+)?' # Optional admin distance/metric
    r'(?:via\s+(?P<gateway>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}),\s+)?' # Optional gateway
    r'(?P<exit_interface>[a-zA-Z0-9\-_.\/]+)'
    r'(?:,\s*(?P<uptime_comment>.+))?' # Optional uptime or comment
)
# Kernel (FIB) routes from 'get router info kernel'
KERNEL_ROUTE_REGEX = re.compile(
    r'.*?->(?P<ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(?P<mask>\d{1,2})\s+'
    r'pref=\d+\s+metric=\d+\s+proto=\w+\s+scope=\w+\s+flags=.*?\s+'
    r'gwy=(?P<gateway>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+'
    r'dev=(?P<exit_interface>[a-zA-Z0-9\-_.\/]+)'
)


# VIPs (from 'show firewall vip')
VIP_BLOCK_REGEX = re.compile(r'edit\s+\"(?P<vip_name>[^"]+)\"(.*?)\nnext(?=\nedit|\nconfig|\nend)', re.DOTALL)
VIP_EXTIP_REGEX = re.compile(r'set\s+extip\s+(?P<extip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})')
VIP_MAPPEDIP_REGEX = re.compile(r'set\s+mappedip\s+\"(?P<mappedip>[^"]+)\"') # Mapped IP can be a range or single
VIP_EXTINTF_REGEX = re.compile(r'set\s+extintf\s+\"(?P<extintf>[^"]+)\"')
VIP_EXTPORT_REGEX = re.compile(r'set\s+extport\s+(?P<extport>\d+)')
VIP_MAPPEDPORT_REGEX = re.compile(r'set\s+mappedport\s+(?P<mappedport>\d+)')
VIP_COMMENT_REGEX = re.compile(r'set\s+comment\s+\"(?P<comment>[^"]*)\"')
VIP_PORTFORWARD_REGEX = re.compile(r'set\s+portforward\s+enable')
# For virtual server type VIPs
VIP_SERVER_TYPE_REGEX = re.compile(r'set\s+server-type\s+(?P<server_type>\w+)') # e.g. http, https, tcp, udp, ip
VIP_REALSERVER_BLOCK_REGEX = re.compile(r'config\s+realservers(.*?)\n\s*end', re.DOTALL)
VIP_REALSERVER_IP_REGEX = re.compile(r'set\s+ip\s+(?P<realserver_ip>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})')
VIP_REALSERVER_PORT_REGEX = re.compile(r'set\s+port\s+(?P<realserver_port>\d+)')


# Helper to convert netmask to CIDR prefix length
def get_cidr_from_mask(mask_str: str) -> int | None:
    try:
        return IPAddress(mask_str).netmask_bits()
    except AddrFormatError:
        logger.warning(f"Invalid netmask format: {mask_str}")
        return None
    except Exception as e:
        logger.error(f"Error converting mask {mask_str} to CIDR: {e}")
        return None

# Helper to safely get a regex group
def get_match_group(match_obj, group_name, default=None):
    if match_obj:
        try:
            return match_obj.group(group_name)
        except IndexError:
            return default
    return default
```

## 4. Specific Parsing Functions

### `parse_central_management(output: str) -> dict:`
-   **Input:** Raw output from `get_central_management_info`.
-   **Output:** A dictionary `{'fmg_ip': '...', 'faz_ip': '...'}`.
-   **Regex:** `FMG_IP_REGEX`, `FAZ_IP_REGEX`.
```python
# In fortinet_collector/core/parsing.py
def parse_central_management(output: str) -> dict:
    data = {'fmg_ip': None, 'faz_ip': None}
    if not output: return data

    fmg_match = FMG_IP_REGEX.search(output)
    if fmg_match:
        data['fmg_ip'] = fmg_match.group('fmg_ip')

    faz_match = FAZ_IP_REGEX.search(output)
    if faz_match:
        data['faz_ip'] = faz_match.group('faz_ip')
    
    logger.debug(f"Parsed central management: {data}")
    return data
```

### `parse_vdom_list(output: str) -> list[dict]:`
-   **Input:** Raw output from `get_vdom_list_output`.
-   **Output:** List of `{'vdom_name': '...', 'vdom_index': ...}`.
-   **Regex:** `VDOM_LIST_REGEX`.
```python
# In fortinet_collector/core/parsing.py
def parse_vdom_list(output: str) -> list[dict]:
    vdoms = []
    if not output: return vdoms
    for match in VDOM_LIST_REGEX.finditer(output):
        vdoms.append({
            'vdom_name': match.group('vdom_name').strip(),
            'vdom_index': int(match.group('vdom_index'))
        })
    logger.debug(f"Parsed VDOMs: {vdoms}")
    return vdoms
```

### `parse_system_interfaces(show_interface_output: str, get_interface_output: str = None) -> list[dict]:`
-   **Input:** Raw output from `get_system_interfaces_config` (`show system interface`) and optionally `get_system_interface_summary`.
-   **Output:** List of dictionaries, each representing an interface with fields aligning to the `interfaces` table.
-   **Regex:** `INTERFACE_EDIT_BLOCK_REGEX` to find each interface block. Then, within each block, use `INTERFACE_VDOM_REGEX`, `INTERFACE_IP_MASK_REGEX`, `INTERFACE_TYPE_REGEX`, `INTERFACE_VLANID_REGEX`, `INTERFACE_DESCRIPTION_REGEX`, `INTERFACE_PHYSICAL_INTERFACE_REGEX`. The `SYSTEM_INTERFACE_SUMMARY_REGEX` can be used on `get_interface_output` to quickly get status and basic IP/type if `show system interface` is too complex for some details initially.
-   **Note:** This is one of the most complex parsing tasks due to the nested structure and variability of `set` commands.
```python
# In fortinet_collector/core/parsing.py
def parse_system_interfaces(show_interface_output: str) -> list[dict]:
    interfaces = []
    if not show_interface_output:
        return interfaces

    for block_match in INTERFACE_EDIT_BLOCK_REGEX.finditer(show_interface_output):
        interface_name = block_match.group('interface_name')
        content = block_match.group(1) # Content of the 'edit ... next' block
        
        data = {'interface_name': interface_name, 'type': 'unknown'} # Default type

        vdom_match = INTERFACE_VDOM_REGEX.search(content)
        if vdom_match: data['vdom_name'] = vdom_match.group('vdom') # Will need to map to vdom_id later

        ip_mask_match = INTERFACE_IP_MASK_REGEX.search(content)
        if ip_mask_match:
            data['ip_address'] = ip_mask_match.group('ip')
            data['mask'] = ip_mask_match.group('mask') # Store raw mask, or convert to CIDR here/later

        type_match = INTERFACE_TYPE_REGEX.search(content)
        if type_match: data['type'] = type_match.group('type')
        
        vlanid_match = INTERFACE_VLANID_REGEX.search(content)
        if vlanid_match: data['vlan_id'] = int(vlanid_match.group('vlanid'))

        desc_match = INTERFACE_DESCRIPTION_REGEX.search(content)
        if desc_match: data['description'] = desc_match.group('description')

        phys_match = INTERFACE_PHYSICAL_INTERFACE_REGEX.search(content)
        if phys_match: data['physical_interface_name'] = phys_match.group('physical_interface_name')
        
        # Placeholder for status - 'get system interface' output is better for live status
        # data['status'] = 'unknown' 
        
        interfaces.append(data)
    logger.debug(f"Parsed {len(interfaces)} interfaces from 'show system interface' output.")
    return interfaces

# Additional function to parse 'get system interface' for status and quick info might be useful
# and then merge/correlate with the detailed config.
```

### `parse_routing_table(routing_table_all_output: str, kernel_output: str = None) -> list[dict]:`
-   **Input:** Raw output from `get_vdom_routing_table_all` and `get_vdom_routing_table_kernel`.
-   **Output:** List of route dictionaries.
-   **Regex:** `ROUTE_LINE_REGEX` for general routes, `KERNEL_ROUTE_REGEX` for FIB routes.
-   **Transformations:** Convert route codes (C, S, B, K) to descriptive types.
```python
# In fortinet_collector/core/parsing.py
def parse_routing_table(routing_table_all_output: str, kernel_output: str = None) -> list[dict]:
    routes = []
    route_type_map = {
        'C': 'connected', 'S': 'static', 'B': 'bgp', 
        'K': 'kernel_fib', 'O': 'ospf', # Add other common types
    }

    if routing_table_all_output:
        for line in routing_table_all_output.splitlines():
            match = ROUTE_LINE_REGEX.match(line)
            if match:
                code = match.group('code')
                routes.append({
                    'destination_network': match.group('ip'),
                    'mask_length': int(match.group('mask')),
                    'route_type': route_type_map.get(code, f"unknown_{code}"),
                    'gateway': get_match_group(match, 'gateway'),
                    'exit_interface_name': match.group('exit_interface').strip(),
                    'exit_interface_details': get_match_group(match, 'uptime_comment') # Or other details
                })
    
    if kernel_output:
        for line in kernel_output.splitlines():
            match = KERNEL_ROUTE_REGEX.search(line) # Use search for kernel due to varied line starts
            if match:
                routes.append({
                    'destination_network': match.group('ip'),
                    'mask_length': int(match.group('mask')),
                    'route_type': 'fib', # Specifically mark these as FIB from kernel
                    'gateway': get_match_group(match, 'gateway'),
                    'exit_interface_name': match.group('exit_interface').strip(),
                    'exit_interface_details': None 
                })
    logger.debug(f"Parsed {len(routes)} routes.")
    return routes
```

### `parse_vip_config(output: str) -> list[dict]:`
-   **Input:** Raw output from `get_vdom_vip_config`.
-   **Output:** List of VIP dictionaries.
-   **Regex:** `VIP_BLOCK_REGEX` for each VIP. Within blocks: `VIP_EXTIP_REGEX`, `VIP_MAPPEDIP_REGEX`, etc. Special handling for `realservers` in virtual server type VIPs.
```python
# In fortinet_collector/core/parsing.py
def parse_vip_config(output: str) -> list[dict]:
    vips = []
    if not output: return vips

    for block_match in VIP_BLOCK_REGEX.finditer(output):
        vip_name = block_match.group('vip_name')
        content = block_match.group(1)
        
        data = {'vip_name': vip_name, 'vip_type': 'standard'} # Default type

        extip_match = VIP_EXTIP_REGEX.search(content)
        if extip_match: data['external_ip'] = extip_match.group('extip')

        mappedip_match = VIP_MAPPEDIP_REGEX.search(content)
        if mappedip_match: data['mapped_ip'] = mappedip_match.group('mappedip') # Could be a range

        extintf_match = VIP_EXTINTF_REGEX.search(content)
        if extintf_match: data['external_interface'] = extintf_match.group('extintf')
        
        extport_match = VIP_EXTPORT_REGEX.search(content)
        if extport_match: data['external_port'] = int(extport_match.group('extport'))

        mappedport_match = VIP_MAPPEDPORT_REGEX.search(content)
        if mappedport_match: data['mapped_port'] = int(mappedport_match.group('mappedport'))

        comment_match = VIP_COMMENT_REGEX.search(content)
        if comment_match: data['comment'] = comment_match.group('comment')

        if VIP_PORTFORWARD_REGEX.search(content):
            data['vip_type'] = 'port_forward' # More specific if portforward is enabled

        # Handle virtual server types (server-load-balance)
        server_type_match = VIP_SERVER_TYPE_REGEX.search(content)
        if server_type_match:
            data['vip_type'] = f"virtual_server_{server_type_match.group('server_type')}"
            # If it's a virtual server, mapped_ip might be a list of real servers
            # The original script had complex regex for this; simplified here.
            # For simplicity, we might store the primary mapped_ip if available,
            # or mark it and handle real servers separately if needed.
            # The current schema has one mapped_ip. If multiple real servers, this needs thought.
            # For now, assume the 'set mappedip' is the primary one if 'set server-type' is used.
            # If 'config realservers' block exists, that's more detailed.
            
            realserver_block_match = VIP_REALSERVER_BLOCK_REGEX.search(content)
            if realserver_block_match:
                realserver_content = realserver_block_match.group(1)
                # This could create multiple VIP entries or store realservers in a JSONB field if DB supports
                # For now, let's assume the main mapped_ip is already captured.
                # If individual real servers need to be separate records, the data model changes.
                # The original script created separate VIP entries for each real server in a virtual server.
                # This means one 'edit <vip_name>' could result in multiple DB rows.
                
                # Example: if one VIP has multiple real servers, create multiple dicts
                # This part needs careful implementation based on how it should be stored.
                # The current schema (one mapped_ip per VIP row) implies we might pick one,
                # or the definition of 'mapped_ip' for server-type VIPs needs clarification.
                # The original script created multiple entries, let's follow that for now.
                
                # This simplified version just takes the first real server if any.
                # A full implementation would iterate all 'edit <id>' under 'config realservers'.
                first_realserver_ip_match = VIP_REALSERVER_IP_REGEX.search(realserver_content)
                if first_realserver_ip_match:
                    # This would overwrite the general mappedip if we want to be specific for virtual servers
                    data['mapped_ip'] = first_realserver_ip_match.group('realserver_ip') 
                    first_realserver_port_match = VIP_REALSERVER_PORT_REGEX.search(realserver_content)
                    if first_realserver_port_match:
                        data['mapped_port'] = int(first_realserver_port_match.group('realserver_port'))


        vips.append(data)
    logger.debug(f"Parsed {len(vips)} VIPs.")
    return vips
```

## 5. Error Handling in Parsing

-   **Missing Data:** If a regex does not match an expected pattern, the corresponding field in the dictionary should be `None` or a sensible default. Log these occurrences.
-   **Type Conversion Errors:** Handle errors during type conversions (e.g., `int()`, `IPAddress()`). Log and potentially skip the problematic field or record.
-   **Robustness:** Aim for parsers that don't crash on unexpected output variations. Log warnings when partial data is parsed.

## 6. Dependencies

-   `re` (standard Python library)
-   `netaddr` (for `IPAddress` and mask conversions)
-   `logging` (standard Python library)

This plan provides a detailed guide for creating the parsing logic. The engineer will need to meticulously test these regex patterns against actual FortiOS command outputs.