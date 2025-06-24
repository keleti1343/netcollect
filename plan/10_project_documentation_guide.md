# Plan Step 10: Project Documentation Guide

This document provides guidelines for the documentation of the `fortinet_collector` module. Good documentation is essential for understanding, using, maintaining, and extending the application.

## 1. Purpose of Documentation

-   **Clarity:** Explain what the project does, how it works, and how to use it.
-   **Maintainability:** Help current and future developers understand the codebase, design decisions, and how to make changes.
-   **Usability:** Enable users (including operators or other developers integrating with it) to set up and run the collector effectively.
-   **Troubleshooting:** Provide guidance on common issues and how to diagnose problems.

## 2. README.md

A comprehensive `README.md` file should be created in the root of the `fortinet_collector` directory. It should include the following sections:

### 2.1. Project Title and Overview
-   Clear title (e.g., "Fortinet Device Data Collector").
-   A brief description of what the project does: Collects configuration and operational data from Fortinet firewalls and stores it in a PostgreSQL database.
-   Key features (e.g., data collected: VDOMs, interfaces, routes, VIPs; configurable device list; PostgreSQL storage).

### 2.2. Prerequisites
-   Python version (e.g., Python 3.8+).
-   PostgreSQL server (version, if specific features are used).
-   Access to Fortinet devices with appropriate credentials.
-   Basic knowledge of Python, virtual environments, and PostgreSQL.

### 2.3. Installation and Setup
1.  **Clone the Repository (if applicable).**
2.  **Create and Activate a Python Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/macOS
    # venv\Scripts\activate    # Windows
    ```
3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Database Setup:**
    -   Instructions to create the PostgreSQL database and user (referencing `plan/02_database_schema_and_setup.md` or the `create_tables.py` script).
    -   Mention running the `db_utils/create_tables.py` script.
    -   Ensure database connection parameters in `db_utils/postgres_handler.py` (or a future config file) are correctly set.
5.  **Device Configuration:**
    -   Explain the structure of `config/devices.json`.
    -   Provide an example and instruct the user to create/populate this file with their device details and credentials.
    -   **Security Warning:** Reiterate the risk of plain-text passwords and suggest alternatives for production.

### 2.4. Configuration
-   **Device Configuration (`config/devices.json`):**
    -   Detailed explanation of each field (`host`, `username`, `password`, `device_type`, `timeout`, `site`, `port`).
-   **Database Configuration:**
    -   Where to set database connection parameters (currently in `db_utils/postgres_handler.py`'s `DB_CONFIG`, ideally moved to a config file or environment variables later).
-   **Logging Configuration (Optional):**
    -   If log levels or file paths are configurable, explain how.

### 2.5. Usage
-   How to run the main collector script:
    ```bash
    python main.py
    ```
-   Expected output (briefly mention console logs and summary).
-   Where to find log files (`fortinet_collector.log`).

### 2.6. Database Schema Overview
-   A brief, high-level description of the main tables (`firewalls`, `vdoms`, `interfaces`, `routes`, `vips`) and their purpose.
-   Optionally, include the Mermaid ERD from `plan/02_database_schema_and_setup.md` directly in the README or link to it.

### 2.7. Testing
-   How to run unit and integration tests (as per `plan/09_testing_strategy.md`).
    ```bash
    pytest
    # pytest tests/unit
    # pytest tests/integration
    ```
-   Mention any setup required for integration tests (e.g., test database, mock server if used).

### 2.8. Troubleshooting Common Issues
-   **Connection Failures:** Check device IP, credentials, network connectivity, SSH enabled on FortiGate.
-   **Authentication Errors:** Verify username/password in `devices.json`.
-   **Database Errors:** Check PostgreSQL server status, connection parameters, user permissions.
-   **Parsing Errors:** May indicate changes in FortiOS command output. Encourage reporting these with sample output.
-   **Log File Location:** Remind users to check logs for detailed error messages.

### 2.9. Contributing (Optional)
-   If contributions are welcome, provide guidelines (coding standards, pull request process).

### 2.10. License (Optional)
-   Specify the project's license (e.g., MIT, Apache 2.0).

## 3. Code-Level Documentation

### 3.1. Docstrings
-   **Modules:** Each Python file (`.py`) should have a module-level docstring at the top explaining its purpose and contents.
-   **Classes:** Each class should have a docstring explaining its purpose, key attributes, and methods.
-   **Functions/Methods:** Each function and method should have a docstring explaining:
    -   Its purpose (what it does).
    -   Arguments (`:param name: description` and `:type name: type`).
    -   Return value (`:return: description` and `:rtype: type`).
    -   Any exceptions it might raise (`:raises ExceptionType: reason`).
    -   Use a standard format like reStructuredText (Sphinx-compatible) or Google Python Style Docstrings.

**Example Function Docstring (reStructuredText):**
```python
def connect_to_device(device_info: dict):
    """
    Establishes an SSH connection to a Fortinet device.

    :param device_info: A dictionary containing device connection parameters.
                        Expected keys: 'host', 'username', 'password'.
                        Optional keys: 'device_type', 'timeout', 'port'.
    :type device_info: dict
    :return: A Netmiko ConnectHandler object on success, None on failure.
    :rtype: netmiko.ConnectHandler | None
    :raises TypeError: if device_info is not a dict or missing required keys.
    """
    # ... code ...
```

### 3.2. Inline Comments
-   Use inline comments (`#`) to explain complex or non-obvious parts of the code.
-   Focus on the "why" behind a piece of code, not just "what" it's doing (the code itself should show the "what").
-   Keep comments concise and up-to-date with the code.

## 4. Configuration File Documentation
-   The `config/devices.json` structure should be clearly documented within the README (as mentioned above) and potentially with comments in an example/template JSON file if provided.

## 5. These Planning Documents
-   The `plan/*.md` files created during this architectural phase serve as the initial detailed design documentation. They should be kept with the project (e.g., in a `plan/` or `docs/design/` directory) for reference.
-   The README can link to this directory for developers interested in the design history.

By following these documentation guidelines, the `fortinet_collector` project will be more accessible, understandable, and easier to maintain over time.