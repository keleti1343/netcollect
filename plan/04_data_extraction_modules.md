# Plan Step 4: Data Extraction Modules

This document details the functions within the `extraction.py` module, responsible for sending commands to connected Fortinet devices and retrieving the raw output. Parsing of this output will be handled by a separate module/logic detailed in `plan/05_parsing_logic.md`.

## 1. Module Purpose and Location

-   **Purpose:** To encapsulate the logic for executing specific FortiOS commands required to gather different types of information. These functions will take an active Netmiko connection object and return the raw string output from the commands.
-   **Location:** `fortinet_collector/core/extraction.py`

## 2. Helper Function for Command Execution

It's beneficial to have a helper function to send commands and handle common scenarios.

### `execute_command(ssh_conn: ConnectHandler, command: str, expect_string: str = None) -> str | None:`
-   **Description:** Sends a single command to the device.
-   **Parameters:**
    -   `ssh_conn` (ConnectHandler): Active Netmiko connection.
    -   `command` (str): The command to execute.
    -   `expect_string` (str, optional): A string to expect in the output, useful for commands that don't return to the prompt immediately or for pagination.
-   **Returns:** Raw string output of the command, or `None` if an error occurs.
-   **Implementation Details:**
    -   Uses `ssh_conn.send_command()` or `ssh_conn.send_config_set()` as appropriate. `send_command` is generally preferred for `show` or `get` commands.
    -   Logs the command being executed.
    -   Handles potential exceptions during command execution.

```python
# Example structure in fortinet_collector/core/extraction.py
from netmiko import ConnectHandler
import logging

logger = logging.getLogger(__name__)

def execute_command(ssh_conn: ConnectHandler, command: str, expect_string: str = None) -> str | None:
    """
    Executes a single command on the device and returns the raw output.
    """
    if not ssh_conn or not ssh_conn.is_alive():
        logger.error(f"SSH connection is not active for host {ssh_conn.host if ssh_conn else 'Unknown'}.")
        return None
    
    logger.debug(f"Executing command on {ssh_conn.host}: {command}")
    try:
        # For 'get' or 'show' commands, send_command is often suitable.
        # If commands change configuration mode (though not typical for pure extraction),
        # send_config_set might be needed, but these are read-only commands.
        if expect_string:
            output = ssh_conn.send_command(command, expect_string=expect_string)
        else:
            output = ssh_conn.send_command(command)
        
        logger.debug(f"Raw output for '{command}' on {ssh_conn.host}:\n{output[:500]}...") # Log snippet
        return output
    except Exception as e:
        logger.error(f"Error executing command '{command}' on {ssh_conn.host}: {e}")
        return None

def execute_config_commands(ssh_conn: ConnectHandler, commands: list[str]) -> str | None:
    """
    Executes a set of configuration commands (like entering a config mode then showing).
    """
    if not ssh_conn or not ssh_conn.is_alive():
        logger.error(f"SSH connection is not active for host {ssh_conn.host if ssh_conn else 'Unknown'}.")
        return None

    logger.debug(f"Executing config command set on {ssh_conn.host}: {commands}")
    try:
        output = ssh_conn.send_config_set(commands)
        logger.debug(f"Raw output for config set on {ssh_conn.host}:\n{output[:500]}...") # Log snippet
        return output
    except Exception as e:
        logger.error(f"Error executing config command set on {ssh_conn.host}: {e}")
        return None
```

## 3. Key Data Extraction Functions

These functions will utilize the `execute_command` or `execute_config_commands` helper.

### `get_central_management_info(ssh_conn: ConnectHandler) -> str | None:`
-   **Description:** Fetches FortiManager and FortiAnalyzer configuration.
-   **FortiOS Commands:**
    1.  `show system central-management`
    2.  `show log fortianalyzer setting` (or `show log fortianalyzer override-setting` if applicable)
    *Note: The original script used `send_config_set` with these. If they are purely `show` commands, `send_command` for each might be cleaner, or combine into a list for `send_config_set` if that's more efficient.*
-   **Returns:** Concatenated raw string output of the commands, or `None` on error.
-   **Implementation:**
    ```python
    # In fortinet_collector/core/extraction.py
    def get_central_management_info(ssh_conn: ConnectHandler) -> str | None:
        commands = [
            'show system central-management',
            'show log fortianalyzer setting' 
            # Consider 'show log fortianalyzer override-setting' if needed
        ]
        # Using send_config_set as it can handle multiple show commands and return combined output
        return execute_config_commands(ssh_conn, commands)
    ```

### `get_vdom_list_output(ssh_conn: ConnectHandler) -> str | None:`
-   **Description:** Fetches the list of VDOMs configured on the device.
-   **FortiOS Commands:**
    1.  `config global` (Ensures context, though `diagnose` commands are often global)
    2.  `diagnose sys vd list`
    3.  `end` (Return to global prompt if `config global` changes context significantly)
    *Alternatively, if `diagnose sys vd list` can be run directly without `config global` that's simpler.*
