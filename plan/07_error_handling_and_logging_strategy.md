# Plan Step 7: Error Handling and Logging Strategy

This document outlines the strategy for error handling and logging within the `fortinet_collector` module. The goal is to make the application robust, easy to troubleshoot, and provide clear operational insights.

## 1. Overall Strategy

-   **Robustness:** The application should handle common errors gracefully, attempting to continue processing other devices or data points where possible.
-   **Clear Diagnostics:** Logs should provide sufficient detail to diagnose issues without needing to debug live code extensively.
-   **Structured Logging:** Use Python's built-in `logging` module.
-   **Fail Fast (for critical setup):** Critical configuration errors (e.g., inability to load device list or connect to DB initially) might prevent the script from running.
-   **Continue on Error (for per-device/item issues):** Errors related to a single device, VDOM, or data item should be logged, and the script should attempt to continue with the next item/device.

## 2. Logging Setup

The `logging` module will be configured in `main.py` or a dedicated utility module.

### 2.1. Logger Configuration
-   **Log Format:** Include timestamp, log level, logger name (module), and message.
    -   Example Format: `%(asctime)s - %(levelname)s - %(name)s - %(module)s.%(funcName)s:%(lineno)d - %(message)s`
-   **Log Levels:**
    -   `DEBUG`: Detailed information, typically of interest only when diagnosing problems (e.g., raw command outputs, step-by-step processing).
    -   `INFO`: Confirmation that things are working as expected (e.g., successful connection, data fetched for a device, records upserted).
    -   `WARNING`: An indication that something unexpected happened, or indicative of some problem in the near future (e.g., parsing a field failed but default used, device skipped due to non-critical error).
    -   `ERROR`: Due to a more serious problem, the software has not been able to perform some function (e.g., device connection failed, database query failed).
    -   `CRITICAL`: A serious error, indicating that the program itself may be unable to continue running.
-   **Handlers:**
    -   **Console Handler (`StreamHandler`):** Outputs logs to `sys.stdout` or `sys.stderr`. Log level can be configured (e.g., `INFO` and above for normal runs, `DEBUG` for troubleshooting).
    -   **File Handler (`RotatingFileHandler` or `FileHandler`):** Outputs logs to a file (e.g., `fortinet_collector.log`). Log level typically `DEBUG` or `INFO` to capture more details. `RotatingFileHandler` is recommended for managing log file sizes.

### 2.2. Example Logging Setup (in `main.py` or `utils/logger_setup.py`)
```python
# fortinet_collector/main.py or a dedicated logging_setup.py
import logging
import logging.handlers
import sys

LOG_FILE_PATH = "fortinet_collector.log" # Or configure via settings

def setup_logging(console_level=logging.INFO, file_level=logging.DEBUG):
    """Configures logging for the application."""
    root_logger = logging.getLogger() # Get the root logger
    root_logger.setLevel(logging.DEBUG) # Set root logger to lowest level to allow handlers to control

    # Clear existing handlers (if any, useful for re-running in interactive sessions)
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        handler.close()

    log_formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(name)s - %(module)s.%(funcName)s:%(lineno)d - %(message)s"
    )

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(console_level)
    console_handler.setFormatter(log_formatter)
    root_logger.addHandler(console_handler)

    # File Handler (Rotating)
    # Rotates when log reaches 5MB, keeps 5 backup logs
    file_handler = logging.handlers.RotatingFileHandler(
        LOG_FILE_PATH, maxBytes=5*1024*1024, backupCount=5, encoding='utf-8'
    )
    file_handler.setLevel(file_level)
    file_handler.setFormatter(log_formatter)
    root_logger.addHandler(file_handler)

    # Example: To reduce verbosity of specific libraries if needed
    # logging.getLogger("netmiko").setLevel(logging.WARNING)
    # logging.getLogger("paramiko").setLevel(logging.WARNING)

    logging.info("Logging configured.")

# In each module (e.g., connection.py, parsing.py):
# import logging
# logger = logging.getLogger(__name__)
# logger.info("This is an info message from my_module.")
```

