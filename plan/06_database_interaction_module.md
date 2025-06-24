# Plan Step 6: Database Interaction Module (PostgreSQL)

This document outlines the design for the `postgres_handler.py` module, which will manage all interactions with the PostgreSQL database. This includes establishing connections, and inserting or updating (UPSERTing) data into the tables defined in `plan/02_database_schema_and_setup.md`.

## 1. Module Purpose and Location

-   **Purpose:** To provide a clean and centralized API for database operations, abstracting SQL queries and connection management from the core data collection logic. It will primarily use `psycopg2` for PostgreSQL communication.
-   **Location:** `fortinet_collector/db_utils/postgres_handler.py`

## 2. Database Connection Management

A class-based approach can be useful for managing the connection lifecycle, or standalone functions can be used. For simplicity, standalone functions are shown here, but a `DatabaseHandler` class could encapsulate `conn` and `cur`.

```python
# fortinet_collector/db_utils/postgres_handler.py
import psycopg2
from psycopg2 import sql
from psycopg2.extras import DictCursor # To get results as dictionaries
import logging
import datetime # For last_updated

logger = logging.getLogger(__name__)

# --- Database Connection Parameters (should be configurable) ---
# These would ideally come from a central configuration or environment variables
DB_CONFIG = {
    "dbname": "fortinet_data",
    "user": "your_db_user",
    "password": "your_db_password",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    """Establishes and returns a database connection."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        logger.info(f"Successfully connected to database '{DB_CONFIG['dbname']}' on {DB_CONFIG['host']}.")
        return conn
    except psycopg2.Error as e:
        logger.error(f"Error connecting to PostgreSQL database: {e}")
        raise # Re-raise to be handled by the caller

def close_db_connection(conn):
    """Closes the database connection."""
    if conn:
        conn.close()
        logger.info("Database connection closed.")

```

## 3. Core Data Handling (UPSERT) Functions

Each function will take parsed data (a dictionary), relevant foreign keys, and perform an UPSERT operation. They should return the primary key of the affected row.

**General UPSERT Strategy:**
Use `INSERT INTO ... ON CONFLICT (unique_constraint_columns) DO UPDATE SET ... RETURNING primary_key_column`. The `last_updated` column should always be set to `CURRENT_TIMESTAMP` on insert or update.

### `upsert_firewall(conn, firewall_data: dict) -> int | None:`
-   **`firewall_data` keys:** `fw_name`, `fw_ip`, `fmg_ip`, `faz_ip`, `site`.
-   **Unique Constraint:** `fw_name` or `fw_ip`. `fw_name` is often more stable if IPs can change. Let's use `fw_name`.
```python
# In fortinet_collector/db_utils/postgres_handler.py
def upsert_firewall(conn, firewall_data: dict) -> int | None:
    """Inserts or updates a firewall record. Returns firewall_id."""
    query = sql.SQL("""
        INSERT INTO firewalls (fw_name, fw_ip, fmg_ip, faz_ip, site, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (fw_name) DO UPDATE SET
            fw_ip = EXCLUDED.fw_ip,
            fmg_ip = EXCLUDED.fmg_ip,
            faz_ip = EXCLUDED.faz_ip,
            site = EXCLUDED.site,
            last_updated = EXCLUDED.last_updated
        RETURNING firewall_id;
    """)
    try:
        with conn.cursor() as cur:
            cur.execute(query, (
                firewall_data.get('fw_name'),
                firewall_data.get('fw_ip'),
                firewall_data.get('fmg_ip'),
                firewall_data.get('faz_ip'),
                firewall_data.get('site'),
                datetime.datetime.now(datetime.timezone.utc)
            ))
            firewall_id = cur.fetchone()[0]
            conn.commit()
            logger.debug(f"Upserted firewall '{firewall_data.get('fw_name')}', ID: {firewall_id}")
            return firewall_id
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Error upserting firewall '{firewall_data.get('fw_name')}': {e}")
    return None
```