-   **Returns:** Raw string output of `diagnose sys vd list`, or `None` on error.
-   **Implementation:**
    ```python
    # In fortinet_collector/core/extraction.py
    def get_vdom_list_output(ssh_conn: ConnectHandler) -> str | None:
        # 'diagnose sys vd list' is typically a global command.
        # If issues arise, prefix with 'config global' and suffix with 'end' in a config set.
        command = 'diagnose sys vd list'
        return execute_command(ssh_conn, command)
    ```

### `get_system_interfaces_config(ssh_conn: ConnectHandler) -> str | None:`
-   **Description:** Fetches the configuration of all system interfaces (physical, VLANs, loopbacks, tunnels, etc.).
-   **FortiOS Commands:**
    1.  `config global` (If needed to ensure context for `show system interface`)
    2.  `show system interface`
    3.  `end` (If `config global` was used)
    *Alternatively, `get system interface` (used in original script for some parts) provides a summary but `show system interface` provides full config details needed for parsing VLANs, descriptions etc.*
-   **Returns:** Raw string output of `show system interface`, or `None` on error.
-   **Implementation:**
    ```python
    # In fortinet_collector/core/extraction.py
    def get_system_interfaces_config(ssh_conn: ConnectHandler) -> str | None:
        # 'show system interface' is a common command.
        # It might be paginated on some devices/versions. If so, 'expect_string' might be needed
        # or handling for '--More--'. Netmiko's send_command usually handles basic pagination.
        commands = ['config global', 'show system interface', 'end'] # Ensure full output
        return execute_config_commands(ssh_conn, commands)

    def get_system_interface_summary(ssh_conn: ConnectHandler) -> str | None:
        # This fetches the summarized list, useful for quick mapping of names to IPs/status
        command = "get system interface"
        return execute_command(ssh_conn, command)
    ```

### `get_vdom_routing_table(ssh_conn: ConnectHandler, vdom_name: str) -> str | None:`
-   **Description:** Fetches the complete routing table for a specific VDOM.
-   **FortiOS Commands:**
    1.  `config vdom`
    2.  `edit <vdom_name>`
    3.  `get router info routing-table all`
    4.  `end` (Return to global context)
-   **Returns:** Raw string output of the routing table command, or `None` on error.
-   **Implementation:**
    ```python
    # In fortinet_collector/core/extraction.py
    def get_vdom_routing_table_all(ssh_conn: ConnectHandler, vdom_name: str) -> str | None:
        commands = [
            f'config vdom',
            f'edit {vdom_name}',
            'get router info routing-table all',
            'end'
        ]
        return execute_config_commands(ssh_conn, commands)

    def get_vdom_routing_table_kernel(ssh_conn: ConnectHandler, vdom_name: str) -> str | None:
        commands = [
            f'config vdom',
            f'edit {vdom_name}',
            'get router info kernel', # For FIB
            'end'
        ]
        return execute_config_commands(ssh_conn, commands)
    ```

### `get_vdom_vip_config(ssh_conn: ConnectHandler, vdom_name: str) -> str | None:`
-   **Description:** Fetches the VIP (Virtual IP) configurations for a specific VDOM.
-   **FortiOS Commands:**
    1.  `config vdom`
    2.  `edit <vdom_name>`
    3.  `show firewall vip`
    4.  `end` (Return to global context)
-   **Returns:** Raw string output of `show firewall vip`, or `None` on error.
-   **Implementation:**
    ```python
    # In fortinet_collector/core/extraction.py
    def get_vdom_vip_config(ssh_conn: ConnectHandler, vdom_name: str) -> str | None:
        commands = [
            f'config vdom',
            f'edit {vdom_name}',
            'show firewall vip',
            'end'
        ]
        return execute_config_commands(ssh_conn, commands)
    ```

## 4. General Considerations

-   **Command Output Length:** Some commands, like `show system interface` or `get router info routing-table all`, can produce very long outputs. Netmiko's `send_command` and `send_config_set` generally handle pagination (`--More--`) well, but this should be tested. If issues arise, `send_command_timing` or `send_command` with an `expect_string` might be needed for more complex interactions.
-   **Privilege Levels:** All these commands typically require administrator privileges. The connection module should ideally verify the prompt character (`#` for privileged access).
-   **Context Management:** Switching VDOM contexts (`config vdom`, `edit <vdom_name>`, `end`) is crucial. Using `send_config_set` for a sequence of commands including context changes is generally robust.

## 5. Dependencies

-   `netmiko`
-   `logging` (standard Python library)

This plan provides the engineer with a clear set of functions to implement for raw data extraction. The next step will be to detail how to parse the outputs from these functions.