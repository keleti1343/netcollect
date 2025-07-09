#!/bin/bash
# postgres-db/scripts/export-data.sh

set -e

# Configuration
DB_HOST=${DB_HOST:-"supabase-db"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"fortinet_network_collector_dev"}
DB_USER=${DB_USER:-"postgres"}
EXPORT_FILE=${EXPORT_FILE:-"/exports/export_data_$(date +%Y%m%d_%H%M%S).sql"}

# Ensure PGPASSWORD is set for pg_dump authentication
export PGPASSWORD=${PGPASSWORD}

echo "Starting database export..."
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "Export file: $EXPORT_FILE"

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready. Starting export..."

# Export with proper order to handle foreign key dependencies (per guidelines)
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
  > "$EXPORT_FILE"

echo "Database export completed successfully!"
echo "Export file: $EXPORT_FILE"
echo "File size: $(du -h "$EXPORT_FILE" | cut -f1)"

# Create a symlink to the latest export
ln -sf "$(basename "$EXPORT_FILE")" "/exports/latest_export.sql"
echo "Latest export symlink created: /exports/latest_export.sql"