## 3. Error Handling Categories and Approaches

### 3.1. Configuration Errors
-   **Examples:** `devices.json` not found, invalid JSON format, missing database connection parameters.
-   **Handling:**
    -   Log the error with `CRITICAL` or `ERROR` level.
    -   The application should typically exit gracefully as it cannot proceed.
    -   Provide clear messages about what configuration is missing or malformed.

### 3.2. Network/Connection Errors (per device)
-   **Examples:** Device unreachable (`NetmikoTimeoutException`, `SSHException`), authentication failure (`NetmikoAuthenticationException`).
-   **Handling (in `core/connection.py`):**
    -   Log the specific error with `ERROR` level, including the device IP/hostname.
    -   The `connect_to_device` function should return `None`.
    -   The main loop in `main.py` should check for this `None` return, log that the device is being skipped, and continue to the next device.

### 3.3. Command Execution Errors (per device/command)
-   **Examples:** Device returns an error message instead of expected output (e.g., "% Command failed"), command times out.
-   **Handling (in `core/extraction.py`'s `execute_command`):**
    -   Log the error with `ERROR` level, including the device IP/hostname and the failed command.
    -   The `execute_command` function should return `None` or raise a custom exception.
    -   The calling function (e.g., `get_vdom_list_output`) should handle this, log a `WARNING` or `ERROR` that specific data could not be fetched, and return `None` or an empty structure.
    -   The main processing logic should then skip processing this particular piece of data for the device.

### 3.4. Data Parsing Errors (per data item)
-   **Examples:** Regex does not match expected output format, type conversion fails (e.g., `int('abc')`).
-   **Handling (in `core/parsing.py`):**
    -   Log the error with `WARNING` or `ERROR` level, including the problematic data snippet (if not too large or sensitive) and the regex/field involved.
    -   The parsing function should attempt to continue parsing other records if possible.
    -   If a field within a record cannot be parsed, it might be set to `None` or a default value.
    -   If an entire record is unparseable, it might be skipped.
    -   Return partially parsed data if it makes sense, or an empty list/dict if critical parsing fails.

### 3.5. Database Errors
-   **Examples:**
    -   Initial connection failure: Handled by `get_db_connection`. Application might exit if DB is essential.
    -   Query execution errors (e.g., SQL syntax error, constraint violation not handled by UPSERT, disk full, permissions).
-   **Handling (in `db_utils/postgres_handler.py`):**
    -   Log the specific `psycopg2.Error` with `ERROR` level, including the query if possible (be careful with sensitive data in queries).
    -   Rollback the current transaction on error.
    -   The UPSERT functions should return `None` or raise a custom exception.
    -   The main logic should handle this, possibly by skipping the update for that specific record/device and continuing, or by stopping if the DB error is persistent.

## 4. Retry Mechanisms (Optional Enhancement)

-   For transient errors like network timeouts or temporary database unavailability, a simple retry mechanism (e.g., retry up to N times with a delay) could be implemented for:
    -   Device connections.
    -   Database operations.
-   This is an enhancement and not part of the initial core plan unless specifically requested.

## 5. Reporting

At the end of a full collection run, `main.py` should log a summary:
-   Total number of devices configured.
-   Number of devices successfully connected and processed.
-   Number of devices skipped due to connection errors.
-   Number of significant errors encountered during data extraction, parsing, or DB operations (can be a count per category).
-   Total time taken for the run.

Example Summary Log:
```
INFO - Fortinet Data Collection Run Summary:
INFO - Total devices in configuration: 10
INFO - Successfully processed devices: 8
INFO - Skipped devices (connection/auth issues): 2
INFO - Errors during data processing: 5 (e.g., 3 parsing errors, 2 DB errors on specific records)
INFO - Total execution time: 15.72 minutes
```

This comprehensive logging and error handling strategy will ensure the collector is maintainable and issues can be diagnosed effectively.