#!/bin/bash
# postgres-db/scripts/import-data.sh

set -e

# Configuration
DB_HOST=${DB_HOST:-"supabase-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"fortinet_network_collector_dev"}
DB_USER=${DB_USER:-"postgres"}
IMPORT_FILE=${1:-"/exports/latest_export.sql"}
SCHEMA_FILE="/exports/schema.sql"

# Ensure PGPASSWORD is set for psql authentication
export PGPASSWORD=${PGPASSWORD}

echo "Starting database import with schema-first approach..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Schema file: $SCHEMA_FILE"
echo "Import file: $IMPORT_FILE"

# Check if import file exists
if [ ! -f "$IMPORT_FILE" ]; then
  echo "Error: Import file '$IMPORT_FILE' not found!"
  echo "Available files in /exports:"
  ls -la /exports/ || echo "No exports directory found"
  exit 1
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready. Starting import..."

# Create backup before import
BACKUP_FILE="/exports/backup_before_import_$(date +%Y%m%d_%H%M%S).sql"
echo "Creating backup before import: $BACKUP_FILE"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  --no-owner \
  --no-privileges \
  --insert \
  --column-inserts \
  --disable-triggers \
  --data-only \
  --table=firewalls \
  --table=vdoms \
  --table=interfaces \
  --table=routes \
  --table=vips \
  > "$BACKUP_FILE" || echo "Warning: Backup creation failed, continuing with import..."

# Step 1: Create schema first (if schema file exists)
if [ -f "$SCHEMA_FILE" ]; then
  echo "Creating database schema from: $SCHEMA_FILE"
  
  # Drop existing tables to ensure clean schema
  echo "Dropping existing tables..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    DROP TABLE IF EXISTS vips CASCADE;
    DROP TABLE IF EXISTS routes CASCADE;
    DROP TABLE IF EXISTS interfaces CASCADE;
    DROP TABLE IF EXISTS vdoms CASCADE;
    DROP TABLE IF EXISTS firewalls CASCADE;
  " || echo "Warning: Table dropping failed, continuing..."
  
  # Create schema
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    -v ON_ERROR_STOP=1 \
    -f "$SCHEMA_FILE"
  
  echo "Database schema created successfully!"
else
  echo "Warning: Schema file not found: $SCHEMA_FILE"
  echo "Clearing existing data in reverse dependency order..."
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
    DELETE FROM vips;
    DELETE FROM routes;
    DELETE FROM interfaces;
    DELETE FROM vdoms;
    DELETE FROM firewalls;
  " || echo "Warning: Data clearing failed, continuing with import..."
fi

# Step 2: Import data (foreign key dependencies handled by export order)
echo "Importing data from: $IMPORT_FILE"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 \
  -f "$IMPORT_FILE"

echo "Database import completed successfully!"
echo "Backup created: $BACKUP_FILE"
echo "Schema-first import process completed."