### `upsert_vdom(conn, vdom_data: dict, firewall_id: int) -> int | None:`
-   **`vdom_data` keys:** `vdom_name`, `vdom_index`.
-   **Unique Constraint:** `(firewall_id, vdom_name)`.
```python
# In fortinet_collector/db_utils/postgres_handler.py
def upsert_vdom(conn, vdom_data: dict, firewall_id: int) -> int | None:
    """Inserts or updates a VDOM record. Returns vdom_id."""
    query = sql.SQL("""
        INSERT INTO vdoms (firewall_id, vdom_name, vdom_index, last_updated)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (firewall_id, vdom_name) DO UPDATE SET
            vdom_index = EXCLUDED.vdom_index,
            last_updated = EXCLUDED.last_updated
        RETURNING vdom_id;
    """)
    try:
        with conn.cursor() as cur:
            cur.execute(query, (
                firewall_id,
                vdom_data.get('vdom_name'),
                vdom_data.get('vdom_index'),
                datetime.datetime.now(datetime.timezone.utc)
            ))
            vdom_id = cur.fetchone()[0]
            conn.commit()
            logger.debug(f"Upserted VDOM '{vdom_data.get('vdom_name')}' for firewall ID {firewall_id}, VDOM ID: {vdom_id}")
            return vdom_id
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Error upserting VDOM '{vdom_data.get('vdom_name')}' for firewall ID {firewall_id}: {e}")
    return None
```

### `upsert_interface(conn, interface_data: dict, firewall_id: int, vdom_id: int | None) -> int | None:`
-   **`interface_data` keys:** `interface_name`, `ip_address`, `mask`, `type`, `vlan_id`, `description`, `status`, `physical_interface_name`.
-   **Unique Constraint:** `(firewall_id, vdom_id, interface_name)`. `vdom_id` can be NULL.
```python
# In fortinet_collector/db_utils/postgres_handler.py
def upsert_interface(conn, interface_data: dict, firewall_id: int, vdom_id: int | None) -> int | None:
    """Inserts or updates an interface record. Returns interface_id."""
    # Handle NULL vdom_id for unique constraint (COALESCE with a non-existent vdom_id like -1 or handle in SQL)
    # The schema's UNIQUE constraint (firewall_id, vdom_id, interface_name) handles NULLs correctly in PostgreSQL
    # (NULL is not equal to NULL for unique constraints).
    query = sql.SQL("""
        INSERT INTO interfaces (firewall_id, vdom_id, interface_name, ip_address, mask, type, 
                                vlan_id, description, status, physical_interface_name, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (firewall_id, vdom_id, interface_name) DO UPDATE SET
            ip_address = EXCLUDED.ip_address,
            mask = EXCLUDED.mask,
            type = EXCLUDED.type,
            vlan_id = EXCLUDED.vlan_id,
            description = EXCLUDED.description,
            status = EXCLUDED.status,
            physical_interface_name = EXCLUDED.physical_interface_name,
            last_updated = EXCLUDED.last_updated
        RETURNING interface_id;
    """)
    try:
        with conn.cursor() as cur:
            cur.execute(query, (
                firewall_id,
                vdom_id, # Can be None
                interface_data.get('interface_name'),
                interface_data.get('ip_address'),
                interface_data.get('mask'),
                interface_data.get('type'),
                interface_data.get('vlan_id'),
                interface_data.get('description'),
                interface_data.get('status'),
                interface_data.get('physical_interface_name'),
                datetime.datetime.now(datetime.timezone.utc)
            ))
            interface_id = cur.fetchone()[0]
            conn.commit()
            logger.debug(f"Upserted interface '{interface_data.get('interface_name')}', ID: {interface_id}")
            return interface_id
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Error upserting interface '{interface_data.get('interface_name')}': {e}")
    return None
```

### `upsert_route(conn, route_data: dict, vdom_id: int) -> int | None:`
-   **`route_data` keys:** `destination_network`, `mask_length`, `route_type`, `gateway`, `exit_interface_name`, `exit_interface_details`.
-   **Unique Constraint:** `(vdom_id, destination_network, mask_length, gateway, route_type, exit_interface_name)`. This was noted as potentially too strict. For UPSERT, we need a reliable way to identify a route. If `gateway` can be NULL, the constraint needs to handle it or be defined on non-NULL columns. A common approach is to use a subset of fields that truly define uniqueness for an update.
    Let's assume for now the unique constraint `uq_vdom_route` from the schema is `(vdom_id, destination_network, mask_length, COALESCE(gateway, 'N/A'), route_type, exit_interface_name)` or similar if gateway can be null.
    For simplicity in the Python code, we'll rely on the DB constraint. If it's too complex, the application might need to query first then update/insert.
