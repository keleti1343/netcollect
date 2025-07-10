# Database Initialization Guide for Fortinet Network Collector

This guide provides instructions for properly initializing the PostgreSQL database for the Fortinet Network Collector application. It addresses the specific issue where the "firewalls" relation does not exist, which causes API failures.

## Problem Analysis

From the error logs, we identified a critical database initialization issue:

```
fortinet-api-1    | psycopg2.errors.UndefinedTable: relation "firewalls" does not exist
fortinet-api-1    | LINE 3: FROM firewalls) AS anon_1
```

This error occurs because:
1. The database container starts successfully
2. The schema.sql file is not being applied
3. The API container starts and attempts to query non-existent tables

## Solution Approach

To resolve this issue, we need to ensure that:
1. The database schema is properly defined
2. The schema is applied to the database before the API starts
3. Permissions are correctly set for the database files
4. Any necessary migrations are run

## Step-by-Step Database Initialization

### 1. Verify Schema File

First, ensure that the database schema file (`postgres-db/data/schema.sql`) exists and contains all required table definitions:

```bash
# Check if schema file exists
ls -la postgres-db/data/schema.sql

# View schema file content to verify it contains all required tables
cat postgres-db/data/schema.sql
```

The schema file should contain definitions for at least the following tables:
- firewalls
- vdoms
- interfaces
- routes
- vips

If the schema file is missing or incomplete, you can manually create it based on the model definitions in the API code.

### 2. Create a Database Initialization Script

Create a script called `init-db.sh` in the project root directory:

```bash
#!/bin/bash
# Database initialization script for Fortinet Network Collector

set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready (max 60 seconds)
echo "Waiting for PostgreSQL to start..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt+1))
    echo "Attempt $attempt/$max_attempts..."
    
    if docker-compose exec -T postgres-db pg_isready -U postgres; then
        echo "PostgreSQL is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Error: PostgreSQL not ready after $max_attempts attempts"
        exit 1
    fi
    
    echo "Waiting for PostgreSQL to start (attempt $attempt/$max_attempts)..."
    sleep 2
done

# Check if database already has tables
echo "Checking if database tables already exist..."
if docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -c "\dt" | grep -q "firewalls"; then
    echo "Database tables already exist, skipping initialization"
    exit 0
fi

# Apply schema from schema.sql
echo "Applying database schema..."
if [ -f "postgres-db/data/schema.sql" ]; then
    docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -f /docker-entrypoint-initdb.d/schema.sql
    echo "Database schema applied successfully!"
else
    echo "Error: Schema file postgres-db/data/schema.sql not found!"
    exit 1
fi

# Verify tables were created
echo "Verifying database tables..."
if docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -c "\dt" | grep -q "firewalls"; then
    echo "Tables verified successfully!"
else
    echo "Error: Tables not created properly. Check schema file and PostgreSQL logs."
    exit 1
fi

echo "Database initialization completed successfully!"
```

Make this script executable:

```bash
chmod +x init-db.sh
```

### 3. Modify Database Configuration for Auto-Import

Ensure that the PostgreSQL container is set up to auto-import the schema. Create or modify `postgres-db/data/01-init-schema.sh`:

```bash
#!/bin/bash
# PostgreSQL initialization script for schema creation

set -e

echo "=== Starting Database Schema Initialization ==="

# Get database name from environment or use default
DB_NAME=${POSTGRES_DB:-fortinet_network_collector}

# Check if schema file exists
SCHEMA_FILE="/docker-entrypoint-initdb.d/schema.sql"
if [ -f "$SCHEMA_FILE" ]; then
    echo "Found schema file: $SCHEMA_FILE"
    
    # Check if the database already has tables
    echo "Checking if database tables already exist..."
    if psql -U "$POSTGRES_USER" -d "$DB_NAME" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
        echo "Database tables already exist, skipping schema creation"
    else
        echo "Creating database schema from $SCHEMA_FILE..."
        psql -U "$POSTGRES_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"
        echo "Database schema created successfully!"
    fi
else
    echo "Warning: Schema file not found: $SCHEMA_FILE"
    echo "Database will be created without schema"
fi

echo "=== Database Schema Initialization Completed ==="
```

Make this script executable:

```bash
chmod +x postgres-db/data/01-init-schema.sh
```

### 4. Database Permissions Setup

To ensure proper permissions for database files:

```bash
# Create data directory if it doesn't exist
mkdir -p ./data/postgres

# Set proper ownership (PostgreSQL typically runs as user 999)
sudo chown -R 999:999 ./data/postgres
```

### 5. Alternative: Using Alembic Migrations

If the Fortinet API uses Alembic for database migrations, you can set up the database using migrations instead of direct schema application:

