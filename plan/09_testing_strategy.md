# Plan Step 9: Testing Strategy

This document outlines the testing strategy for the `fortinet_collector` module. A robust testing approach is crucial to ensure the reliability, correctness, and maintainability of the application.

## 1. Overall Testing Goals

-   **Correctness:** Verify that data is extracted, parsed, and stored accurately.
-   **Robustness:** Ensure the application handles errors gracefully and behaves predictably under various conditions (e.g., device offline, malformed output, DB issues).
-   **Maintainability:** Well-tested code is easier to refactor and extend.
-   **Confidence:** Provide confidence that changes do not break existing functionality.

## 2. Types of Tests

### 2.1. Unit Tests
-   **Focus:** Testing individual functions or small, isolated components (e.g., a single parsing function, a database UPSERT helper).
-   **Characteristics:** Fast, independent, and mock external dependencies (like live device connections or actual database writes for most units).

### 2.2. Integration Tests
-   **Focus:** Testing the interaction between different modules or components (e.g., connecting to a (mock) device, extracting raw data, parsing it, and then attempting to store it in a test database).
-   **Characteristics:** Slower than unit tests, may involve real (but controlled) external services or more complex mocks.

### 2.3. End-to-End (E2E) / Manual Testing
-   **Focus:** Testing the entire workflow with a real (or near-real) environment.
-   **Characteristics:** This will likely be manual initially, involving running the `main.py` script against a test Fortinet device (if available) and verifying data in the PostgreSQL database. Automated E2E tests are complex and might be a future consideration.

## 3. Unit Testing Strategy

-   **Tool:** `pytest` is recommended for its simplicity and powerful features (fixtures, parametrization). Python's built-in `unittest` module is also an option.
-   **Location:** Tests can be placed in a `tests/unit/` directory.
-   **Key Areas for Unit Tests:**
    *   **Parsing Functions (`core/parsing.py`):**
        *   For each parsing function, provide sample raw string inputs (from actual device commands) and assert that the output (list of dictionaries) is correct.
        *   Test edge cases: empty input, malformed input, input with optional fields missing/present.
        *   Use `pytest.mark.parametrize` to test with multiple inputs efficiently.
        *   Example: `test_parse_vdom_list_empty_input()`, `test_parse_vdom_list_valid_output()`, `test_parse_interface_block_with_vlan()`.
    *   **Utility Functions:**
        *   E.g., `get_cidr_from_mask` in `core/parsing.py`. Test with valid and invalid mask inputs.
    *   **Configuration Loading (`main.py` or `utils/config_loader.py`):**
        *   Test loading a valid JSON config.
        *   Test handling of file not found or malformed JSON (ensure appropriate exceptions are raised or errors logged). Mock `open()`.
    *   **Database Helper Functions (if any small, testable units exist in `db_utils/postgres_handler.py` without DB connection):**
        *   Most DB functions are integration-level, but if there are pure Python data transformation helpers, unit test them.

### 3.1. Example Unit Test (Conceptual with `pytest`)
```python
# tests/unit/test_parsing.py
import pytest
from fortinet_collector.core.parsing import parse_vdom_list, VDOM_LIST_REGEX # Assuming regex is accessible or mocked

# Sample raw output for VDOM list
SAMPLE_VDOM_OUTPUT_VALID = """
name=root/root index=0
name=vdom1/vdom1 index=1
name=another-vdom/another-vdom index=2
"""
EXPECTED_VDOM_PARSED_VALID = [
    {'vdom_name': 'root', 'vdom_index': 0},
    {'vdom_name': 'vdom1', 'vdom_index': 1},
    {'vdom_name': 'another-vdom', 'vdom_index': 2}
]

SAMPLE_VDOM_OUTPUT_EMPTY = ""
EXPECTED_VDOM_PARSED_EMPTY = []

def test_parse_vdom_list_valid():
    assert parse_vdom_list(SAMPLE_VDOM_OUTPUT_VALID) == EXPECTED_VDOM_PARSED_VALID

def test_parse_vdom_list_empty():
    assert parse_vdom_list(SAMPLE_VDOM_OUTPUT_EMPTY) == EXPECTED_VDOM_PARSED_EMPTY

# Test for a specific regex directly (example)
def test_vdom_regex_matches():
    match = VDOM_LIST_REGEX.search("name=my-vdom/my-vdom index=5")
    assert match is not None
    assert match.group('vdom_name') == "my-vdom"
    assert match.group('vdom_index') == "5"
```

