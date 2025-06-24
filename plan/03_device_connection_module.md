# Plan Step 3: Device Connection Module

This document outlines the design for the `connection.py` module, which will be responsible for establishing and managing SSH connections to Fortinet devices using Netmiko.

## 1. Module Purpose and Location

-   **Purpose:** To abstract the complexities of connecting to Fortinet devices via SSH, handle common connection errors, and provide a stable connection object for other modules to use. It will also fetch initial device identifiers like hostname and prompt.
-   **Location:** `fortinet_collector/core/connection.py`

## 2. Key Functions

### `connect_to_device(device_info: dict) -> ConnectHandler | None:`
-   **Description:** Attempts to establish an SSH connection to a Fortinet device using the provided device information.
-   **Parameters:**
    -   `device_info` (dict): A dictionary containing device connection parameters, conforming to the structure defined in `config/devices.json` (e.g., `host`, `username`, `password`, `device_type`, `timeout`, `port`).
-   **Returns:**
    -   A Netmiko `ConnectHandler` object on successful connection.
    -   `None` if the connection fails for any handled reason.
-   **Implementation Details:**
    -   Construct the Netmiko connection dictionary from `device_info`. Ensure `device_type` defaults to 'fortinet' if not provided.
    -   Use a `try-except` block to catch specific Netmiko and Paramiko exceptions.
    -   Log connection attempts, successes, and failures.

```python
# Example structure in fortinet_collector/core/connection.py
from netmiko import ConnectHandler, NetmikoTimeoutException, NetmikoAuthenticationException
from paramiko.ssh_exception import SSHException # More generic SSH errors
import logging

logger = logging.getLogger(__name__)

def connect_to_device(device_info: dict):
    """
    Establishes an SSH connection to a device.
    """
    netmiko_device = {
        'device_type': device_info.get('device_type', 'fortinet'),
        'host': device_info['host'],
        'username': device_info['username'],
        'password': device_info['password'],
        'port': device_info.get('port', 22),
        'timeout': device_info.get('timeout', 100),
        # Add other Netmiko parameters if needed, e.g., 'global_delay_factor'
    }
    
    logger.info(f"Attempting to connect to device: {netmiko_device['host']}")
    try:
        ssh_conn = ConnectHandler(**netmiko_device)
        logger.info(f"Successfully connected to {netmiko_device['host']}")
        return ssh_conn
    except NetmikoTimeoutException:
        logger.error(f"Connection to {netmiko_device['host']} timed out.")
    except NetmikoAuthenticationException:
        logger.error(f"Authentication failed for {netmiko_device['host']}.")
    except SSHException as e:
        logger.error(f"SSH error connecting to {netmiko_device['host']}: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred while connecting to {netmiko_device['host']}: {e}")
    return None

```

### `get_device_identifiers(ssh_conn: ConnectHandler) -> tuple[str | None, str | None]:`
-   **Description:** Fetches the device's command prompt and attempts to parse the hostname from it.
-   **Parameters:**
    -   `ssh_conn` (ConnectHandler): An active Netmiko connection object.
-   **Returns:**
    -   A tuple `(hostname, prompt_char)`.
    -   `hostname` (str | None): The parsed hostname (e.g., "FortiGate-VM64"). `None` if parsing fails.
    -   `prompt_char` (str | None): The prompt character (e.g., "#", "$"). `None` if prompt not found.
-   **Implementation Details:**
    -   Use `ssh_conn.find_prompt()` to get the full prompt string.
    -   Use regular expressions (similar to `fw_name_regex` in the original script) to parse the hostname and the prompt character.
    -   Log the found prompt and parsed hostname.

```python
# Example structure in fortinet_collector/core/connection.py
import re

# Regex to capture hostname and the prompt character (e.g., "MyFW # ")
# This might need adjustment based on typical Fortinet prompts.
HOSTNAME_PROMPT_REGEX = r'^(?P<hostname>[a-zA-Z0-9\-_.\(\)]+)\s*(?P<prompt_char>[#$])\s*$'


def get_device_identifiers(ssh_conn: ConnectHandler):
    """
    Gets the device prompt and parses the hostname.
    """
    if not ssh_conn:
        return None, None
        
    try:
        full_prompt = ssh_conn.find_prompt()
        logger.debug(f"Found prompt for {ssh_conn.host}: {full_prompt}")
        
        match = re.match(HOSTNAME_PROMPT_REGEX, full_prompt)
        if match:
            hostname = match.group('hostname')
            prompt_char = match.group('prompt_char')
            logger.info(f"Parsed hostname: {hostname}, prompt char: {prompt_char} for {ssh_conn.host}")
            return hostname, prompt_char
        else:
            logger.warning(f"Could not parse hostname/prompt from: '{full_prompt}' for {ssh_conn.host}. Using full prompt as hostname.")
            # Fallback: use the part before potential space and #/$ as hostname, and the last char as prompt
            # This is a simplified fallback, the regex is preferred.
            parts = full_prompt.strip().split(' ')
            if len(parts) > 1 and parts[-1] in ('#', '$'):
                 return " ".join(parts[:-1]), parts[-1]
            return full_prompt.strip().rstrip('#$').strip(), full_prompt.strip()[-1:] if full_prompt else None

    except Exception as e:
        logger.error(f"Error getting device identifiers for {ssh_conn.host}: {e}")
    return None, None

```

## 3. Error Handling

The `connect_to_device` function should specifically handle:
-   `NetmikoTimeoutException`: For connection timeouts.
-   `NetmikoAuthenticationException`: For username/password failures.
-   `paramiko.ssh_exception.SSHException`: For other SSH-level errors (e.g., no route to host, connection refused).
-   Generic `Exception`: To catch any other unexpected errors during connection.

All errors should be logged appropriately, providing context (like the device IP).

## 4. Dependencies

-   `netmiko`
-   `paramiko` (implicitly via `netmiko`)
-   `logging` (standard Python library)
-   `re` (standard Python library)

## 5. Usage Example (Conceptual)

This module will be used by the main orchestration script (`main.py`) like so:

```python
# In main.py (conceptual)
# from fortinet_collector.core.connection import connect_to_device, get_device_identifiers
# from fortinet_collector.config_loader import load_devices # Assuming a config loader

# devices = load_devices('config/devices.json')
# for device_config in devices:
#     ssh_connection = connect_to_device(device_config)
#     if ssh_connection:
#         hostname, prompt = get_device_identifiers(ssh_connection)
#         if hostname and prompt == '#': # Check for privileged access
#             # Proceed with data extraction
#             pass
#         else:
#             # Log issue (e.g. non-privileged access or parsing failure)
#             pass
#         ssh_connection.disconnect()
#         logger.info(f"Disconnected from {device_config['host']}")
```

This detailed plan for the connection module should provide a clear path for the engineer.