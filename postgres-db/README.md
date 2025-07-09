# PostgreSQL Database Management

This directory contains PostgreSQL database management utilities for the Fortinet Network Collector project.

## Overview

The database management system provides:
- **Schema-First Import**: Ensures reliable imports by creating schema before data
- **Manual export**: On-demand database backup to SQL files
- **Automatic import**: Restores data when database containers are recreated
- **Safe storage**: Exports are stored outside containers in the `exports/` directory
- **Security**: All operations use environment variables for authentication

## Directory Structure

```
postgres-db/
├── data/
│   ├── create_tables.sql      # Complete database schema with sample data
│   ├── schema.sql             # Schema-only file (tables, indexes, constraints)
│   ├── sample-data.sql        # Sample data for testing
│   └── 99-auto-import.sh      # Auto-import script for initialization
├── scripts/
│   ├── export-data.sh         # Export database data
│   └── import-data.sh         # Import database data with schema-first approach
├── exports/                   # Export files storage (outside containers)
└── README.md                  # This file
```

## Schema-First Import Strategy

The database management system now uses a **schema-first approach** to ensure reliable imports:

1. **Schema Creation**: Creates tables, indexes, and constraints first from `schema.sql`
2. **Data Import**: Imports data into existing table structure
3. **Dependency Handling**: Respects foreign key relationships throughout

This approach prevents the critical issue where data-only exports fail to import due to missing table structures.

### Key Files

- **`schema.sql`**: Contains only table definitions, indexes, and constraints (no data)
- **`create_tables.sql`**: Complete schema with sample data for development
- **`sample-data.sql`**: Test data matching actual table structure

## Database Management Scripts

### Export Data (`scripts/export-data.sh`)

Exports database data to a timestamped SQL file with proper foreign key dependency handling.

**Features:**
- Exports data in correct order to respect foreign key constraints
- Creates timestamped export files
- Maintains a symlink to the latest export
- Includes proper PostgreSQL settings for reliable import
- Data-only export (schema handled separately)

**Usage:**
```bash
# Using Docker Compose (recommended)
docker-compose --profile management up db-manager
docker exec fortinet-db-manager /scripts/export-data.sh

# Direct execution (if running locally)
./scripts/export-data.sh
```

**Output:**
- Creates `/exports/export_data_YYYYMMDD_HHMMSS.sql`
- Updates `/exports/latest_export.sql` symlink

### Import Data (`scripts/import-data.sh`)

Imports database data using the schema-first approach with automatic backup creation.

**Features:**
- **Schema-First Import**: Creates schema before importing data
- Creates backup before import
- Drops and recreates tables for clean import
- Imports data respecting foreign key constraints
- Error handling and status reporting
- Fallback to data-only import if schema file unavailable

**Usage:**
```bash
# Using Docker Compose (recommended)
docker-compose --profile management up db-manager
docker exec fortinet-db-manager /scripts/import-data.sh [export_file]

# Direct execution (if running locally)
./scripts/import-data.sh [export_file]
```

**Parameters:**
- `export_file` (optional): Path to export file. If not provided, uses latest export.

**Schema-First Import Process:**
1. **Backup**: Creates backup of existing data
2. **Schema**: Drops existing tables and recreates from `schema.sql`
3. **Data**: Imports data from export file in dependency order
4. **Verify**: Reports success/failure

### Auto-Import (`data/99-auto-import.sh`)

Automatically runs during PostgreSQL initialization using schema-first approach.

**Features:**
- Runs automatically when database container starts
- Uses schema-first import strategy
- Looks for export files in the initialization directory
- Creates empty schema if no export files found
- Gracefully handles missing files

**Process:**
1. Checks for export files in `/exports/`
2. Creates schema from `schema.sql` if available
3. Imports data if export files exist
4. Creates empty schema if no data available

## Environment Variables

All scripts use environment variables for database authentication:

- `DB_HOST`: Database host (default: `supabase-db`)
- `DB_PORT`: Database port (default: `5432`)
- `DB_NAME`: Database name (default: `fortinet_network_collector_dev`)
- `DB_USER`: Database user (default: `postgres`)
- `PGPASSWORD`: Database password (required for authentication)

These variables are automatically loaded from your `.env` files.

## Docker Integration

### Management Profile

The database management utilities are available through the `management` Docker Compose profile:

```bash
# Start management container
docker-compose --profile management up db-manager

# Export data
docker exec fortinet-db-manager /scripts/export-data.sh

# Import data (schema-first)
docker exec fortinet-db-manager /scripts/import-data.sh

# Stop management container
docker-compose --profile management down
```