```python
# In fortinet_collector/db_utils/postgres_handler.py
def upsert_route(conn, route_data: dict, vdom_id: int) -> int | None:
    """Inserts or updates a route record. Returns route_id."""
    # The unique constraint for routes is complex. 
    # For ON CONFLICT, the columns in the constraint must be specified.
    # Assuming a constraint named 'uq_vdom_route_key' on (vdom_id, destination_network, mask_length, route_type, exit_interface_name, COALESCE(gateway,''))
    # This requires the constraint to be defined carefully in the DB.
    # If gateway is part of the key and can be NULL, COALESCE is needed in the constraint definition.
    # For this example, let's use a simplified key for ON CONFLICT, assuming the DB schema handles the full uniqueness.
    # A more robust way might be to query for existence first if ON CONFLICT becomes too complex.
    
    # Simplified ON CONFLICT target for example purposes: (vdom_id, destination_network, mask_length, route_type, exit_interface_name)
    # This means if gateway changes for such a route, it would be an UPDATE.
    # The actual columns in ON CONFLICT target must match a unique index.
    
    query = sql.SQL("""
        INSERT INTO routes (vdom_id, destination_network, mask_length, route_type, gateway, 
                            exit_interface_name, exit_interface_details, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (vdom_id, destination_network, mask_length, route_type, exit_interface_name) -- Adjust this to match your actual unique index
        DO UPDATE SET
            gateway = EXCLUDED.gateway,
            exit_interface_details = EXCLUDED.exit_interface_details,
            last_updated = EXCLUDED.last_updated
        RETURNING route_id;
    """)
    # If your unique index includes COALESCE(gateway, 'some_default_for_null'), reflect that in ON CONFLICT.
    # Example: ON CONFLICT (vdom_id, destination_network, mask_length, route_type, exit_interface_name, COALESCE(gateway, 'N/A_GW'))
    # This is highly dependent on the exact unique index created on the 'routes' table.
    # The schema in plan 02 did not specify a unique constraint for routes due to this complexity.
    # For now, let's assume a simpler unique key for the ON CONFLICT example.
    # A common pattern if ON CONFLICT is hard: try update, if 0 rows affected, then insert. Or try insert, on unique violation, then update.

    # Given no unique constraint was defined in schema for routes, a simple INSERT is shown.
    # UPSERT logic would require a defined unique constraint.
    # For now, this will just insert. The main script would need to manage deletions or updates separately.
    # To implement true UPSERT, a unique constraint on `routes` is essential.
    # Let's assume we add one: CONSTRAINT uq_routes (vdom_id, destination_network, mask_length, route_type, exit_interface_name, COALESCE(gateway,'_NULL_GW_'))
    
    # Reverting to a simple insert for now, as UPSERT without a clear unique key is problematic.
    # The main loop will need to clear old routes for a VDOM before inserting new ones.
    # OR, define a robust unique key for routes.
    # For the sake of this plan, let's assume a unique key and proceed with UPSERT.
    # The unique key used in ON CONFLICT must exist.
    # Let's use (vdom_id, destination_network, mask_length, route_type, exit_interface_name) as a hypothetical unique key for the example.
    # The engineer must ensure such a unique index exists.

    try:
        with conn.cursor() as cur:
            cur.execute(query, (
                vdom_id,
                route_data.get('destination_network'),
                route_data.get('mask_length'),
                route_data.get('route_type'),
                route_data.get('gateway'),
                route_data.get('exit_interface_name'),
                route_data.get('exit_interface_details'),
                datetime.datetime.now(datetime.timezone.utc)
            ))
            route_id = cur.fetchone()[0]
            conn.commit()
            logger.debug(f"Upserted route for VDOM ID {vdom_id} to {route_data.get('destination_network')}/{route_data.get('mask_length')}, Route ID: {route_id}")
            return route_id
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Error upserting route for VDOM ID {vdom_id} to {route_data.get('destination_network')}: {e}")
    return None

```

