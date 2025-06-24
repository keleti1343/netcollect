# Plan Step 2: Database Schema and Setup (PostgreSQL)

This document details the PostgreSQL database schema for storing data collected from Fortinet devices and provides guidance on setting up the database tables.

## 1. Entity Relationship Diagram (ERD)

The following diagram illustrates the relationships between the tables:

```mermaid
erDiagram
    firewalls {
        INTEGER firewall_id PK "Serial primary key"
        TEXT fw_name TEXT UK "Firewall hostname, unique"
        TEXT fw_ip TEXT UK "Management IP, unique"
        TEXT fmg_ip TEXT NULLABLE "FortiManager IP"
        TEXT faz_ip TEXT NULLABLE "FortiAnalyzer IP"
        TEXT site TEXT NULLABLE "Site/Location tag"
        TIMESTAMP last_updated "Timestamp of the last update for this record"
    }

    vdoms {
        INTEGER vdom_id PK "Serial primary key"
        INTEGER firewall_id FK "Foreign key referencing firewalls.firewall_id"
        TEXT vdom_name TEXT "VDOM name"
        INTEGER vdom_index INTEGER NULLABLE "VDOM index if available"
        TIMESTAMP last_updated "Timestamp of the last update for this record"
        CONSTRAINT uq_firewall_vdom UNIQUE (firewall_id, vdom_name)
    }

    interfaces {
        INTEGER interface_id PK "Serial primary key"
        INTEGER firewall_id FK "Foreign key referencing firewalls.firewall_id"
        INTEGER vdom_id FK NULLABLE "Foreign key referencing vdoms.vdom_id (nullable for global interfaces)"
        TEXT interface_name TEXT "Name of the interface"
        TEXT ip_address TEXT NULLABLE "IP address of the interface"
        TEXT mask TEXT NULLABLE "Subnet mask of the interface"
        TEXT type TEXT "Type of interface (e.g., vlan, loopback, tunnel, physical, aggregate)"
        INTEGER vlan_id INTEGER NULLABLE "VLAN ID if applicable"
        TEXT description TEXT NULLABLE "Interface description"
        TEXT status TEXT NULLABLE "Interface status (e.g., up, down)"
        TEXT physical_interface_name TEXT NULLABLE "For tunnels or VLANs, the underlying physical interface"
        TIMESTAMP last_updated "Timestamp of the last update for this record"
        CONSTRAINT uq_firewall_vdom_interface UNIQUE (firewall_id, vdom_id, interface_name)
    }

    routes {
        INTEGER route_id PK "Serial primary key"
        INTEGER vdom_id FK "Foreign key referencing vdoms.vdom_id"
        TEXT destination_network TEXT "Destination IP network (e.g., 192.168.1.0)"
        INTEGER mask_length INTEGER "CIDR prefix length (e.g., 24 for /24)"
        TEXT route_type TEXT "Type of route (e.g., connected, static, BGP, FIB)"
        TEXT gateway TEXT NULLABLE "Gateway IP address"
        TEXT exit_interface_name TEXT "Name of the exit interface"
        TEXT exit_interface_details TEXT NULLABLE "Additional context/description for the exit interface"
        TIMESTAMP last_updated "Timestamp of the last update for this record"
        --CONSTRAINT uq_vdom_route UNIQUE (vdom_id, destination_network, mask_length, gateway, route_type, exit_interface_name)
    }

    vips {
        INTEGER vip_id PK "Serial primary key"
        INTEGER vdom_id FK "Foreign key referencing vdoms.vdom_id"
        TEXT external_ip TEXT "External IP address of the VIP"
        INTEGER external_port INTEGER NULLABLE "External port for the VIP"
        TEXT mapped_ip TEXT "Mapped (internal) IP address"
        INTEGER mapped_port INTEGER NULLABLE "Mapped (internal) port"
        TEXT vip_type TEXT "Type of VIP (e.g., vip_interface, virtual_server, static-nat)"
        TEXT external_interface TEXT NULLABLE "External interface associated with the VIP"
        TIMESTAMP last_updated "Timestamp of the last update for this record"
        mask INTEGER NULLABLE "Subnet Mask"
    }

    firewalls ||--o{ vdoms : "has"
    firewalls ||--o{ interfaces : "has (global interfaces)"
    vdoms ||--o{ interfaces : "can have (VDOM-specific interfaces)"
    vdoms ||--o{ routes : "has"
    vdoms ||--o{ vips : "has"
```

## 2. PostgreSQL Table Definitions

Below are the `CREATE TABLE` statements for the PostgreSQL database.