### Volume Mounts

The management container mounts:
- `./exports:/exports` - For export/import files and schema.sql
- `./postgres-db/scripts:/scripts` - For management scripts
- `./postgres-db/data:/docker-entrypoint-initdb.d` - For initialization scripts

## Database Schema

The database contains the following tables with foreign key relationships:

```
firewalls (firewall_id)
├── vdoms (vdom_id) → firewall_id
├── interfaces (interface_id) → firewall_id, vdom_id
└── routes (route_id) → vdom_id
└── vips (vip_id) → vdom_id
```

### Export Order (Foreign Key Safe)

Data is exported in this order to respect dependencies:
1. `firewalls` (no dependencies)
2. `vdoms` (depends on firewalls)
3. `interfaces` (depends on firewalls and vdoms)
4. `routes` (depends on vdoms)
5. `vips` (depends on vdoms)

## Security Features

✅ **No hardcoded passwords** - All authentication uses environment variables  
✅ **Consistent configuration** - Same settings across all environment files  
✅ **Safe storage** - Export files stored outside containers  
✅ **Error handling** - Scripts stop on errors to prevent data corruption  
✅ **Schema separation** - Prevents data injection through malformed exports

## Export File Format

Export files contain:
- Data-only exports (schema handled separately)
- All data with proper foreign key dependency ordering
- Transaction-safe import (all-or-nothing)
- Timestamped filenames for easy identification

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure scripts have execute permissions
   ```bash
   chmod +x scripts/*.sh data/*.sh
   ```

2. **Connection Failed**: Verify database is running and accessible
   ```bash
   docker-compose ps supabase-db
   ```

3. **Authentication Failed**: Check `PGPASSWORD` environment variable
   ```bash
   echo $PGPASSWORD
   ```

4. **Schema File Missing**: Ensure schema.sql is available in exports directory
   ```bash
   docker exec fortinet-db-manager ls -la /exports/schema.sql
   ```

5. **Table Does Not Exist**: This was the original issue - now resolved with schema-first approach

### Import Issues

**Problem**: Import fails with "relation does not exist"
- **Solution**: This is now resolved with schema-first approach
- Schema is created before data import

**Problem**: Import fails with foreign key violations
- Exports are ordered to handle dependencies automatically
- Check if export file is complete and not corrupted

**Problem**: Automatic import not working
```bash
# Check if auto-import script is executable
ls -la postgres-db/data/99-auto-import.sh

# Check container logs during startup
docker-compose logs supabase-db
```

### Export Issues

**Problem**: Export fails with authentication error
```bash
# Check environment variables are loaded
docker-compose run --rm db-manager env | grep POSTGRES
```

**Problem**: Export file not created
```bash
# Check exports directory permissions
ls -la postgres-db/exports/
```

### Database Connection Issues

**Problem**: Cannot connect to database
```bash
# Verify database is running
docker-compose ps supabase-db

# Check database logs
docker-compose logs supabase-db

# Test connection
docker exec fortinet-db-manager psql -h supabase-db -U postgres -d fortinet_network_collector_dev -c "SELECT version();"
```

### Logs and Debugging

- Container logs: `docker-compose logs db-manager`
- Database logs: `docker-compose logs supabase-db`
- Script output includes detailed status messages
- Backup files are preserved for recovery

## Best Practices

1. **Schema-First**: Always ensure schema.sql is available before importing
2. **Regular Exports**: Schedule regular data exports for backup
3. **Test Imports**: Test import process in development environment
4. **Monitor Disk Space**: Export files accumulate over time
5. **Verify Data**: Check data integrity after import operations
6. **Environment Consistency**: Ensure consistent environment variables across environments
7. **Schema Maintenance**: Keep schema.sql synchronized with create_tables.sql changes

## Development Notes

- The `db-manager` service is included in development environment by default
- Export files are gitignored to prevent committing sensitive data
- Scripts use `set -e` to stop on any error
- Foreign key dependencies are handled automatically in export ordering
- Auto-import only runs if export files exist, otherwise starts with empty database
- Schema-first approach ensures reliable database restoration

## Production Considerations

- Schedule regular exports using cron or CI/CD pipelines
- Monitor export file sizes and storage usage
- Consider compression for large databases
- Implement retention policies for old export files
- Test restore procedures regularly
- Ensure schema.sql is included in deployment packages

## File Permissions

All scripts are executable and use proper shell shebangs:
- `export-data.sh`: Creates timestamped SQL exports (data-only)
- `import-data.sh`: Schema-first import from specified or latest export
- `99-auto-import.sh`: Runs automatically during container initialization with schema-first approach