## 4. Integration Testing Strategy

-   **Tool:** `pytest` can also be used for integration tests.
-   **Location:** Tests can be placed in a `tests/integration/` directory.
-   **Key Areas for Integration Tests:**
    *   **Device Connection (`core/connection.py`):**
        *   Requires a test Fortinet device or a sophisticated mock SSH server that mimics Fortinet prompts and command outputs.
        *   If a live test device is used, credentials must be managed securely (e.g., environment variables for tests).
        *   Test successful connection and identifier fetching.
        *   Test connection timeout and authentication failure scenarios (might require specific mock server setup or temporary misconfiguration of test device).
    *   **Data Extraction and Parsing Flow (`core/extraction.py` + `core/parsing.py`):**
        *   Test fetching a specific piece of data (e.g., VDOM list) from a test/mock device and then parsing it. Assert the parsed data structure.
    *   **Database Operations (`db_utils/postgres_handler.py`):**
        *   Requires a test PostgreSQL database instance.
        *   Test `upsert_firewall`, `upsert_vdom`, etc., functions. Verify data is correctly written/updated in the test DB.
        *   Test `ON CONFLICT DO UPDATE` logic.
        *   Test foreign key relationships and `ON DELETE CASCADE` if applicable.
        *   Ensure test database is cleaned up before/after test runs or use a dedicated test schema.
    *   **Full Workflow for a Single (Mocked) Device (`main.py` orchestration):**
        *   Mock the device connection part to return pre-defined command outputs.
        *   Test that `main.py` correctly calls extraction, parsing, and DB upsert functions for these mocked outputs.
        *   Verify data in a test database.

### 4.1. Test Database Setup for Integration Tests
-   Use a separate test database or schema that can be reset between test runs.
-   The `create_tables.py` script (from `plan/02`) can be used to set up the schema in the test database.
-   Consider using a library like `pytest-postgresql` for managing test PostgreSQL instances if running in a CI/CD environment.

## 5. Test Data Management

-   **Sample Command Outputs:**
    *   Create a directory (e.g., `tests/sample_data/`) to store text files containing raw outputs from various FortiOS commands.
    *   These files will be read by unit tests for parsing functions.
    *   Obfuscate any sensitive information (IPs, hostnames if necessary, though realistic data is better for testing regex).
    *   Include examples of different output variations if known.

## 6. Running Tests

-   **Structure:**
    ```
    fortinet_collector/
    ├── tests/
    │   ├── __init__.py
    │   ├── unit/
    │   │   ├── __init__.py
    │   │   └── test_parsing.py
    │   │   └── ...
    │   ├── integration/
    │   │   ├── __init__.py
    │   │   └── test_db_handler.py
    │   │   └── ...
    │   └── sample_data/
    │       └── get_vdom_list_output.txt
    │       └── ...
    ├── fortinet_collector/ 
    │   └── ... (source code)
    └── pytest.ini (optional pytest configuration)
    ```
-   **Execution:**
    *   Install `pytest`: `pip install pytest`
    *   Run all tests from the root directory (`fortinet_collector/`): `pytest`
    *   Run specific test files or tests: `pytest tests/unit/test_parsing.py`

## 7. Continuous Integration (CI) - Future Consideration
-   Once tests are in place, integrating them into a CI pipeline (e.g., GitHub Actions) would automatically run tests on every code change, ensuring ongoing quality.

This testing strategy provides a solid foundation for building a reliable Fortinet data collector. The engineer should prioritize unit tests for parsing logic, as this is often the most complex and error-prone part.