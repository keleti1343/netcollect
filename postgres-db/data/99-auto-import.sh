#!/bin/bash

# Auto-import script for PostgreSQL initialization
# This script runs after database initialization and imports data if available
# Uses schema-first approach to ensure tables exist before data import

set -e

echo "Checking for existing data to import..."

# Schema file location
SCHEMA_FILE="/docker-entrypoint-initdb.d/schema.sql"

# Check if export file exists (look for any export files)
LATEST_EXPORT=$(find /exports -name "export_data_*.sql" -type f 2>/dev/null | sort -r | head -n1)

if [ -n "$LATEST_EXPORT" ] && [ -f "$LATEST_EXPORT" ]; then
    echo "Found export file: $LATEST_EXPORT"
    echo "Starting schema-first import process..."
    
    # Step 1: Create schema first (if schema file exists)
    if [ -f "$SCHEMA_FILE" ]; then
        echo "Creating database schema from: $SCHEMA_FILE"
        
        if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < "$SCHEMA_FILE"; then
            echo "Database schema created successfully!"
        else
            echo "Database schema creation failed!"
            exit 1
        fi
    else
        echo "Warning: Schema file not found: $SCHEMA_FILE"
        echo "Proceeding with data import only (assuming schema exists)"
    fi
    
    # Step 2: Import the data
    echo "Importing data from: $LATEST_EXPORT"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < "$LATEST_EXPORT"
    
    echo "Schema-first data import completed successfully!"
else
    echo "No export file found in /exports directory."
    
    # If no export file but schema exists, create empty schema
    if [ -f "$SCHEMA_FILE" ]; then
        echo "Creating empty database schema from: $SCHEMA_FILE"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" < "$SCHEMA_FILE"
        echo "Empty database schema created successfully!"
    else
        echo "Starting with completely empty database."
    fi
fi

echo "Auto-import script completed."