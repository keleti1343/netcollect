# Fortinet Data Collector Project Plan

## 1. Project Overview

The Fortinet Data Collector is a Python-based application designed to extract configuration and operational data from Fortinet firewalls and store it in a PostgreSQL database. The project follows a modular architecture with clear separation of concerns, making it maintainable and extensible.

## 2. Project Structure

```
fortinet_collector/
├── config/
│   └── devices.json         # Device configuration
├── core/
│   ├── __init__.py
│   ├── connection.py        # Device connection logic
│   ├── extraction.py        # Data extraction functions
│   └── parsing.py           # Parsing utilities
├── db_utils/
│   ├── __init__.py
│   ├── create_tables.py     # Database setup
│   └── postgres_handler.py  # PostgreSQL interaction logic
├── __init__.py
├── main.py                  # Main orchestration script
├── requirements.txt         # Python dependencies
└── plan/                    # Project documentation
```

## 3. Main Components

### 3.1 main.py

The main orchestration script that coordinates the data collection process:
- Loads device configurations
- Connects to each device
- Extracts data using SSH commands
- Parses the extracted data
- Stores the parsed data in the database

### 3.2 core/connection.py

Handles SSH connections to Fortinet devices using Netmiko:
- `connect_to_device()`: Establishes SSH connections
- `get_device_identifiers()`: Retrieves device hostname and prompt character

### 3.3 core/extraction.py

Extracts data from Fortinet devices:
- `execute_command()`: Sends commands to the device and returns raw output
- `execute_config_commands()`: Executes multiple commands in configuration mode
- Specific extraction functions for different data types (VDOMs, interfaces, routes, VIPs)

### 3.4 core/parsing.py

Parses raw command output into structured data:
- Regular expressions for extracting information
- Functions to parse specific data types (VDOMs, interfaces, routes, VIPs)

### 3.5 db_utils/postgres_handler.py

Manages database interactions:
- `get_db_connection()`: Establishes database connections
- `close_db_connection()`: Closes database connections
- Upsert functions for different data types (firewalls, VDOMs, interfaces, routes, VIPs)

### 3.6 db_utils/create_tables.py

Sets up the database schema:
- Creates tables for firewalls, VDOMs, interfaces, routes, and VIPs
- Creates necessary indexes

## 4. Database Schema

The database schema includes the following tables:

- `firewalls`: Stores firewall information (hostname, IP, FMG/IP, site)
- `vdoms`: Stores VDOM information (name, index, associated firewall)
- `interfaces`: Stores interface configurations (name, IP, mask, type, etc.)
- `routes`: Stores routing table information (destination, mask, type, gateway, etc.)
- `vips`: Stores VIP configurations (name, external IP, mapped IP, type, etc.)

## 5. Workflow

1. Load device configurations from `config/devices.json`
2. For each device:
   - Connect using SSH
   - Extract data (VDOMs, interfaces, routes, VIPs)
   - Parse the extracted data
   - Store the parsed data in the database
3. Handle errors gracefully and log all operations

## 6. Dependencies

The project requires the following Python libraries:
- netmiko: For SSH connections to Fortinet devices
- netaddr: For IP address and netmask manipulation
- psycopg2-binary: For PostgreSQL database interactions

## 7. Error Handling and Logging

The project has a robust error handling and logging strategy:
- Uses Python's built-in `logging` module
- Logs at different levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Configurable log levels for console and file output
- Rotating file handler for log files

## 8. Testing Strategy

The project includes a testing strategy that covers:
- Unit tests for individual functions
- Integration tests for module interactions
- End-to-end testing of the complete workflow

## 9. Documentation

Comprehensive documentation is provided in the `plan/` directory, covering:
- Initial setup
- Database schema
- Module design
- Error handling
- Testing strategy
- Project documentation guide

## 10. Future Enhancements

Potential future enhancements include:
- Support for additional Fortinet device types
- Enhanced data extraction and parsing
- Improved error handling and recovery
- Web-based interface for viewing collected data
- API for external access to collected data