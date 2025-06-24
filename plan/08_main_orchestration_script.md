# Plan Step 8: Main Orchestration Script (`main.py`)

This document outlines the structure and logic for the main orchestration script, `main.py`. This script will be the entry point for the `fortinet_collector` application and will coordinate the workflow of connecting to devices, extracting data, parsing it, and storing it in the PostgreSQL database.

## 1. Script Purpose and Location

-   **Purpose:** To orchestrate the entire data collection process by utilizing the various modules created (config loading, connection, extraction, parsing, database interaction). It handles the overall control flow, error management at a high level, and summary reporting.
-   **Location:** `fortinet_collector/main.py`

## 2. High-Level Workflow

The `main.py` script will perform the following steps in sequence:

1.  **Initialization:**
    *   Setup logging (as defined in `plan/07_error_handling_and_logging_strategy.md`).
    *   Record start time for performance monitoring.
2.  **Load Configuration:**
    *   Load device connection details from `config/devices.json`.
    *   Load database connection parameters (ideally from a config file or environment variables, but can be hardcoded in `db_utils/postgres_handler.py` initially as per `plan/06`).
3.  **Establish Database Connection:**
    *   Connect to the PostgreSQL database using `db_utils.postgres_handler.get_db_connection()`. If this fails, log a critical error and exit.
4.  **Initialize Counters/Statistics:** For the final summary report (e.g., total devices, processed, skipped, errors).
5.  **Main Processing Loop (Iterate Through Devices):**
    *   For each device in the loaded configuration:
        *   Log the start of processing for the current device.
        *   **Connect to Device:** Use `core.connection.connect_to_device()`.
            *   If connection fails, log error, increment skipped device counter, and continue to the next device.
        *   **Fetch Device Identifiers:** Use `core.connection.get_device_identifiers()`.
            *   If identifiers cannot be fetched or indicate non-privileged access (e.g., prompt is '$'), log a warning/error, disconnect, and skip to the next device.
        *   **Process Firewall Data:**
            *   Extract central management info (FMG/FAZ IPs) using `core.extraction.get_central_management_info()` and parse using `core.parsing.parse_central_management()`.
            *   Prepare firewall data dictionary (hostname, IP from config, FMG/FAZ IPs, site from config).
            *   Upsert firewall data using `db_utils.postgres_handler.upsert_firewall()` and retrieve `firewall_id`. If this fails, log error and consider skipping this device.
        *   **Process VDOMs:**
            *   Extract VDOM list output using `core.extraction.get_vdom_list_output()` and parse using `core.parsing.parse_vdom_list()`.
            *   For each parsed VDOM:
                *   Prepare VDOM data dictionary.
                *   Upsert VDOM data using `db_utils.postgres_handler.upsert_vdom()` (with `firewall_id`) and retrieve `vdom_id`.
                *   **Process VDOM Routes:**
                    *   Extract routing table output (`all` and `kernel`) using `core.extraction.get_vdom_routing_table_all()` and `core.extraction.get_vdom_routing_table_kernel()`.
                    *   Parse routes using `core.parsing.parse_routing_table()`.
                    *   For each parsed route, upsert using `db_utils.postgres_handler.upsert_route()` (with `vdom_id`).
                    *   (Consider: Strategy for deleting old routes for this VDOM before inserting new ones if not using perfect UPSERT keys).
                *   **Process VDOM VIPs:**
                    *   Extract VIP config output using `core.extraction.get_vdom_vip_config()`.
                    *   Parse VIPs using `core.parsing.parse_vip_config()`.
                    *   For each parsed VIP, upsert using `db_utils.postgres_handler.upsert_vip()` (with `vdom_id`).
                    *   (Consider: Strategy for deleting old VIPs).
        *   **Process System Interfaces:**
            *   Extract system interface configuration output using `core.extraction.get_system_interfaces_config()`.
            *   Parse interfaces using `core.parsing.parse_system_interfaces()`.
            *   For each parsed interface:
                *   Determine its `vdom_id` (map `vdom_name` from parsed interface data to `vdom_id` obtained earlier, or `None` for global interfaces).
                *   Upsert interface data using `db_utils.postgres_handler.upsert_interface()` (with `firewall_id` and `vdom_id`).
        *   **Disconnect:** Close the SSH connection to the device using `ssh_conn.disconnect()`.
        *   Increment processed device counter.
        *   Log completion for the current device.
6.  **Close Database Connection:** Use `db_utils.postgres_handler.close_db_connection()`.
7.  **Reporting:**
    *   Calculate total execution time.
    *   Log the summary report (total devices, processed, skipped, errors, execution time).

## 3. Example Structure of `main.py`