```sql
-- Table: firewalls
CREATE TABLE IF NOT EXISTS firewalls (
    firewall_id SERIAL PRIMARY KEY,
    fw_name TEXT UNIQUE NOT NULL,
    fw_ip TEXT UNIQUE NOT NULL,
    fmg_ip TEXT,
    faz_ip TEXT,
    site TEXT,
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: vdoms
CREATE TABLE IF NOT EXISTS vdoms (
    vdom_id SERIAL PRIMARY KEY,
    firewall_id INTEGER NOT NULL REFERENCES firewalls(firewall_id) ON DELETE CASCADE,
    vdom_name TEXT NOT NULL,
    vdom_index INTEGER,
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_firewall_vdom UNIQUE (firewall_id, vdom_name)
);

-- Table: interfaces
CREATE TABLE IF NOT EXISTS interfaces (
    interface_id SERIAL PRIMARY KEY,
    firewall_id INTEGER NOT NULL REFERENCES firewalls(firewall_id) ON DELETE CASCADE,
    vdom_id INTEGER REFERENCES vdoms(vdom_id) ON DELETE CASCADE, -- Nullable for global interfaces
    interface_name TEXT NOT NULL,
    ip_address TEXT,
    mask TEXT,
    type TEXT NOT NULL, -- e.g., vlan, loopback, tunnel, physical, aggregate
    vlan_id INTEGER,
    description TEXT,
    status TEXT,
    physical_interface_name TEXT, -- For tunnels, underlying interface, or member of aggregate
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    CONSTRAINT uq_firewall_vdom_interface UNIQUE (firewall_id, vdom_id, interface_name)
);

-- Table: routes
CREATE TABLE IF NOT EXISTS routes (
    route_id SERIAL PRIMARY KEY,
    vdom_id INTEGER NOT NULL REFERENCES vdoms(vdom_id) ON DELETE CASCADE,
    destination_network TEXT NOT NULL,
    mask_length INTEGER NOT NULL, -- e.g., 24 for /24
    route_type TEXT NOT NULL, -- e.g., connected, static, BGP, FIB
    gateway TEXT,
    exit_interface_name TEXT NOT NULL,
    exit_interface_details TEXT,
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- A more specific unique constraint might be needed depending on data granularity
    -- For now, relying on application logic for UPSERTs.
    -- CONSTRAINT uq_vdom_route UNIQUE (vdom_id, destination_network, mask_length, gateway, route_type, exit_interface_name) -- This might be too strict if other fields vary
);

-- Table: vips
CREATE TABLE IF NOT EXISTS vips (
    vip_id SERIAL PRIMARY KEY,
    vdom_id INTEGER NOT NULL REFERENCES vdoms(vdom_id) ON DELETE CASCADE,
    external_ip TEXT NOT NULL,
    external_port INTEGER,
    mapped_ip TEXT NOT NULL,
    mapped_port INTEGER,
    vip_type TEXT, -- e.g., vip_interface, virtual_server, static-nat
    external_interface TEXT,
    mask INTEGER,
    last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Indexes for frequently queried columns (foreign keys are often indexed automatically)
CREATE INDEX IF NOT EXISTS idx_vdoms_firewall_id ON vdoms(firewall_id);
CREATE INDEX IF NOT EXISTS idx_interfaces_firewall_id ON interfaces(firewall_id);
CREATE INDEX IF NOT EXISTS idx_interfaces_vdom_id ON interfaces(vdom_id);
CREATE INDEX IF NOT EXISTS idx_routes_vdom_id ON routes(vdom_id);
CREATE INDEX IF NOT EXISTS idx_vips_vdom_id ON vips(vdom_id);
```

**Notes on Table Design:**

*   `SERIAL PRIMARY KEY`: Auto-incrementing integer for primary keys.
*   `ON DELETE CASCADE`: If a firewall is deleted, its associated VDOMs, interfaces, routes, and VIPs will also be deleted.
*   `last_updated`: This column should be updated by the application logic whenever a record is inserted or modified.
*   **Uniqueness for `routes`:** The unique constraint for the `routes` table (`uq_vdom_route`) is commented out as it might be too restrictive. FortiOS can have multiple routes to the same destination with different metrics or priorities if not distinguished by other fields captured. UPSERT logic in the application will need to carefully define how to identify existing routes for updates.
*   `interfaces.vdom_id` is nullable because some interfaces (like physical ports before VDOM assignment or global system interfaces) might not be directly tied to a VDOM in the context they are initially queried.

## 3. Database Setup Script (Python Example)