### `upsert_vip(conn, vip_data: dict, vdom_id: int) -> int | None:`
-   **`vip_data` keys:** `vip_name`, `external_ip`, `external_port`, `mapped_ip`, `mapped_port`, `vip_type`, `external_interface`, `comment`.
-   **Unique Constraint:** `(vdom_id, vip_name)`.
```python
# In fortinet_collector/db_utils/postgres_handler.py
def upsert_vip(conn, vip_data: dict, vdom_id: int) -> int | None:
    """Inserts or updates a VIP record. Returns vip_id."""
    query = sql.SQL("""
        INSERT INTO vips (vdom_id, vip_name, external_ip, external_port, mapped_ip, mapped_port, 
                          vip_type, external_interface, comment, last_updated)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (vdom_id, vip_name) DO UPDATE SET
            external_ip = EXCLUDED.external_ip,
            external_port = EXCLUDED.external_port,
            mapped_ip = EXCLUDED.mapped_ip,
            mapped_port = EXCLUDED.mapped_port,
            vip_type = EXCLUDED.vip_type,
            external_interface = EXCLUDED.external_interface,
            comment = EXCLUDED.comment,
            last_updated = EXCLUDED.last_updated
        RETURNING vip_id;
    """)
    try:
        with conn.cursor() as cur:
            cur.execute(query, (
                vdom_id,
                vip_data.get('vip_name'),
                vip_data.get('external_ip'),
                vip_data.get('external_port'),
                vip_data.get('mapped_ip'),
                vip_data.get('mapped_port'),
                vip_data.get('vip_type'),
                vip_data.get('external_interface'),
                vip_data.get('comment'),
                datetime.datetime.now(datetime.timezone.utc)
            ))
            vip_id = cur.fetchone()[0]
            conn.commit()
            logger.debug(f"Upserted VIP '{vip_data.get('vip_name')}' for VDOM ID {vdom_id}, VIP ID: {vip_id}")
            return vip_id
    except psycopg2.Error as e:
        conn.rollback()
        logger.error(f"Error upserting VIP '{vip_data.get('vip_name')}' for VDOM ID {vdom_id}: {e}")
    return None
```

## 4. Transaction Management

-   Each UPSERT function currently manages its own transaction (`conn.commit()`, `conn.rollback()`).
-   For a series of operations related to a single firewall, it might be beneficial to wrap them in a larger transaction managed by the main orchestration script. This ensures that if one part of collecting data for a firewall fails and can't be written, other parts aren't partially committed.
    -   If this approach is taken, the individual UPSERT functions should not call `conn.commit()` or `conn.rollback()`. The caller (e.g., `main.py`) would manage the transaction. For now, per-function commit is simpler to implement initially.

## 5. Data Deletion Strategy (Stale Data)

The current UPSERT strategy updates existing records and inserts new ones. It does not automatically delete records from the database that are no longer present on the Fortinet device.
Options for handling stale data:
1.  **Timestamp-based cleanup:** Periodically delete records from tables where `last_updated` is older than a certain threshold AND the parent device was successfully polled more recently (but the specific record wasn't updated). This is complex.
2.  **Per-device full refresh:** Before inserting/updating data for a specific firewall (or VDOM), delete all existing records related to that firewall (or VDOM) for the specific data types being refreshed.
    -   Example: Before processing routes for `vdom_X`, `DELETE FROM routes WHERE vdom_id = (SELECT vdom_id FROM vdoms WHERE vdom_name = 'vdom_X' AND firewall_id = current_firewall_id);`
    -   This is simpler but means data temporarily disappears during the refresh.
    -   This requires careful use of `ON DELETE CASCADE` or manual deletion in the correct order.
3.  **Soft Deletes:** Add an `is_active` boolean column to tables. Mark records as inactive if not found in the latest poll, instead of deleting. Query only for active records.

For this phase, the plan focuses on UPSERT. A deletion strategy for stale data can be a future enhancement or decided upon by the engineer. Option 2 (Per-device full refresh for sub-items like routes/VIPs within a VDOM) is often a practical starting point.

## 6. Dependencies

-   `psycopg2-binary`
-   `logging` (standard Python library)
-   `datetime` (standard Python library)

This module will be the backbone for data persistence. Careful implementation of SQL queries and error handling is crucial. The `ON CONFLICT` target columns for UPSERTs must precisely match existing unique constraints on the tables.