```bash
# Check if alembic directory exists
if [ -d "fortinet-api/alembic" ]; then
    echo "Alembic migrations found. Running migrations..."
    
    # Run migrations through the API container
    docker-compose exec -T fortinet-api-1 alembic upgrade head
    
    echo "Migrations completed!"
else
    echo "No Alembic migrations found. Using schema.sql for initialization."
    # (Apply schema.sql as described above)
fi
```

### 6. Automated Verification and Repair

Create a database verification script called `verify-db.sh`:

```bash
#!/bin/bash
# Database verification and repair script

set -e

echo "Starting database verification..."

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! docker-compose exec -T postgres-db pg_isready -U postgres; then
    echo "Error: PostgreSQL is not running"
    exit 1
fi

# Check if database exists
echo "Checking database existence..."
if ! docker-compose exec -T postgres-db psql -U postgres -lqt | cut -d \| -f 1 | grep -qw ${POSTGRES_DB:-fortinet_network_collector}; then
    echo "Error: Database '${POSTGRES_DB:-fortinet_network_collector}' does not exist"
    exit 1
fi

# Check if tables exist
echo "Checking table existence..."
if ! docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -c "\dt" | grep -q "firewalls"; then
    echo "Warning: Required tables not found. Attempting to repair..."
    
    # Apply schema
    if [ -f "postgres-db/data/schema.sql" ]; then
        echo "Applying schema from schema.sql..."
        docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -f /docker-entrypoint-initdb.d/schema.sql
        echo "Schema applied!"
    else
        echo "Error: Cannot repair database - schema.sql not found"
        exit 1
    fi
else
    echo "All required tables exist!"
fi

# Count records in tables
echo "Checking table content..."
docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB:-fortinet_network_collector} -c "
SELECT 
    'firewalls' as table_name, COUNT(*) as record_count FROM firewalls
UNION ALL
SELECT 
    'vdoms' as table_name, COUNT(*) as record_count FROM vdoms
UNION ALL
SELECT 
    'interfaces' as table_name, COUNT(*) as record_count FROM interfaces
UNION ALL
SELECT 
    'routes' as table_name, COUNT(*) as record_count FROM routes
UNION ALL
SELECT 
    'vips' as table_name, COUNT(*) as record_count FROM vips
ORDER BY table_name;
"

echo "Database verification completed!"
```

Make this script executable:

```bash
chmod +x verify-db.sh
```

## Integration with Deployment Process

To integrate database initialization with the deployment process:

1. **Add a step in deploy.sh** to run the `init-db.sh` script after the database container starts and before the API containers start:

```bash
# In the deploy_production function of deploy.sh

# Start database and cache first
log_info "Starting database and cache services..."
$DOCKER_COMPOSE $COMPOSE_FILES up -d postgres-db redis

# Wait for services to be ready
log_info "Waiting for database to be ready..."
sleep 10

# Initialize database
log_info "Initializing database..."
./init-db.sh

# Start API services
log_info "Starting API services..."
$DOCKER_COMPOSE $COMPOSE_FILES up -d fortinet-api-1 fortinet-api-2
```

2. **Add a dependency to docker-compose.yml** to ensure the API containers don't start until the database is ready:

```yaml
fortinet-api-1:
  # existing configuration...
  depends_on:
    postgres-db:
      condition: service_healthy
    redis:
      condition: service_healthy
```

3. **Improve the healthcheck** for the database container:

```yaml
postgres-db:
  # existing configuration...
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d ${POSTGRES_DB:-fortinet_network_collector}"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s
```

## Troubleshooting Database Issues

If you still encounter database initialization issues:

1. **Check container logs**:
   ```bash
   docker-compose logs postgres-db
   ```

2. **Verify database existence**:
   ```bash
   docker-compose exec postgres-db psql -U postgres -c "\l"
   ```

3. **Verify table existence**:
   ```bash
   docker-compose exec postgres-db psql -U postgres -d ${POSTGRES_DB} -c "\dt"
   ```

4. **Check schema file**:
   ```bash
   cat postgres-db/data/schema.sql
   ```

5. **Check PostgreSQL data directory permissions**:
   ```bash
   ls -la ./data/postgres
   ```

6. **Manual schema application**:
   ```bash
   docker-compose exec postgres-db psql -U postgres -d ${POSTGRES_DB} -f /docker-entrypoint-initdb.d/schema.sql
   ```

7. **Recreate database from scratch**:
   ```bash
   # Stop all containers
   docker-compose down

   # Remove database volume
   docker volume rm fortinet-postgres-data

   # Recreate data directory with proper permissions
   mkdir -p ./data/postgres
   sudo chown -R 999:999 ./data/postgres

   # Restart deployment
   ./deploy.sh production deploy
   ```

By following these steps, you can ensure that the database is properly initialized with all required tables before the API attempts to access them, resolving the "relation firewalls does not exist" error.