This Python script uses `psycopg2` to connect to a PostgreSQL database and create the tables defined above. The engineer will need to adapt connection parameters.

```python
# fortinet_collector/db_utils/create_tables.py
import psycopg2
from psycopg2 import sql

# --- Database Connection Parameters ---
# These should ideally be sourced from a configuration file or environment variables
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "55322"

TABLE_DEFINITIONS = [
    """
    CREATE TABLE IF NOT EXISTS firewalls (
        firewall_id SERIAL PRIMARY KEY,
        fw_name TEXT UNIQUE NOT NULL,
        fw_ip TEXT UNIQUE NOT NULL,
        fmg_ip TEXT,
        faz_ip TEXT,
        site TEXT,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS vdoms (
        vdom_id SERIAL PRIMARY KEY,
        firewall_id INTEGER NOT NULL REFERENCES firewalls(firewall_id) ON DELETE CASCADE,
        vdom_name TEXT NOT NULL,
        vdom_index INTEGER,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_firewall_vdom UNIQUE (firewall_id, vdom_name)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS interfaces (
        interface_id SERIAL PRIMARY KEY,
        firewall_id INTEGER NOT NULL REFERENCES firewalls(firewall_id) ON DELETE CASCADE,
        vdom_id INTEGER REFERENCES vdoms(vdom_id) ON DELETE CASCADE, -- Nullable for global interfaces
        interface_name TEXT NOT NULL,
        ip_address TEXT,
        mask TEXT,
        type TEXT NOT NULL, -- e.g., vlan, loopback, tunnel, physical, aggregate
        vlan_id INTEGER,
        description TEXT,
        status TEXT,
        physical_interface_name TEXT,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS routes (
        route_id SERIAL PRIMARY KEY,
        vdom_id INTEGER NOT NULL REFERENCES vdoms(vdom_id) ON DELETE CASCADE,
        destination_network TEXT NOT NULL,
        mask_length INTEGER NOT NULL, -- e.g., 24 for /24
        route_type TEXT NOT NULL, -- e.g., connected, static, BGP, FIB
        gateway TEXT,
        exit_interface_name TEXT NOT NULL,
        exit_interface_details TEXT,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS vips (
        vip_id SERIAL PRIMARY KEY,
        vdom_id INTEGER NOT NULL REFERENCES vdoms(vdom_id) ON DELETE CASCADE,
        external_ip TEXT NOT NULL,
        external_port INTEGER,
        mapped_ip TEXT NOT NULL,
        mapped_port INTEGER,
        vip_type TEXT, -- e.g., vip_interface, virtual_server, static-nat
        external_interface TEXT,
        mask INTEGER,
        last_updated TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    "CREATE INDEX IF NOT EXISTS idx_vdoms_firewall_id ON vdoms(firewall_id);",
    "CREATE INDEX IF NOT EXISTS idx_interfaces_firewall_id ON interfaces(firewall_id);",
    "CREATE INDEX IF NOT EXISTS idx_interfaces_vdom_id ON interfaces(vdom_id);",
    "CREATE INDEX IF NOT EXISTS idx_routes_vdom_id ON routes(vdom_id);",
    "CREATE INDEX IF NOT EXISTS idx_vips_vdom_id ON vips(vdom_id);"
]

def create_database_if_not_exists():
    conn = None
    try:
        # Connect to the default 'postgres' database to create the target database
        conn = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Check if the database exists
        cur.execute(sql.SQL("SELECT 1 FROM pg_database WHERE datname = %s"), (DB_NAME,))
        exists = cur.fetchone()
        
        if not exists:
            cur.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME)))
            print(f"Database '{DB_NAME}' created successfully.")
        else:
            print(f"Database '{DB_NAME}' already exists.")
            
        cur.close()
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL or creating database: {e}")
    finally:
        if conn:
            conn.close()

def create_tables():
    conn = None
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
        cur = conn.cursor()
        for table_sql in TABLE_DEFINITIONS:
            cur.execute(table_sql)
        conn.commit()
        cur.close()
        print("Tables created successfully (if they didn't exist).")
    except psycopg2.Error as e:
        print(f"Error creating tables: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_database_if_not_exists() # Ensure database exists first
    create_tables()                 # Then create tables in that database
```

**Instructions for the Engineer:**

1.  Ensure PostgreSQL server is running.
2.  Create a database user (e.g., `your_db_user`) with privileges to create databases and tables, or use an existing superuser for initial setup.
3.  Update the `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` variables in the script.
4.  Run the Python script: `python fortinet_collector/db_utils/create_tables.py`.

This script will first attempt to create the database if it doesn't exist and then create the necessary tables.