```python
# fortinet_collector/main.py
import logging
import time
import json # For loading device configurations

# Custom modules
from .core import connection as conn_manager
from .core import extraction as extractor
from .core import parsing as parser
from .db_utils import postgres_handler as db_handler
# from .utils import logger_setup # Assuming logger_setup is in utils

# --- Global Variables / Configuration Paths ---
DEVICES_CONFIG_PATH = "config/devices.json"

# Placeholder for logger setup function if in a separate file
def setup_logging(console_level=logging.INFO, file_level=logging.DEBUG):
    # Basic config for example, refer to plan/07 for detailed setup
    logging.basicConfig(level=console_level, 
                        format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    # Add file handler as per plan/07 if needed here

logger = logging.getLogger(__name__)

def load_device_configurations(config_path: str) -> list[dict]:
    """Loads device configurations from the JSON file."""
    try:
        with open(config_path, 'r') as f:
            devices = json.load(f)
        logger.info(f"Successfully loaded {len(devices)} device configurations from {config_path}")
        return devices
    except FileNotFoundError:
        logger.critical(f"Device configuration file not found: {config_path}")
        raise
    except json.JSONDecodeError as e:
        logger.critical(f"Error decoding JSON from {config_path}: {e}")
        raise
    except Exception as e:
        logger.critical(f"An unexpected error occurred while loading device configurations: {e}")
        raise

def main():
    setup_logging() # Configure logging first
    start_time = time.time()
    logger.info("Fortinet Collector process started.")

    # Statistics
    stats = {
        "total_devices_configured": 0,
        "devices_processed_successfully": 0,
        "devices_skipped_connection_failure": 0,
        "devices_skipped_privilege_issue": 0,
        "errors_data_handling": 0 # Generic counter for parsing/db errors on items
    }

    try:
        devices = load_device_configurations(DEVICES_CONFIG_PATH)
        stats["total_devices_configured"] = len(devices)
    except Exception:
        logger.critical("Exiting due to failure in loading device configurations.")
        return # Exit if config loading fails

    db_conn = None
    try:
        db_conn = db_handler.get_db_connection()
    except Exception as e:
        logger.critical(f"Failed to connect to the database. Exiting. Error: {e}")
        return # Exit if DB connection fails

    # --- Main Device Loop ---
    for device_config in devices:
        device_host = device_config.get('host')
        logger.info(f"--- Starting processing for device: {device_host} ---")
        
        ssh_conn = None
        try:
            ssh_conn = conn_manager.connect_to_device(device_config)
            if not ssh_conn:
                logger.error(f"Skipping device {device_host} due to connection failure.")
                stats["devices_skipped_connection_failure"] += 1
                continue

            hostname, prompt_char = conn_manager.get_device_identifiers(ssh_conn)
            if not hostname or prompt_char != '#':
                logger.warning(f"Skipping device {device_host}: Could not get privileged prompt (Hostname: {hostname}, Prompt: {prompt_char}).")
                stats["devices_skipped_privilege_issue"] += 1
                if ssh_conn: ssh_conn.disconnect()
                continue
            
            logger.info(f"Connected to {hostname} ({device_host}) with privileged access.")

            # 1. Firewall Info
            central_mgmt_output = extractor.get_central_management_info(ssh_conn)
            central_mgmt_data = parser.parse_central_management(central_mgmt_output if central_mgmt_output else "")
            
            firewall_db_data = {
                'fw_name': hostname, # Use parsed hostname
                'fw_ip': device_host,
                'fmg_ip': central_mgmt_data.get('fmg_ip'),
                'faz_ip': central_mgmt_data.get('faz_ip'),
                'site': device_config.get('site')
            }
            firewall_id = db_handler.upsert_firewall(db_conn, firewall_db_data)
            if not firewall_id:
                logger.error(f"Failed to upsert firewall record for {hostname}. Skipping further processing for this device.")
                stats["errors_data_handling"] +=1
                if ssh_conn: ssh_conn.disconnect()
                continue
            
            # Store VDOM IDs for interface mapping
            vdom_name_to_id_map = {}

            # 2. VDOMs
            vdom_list_output = extractor.get_vdom_list_output(ssh_conn)
            parsed_vdoms = parser.parse_vdom_list(vdom_list_output if vdom_list_output else "")
            
            for vdom_info in parsed_vdoms:
                vdom_name = vdom_info.get('vdom_name')
                logger.info(f"Processing VDOM: {vdom_name} on {hostname}")
                vdom_id = db_handler.upsert_vdom(db_conn, vdom_info, firewall_id)
                if not vdom_id:
                    logger.error(f"Failed to upsert VDOM {vdom_name} for {hostname}. Skipping this VDOM.")
                    stats["errors_data_handling"] +=1
                    continue
                vdom_name_to_id_map[vdom_name] = vdom_id

                # 2a. VDOM Routes
                # (Consider deleting old routes for this vdom_id first if not perfect UPSERT)
                # db_handler.delete_routes_for_vdom(db_conn, vdom_id) # Example
                route_all_output = extractor.get_vdom_routing_table_all(ssh_conn, vdom_name)
                route_kernel_output = extractor.get_vdom_routing_table_kernel(ssh_conn, vdom_name)
                parsed_routes = parser.parse_routing_table(
                    route_all_output if route_all_output else "",
                    route_kernel_output if route_kernel_output else ""
                )
                for route_data in parsed_routes:
                    if not db_handler.upsert_route(db_conn, route_data, vdom_id):
                        stats["errors_data_handling"] +=1
                
                # 2b. VDOM VIPs
                # (Consider deleting old VIPs for this vdom_id first)
                # db_handler.delete_vips_for_vdom(db_conn, vdom_id) # Example
                vip_config_output = extractor.get_vdom_vip_config(ssh_conn, vdom_name)
                parsed_vips = parser.parse_vip_config(vip_config_output if vip_config_output else "")
                for vip_data in parsed_vips:
                    if not db_handler.upsert_vip(db_conn, vip_data, vdom_id):
                        stats["errors_data_handling"] +=1

            # 3. System Interfaces (after all VDOMs are known, for vdom_id mapping)
            # (Consider deleting old interfaces for this firewall_id first)
            # db_handler.delete_interfaces_for_firewall(db_conn, firewall_id) # Example
            interfaces_output = extractor.get_system_interfaces_config(ssh_conn)
            parsed_interfaces = parser.parse_system_interfaces(interfaces_output if interfaces_output else "")
            for if_data in parsed_interfaces:
                # Map parsed interface's vdom_name to vdom_id
                interface_vdom_name = if_data.pop('vdom_name', None) # Remove temp key
                interface_vdom_id = vdom_name_to_id_map.get(interface_vdom_name) if interface_vdom_name else None
                if not db_handler.upsert_interface(db_conn, if_data, firewall_id, interface_vdom_id):
                    stats["errors_data_handling"] +=1
            
            stats["devices_processed_successfully"] += 1
            logger.info(f"Successfully processed device: {hostname} ({device_host})")

        except Exception as e:
            logger.error(f"An unexpected error occurred while processing device {device_host}: {e}", exc_info=True)
            stats["errors_data_handling"] += 1 # Or a more specific counter
        finally:
            if ssh_conn and ssh_conn.is_alive():
                ssh_conn.disconnect()
                logger.info(f"Disconnected from {device_host}")
            logger.info(f"--- Finished processing for device: {device_host} ---")

    # --- End of Device Loop ---

    if db_conn:
        db_handler.close_db_connection(db_conn)

    end_time = time.time()
    total_time = end_time - start_time
    logger.info("Fortinet Collector process finished.")
    
    # --- Final Summary ---
    logger.info("--- Fortinet Data Collection Run Summary ---")
    logger.info(f"Total devices in configuration: {stats['total_devices_configured']}")
    logger.info(f"Successfully processed devices: {stats['devices_processed_successfully']}")
    logger.info(f"Skipped (connection failure): {stats['devices_skipped_connection_failure']}")
    logger.info(f"Skipped (privilege issue): {stats['devices_skipped_privilege_issue']}")
    logger.info(f"Data handling errors (items): {stats['errors_data_handling']}")
    logger.info(f"Total execution time: {total_time:.2f} seconds")
    logger.info("-------------------------------------------")


if __name__ == "__main__":
    main()
```

## 4. Key Considerations for `main.py`

-   **Deletion of Stale Data:** As mentioned in `plan/06`, the current UPSERT strategy doesn't remove stale data. The `main.py` script is the place where a "delete-then-insert/update" strategy per device/VDOM for items like routes, VIPs, and interfaces would be implemented if chosen. This involves adding `delete_..._for_firewall` or `delete_..._for_vdom` calls in `postgres_handler.py` and invoking them before processing those items in `main.py`.
-   **Transaction Granularity:** The current DB handler functions commit after each UPSERT. For better atomicity per device, `main.py` could manage a transaction: start transaction before processing a device, commit after all its data is successfully upserted, or rollback if any critical error occurs for that device. This would require modifying DB handler functions not to auto-commit.
-   **Configuration Management:** Database credentials and other settings should ideally be externalized from code (e.g., environment variables, separate config file).
-   **Concurrency (Future Enhancement):** For a large number of devices, processing them concurrently (e.g., using `asyncio` or `multiprocessing`/`threading`) could significantly speed up collection. This is a future enhancement.

This `main.py` script will serve as the central nervous system of the Fortinet data collector.