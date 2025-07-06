#!/bin/bash

# =====================================================
# Fortinet Database Import Script
# =====================================================
# Purpose: Import Supabase exported data into PostgreSQL
# Author: Kilo Code
# Date: 2025-01-07
# =====================================================

set -e  # Exit on any error

# Configuration
DB_CONTAINER="fortinet-supabase-db"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="your_password_here"
DATA_DIR="/docker-entrypoint-initdb.d"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

# Function to execute SQL in container
execute_sql() {
    local sql_file="$1"
    local description="$2"
    
    log "Executing: $description"
    
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$sql_file"; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed"
        return 1
    fi
}

# Function to execute SQL command directly
execute_sql_command() {
    local sql_command="$1"
    local description="$2"
    
    log "Executing: $description"
    
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "$sql_command"; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed"
        return 1
    fi
}

# Function to check if container is running
check_container() {
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        log_error "Database container '$DB_CONTAINER' is not running"
        log "Please start the container with: docker-compose up -d supabase-db"
        exit 1
    fi
    log_success "Database container is running"
}

# Function to wait for database to be ready
wait_for_db() {
    log "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
            log_success "Database is ready"
            return 0
        fi
        
        log "Attempt $attempt/$max_attempts - Database not ready yet, waiting..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Database failed to become ready after $max_attempts attempts"
    exit 1
}

# Function to get record count from a table
get_record_count() {
    local table_name="$1"
    local count=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM \"public\".\"$table_name\";" 2>/dev/null | tr -d ' ')
    echo "$count"
}

# Function to verify import results
verify_import() {
    log "Verifying import results..."
    
    local firewalls_count=$(get_record_count "firewalls")
    local vdoms_count=$(get_record_count "vdoms")
    local interfaces_count=$(get_record_count "interfaces")
    local routes_count=$(get_record_count "routes")
    local vips_count=$(get_record_count "vips")
    
    echo ""
    echo "======================================"
    echo "         IMPORT SUMMARY"
    echo "======================================"
    echo "Firewalls:   $firewalls_count records"
    echo "VDOMs:       $vdoms_count records"
    echo "Interfaces:  $interfaces_count records"
    echo "Routes:      $routes_count records"
    echo "VIPs:        $vips_count records"
    echo "======================================"
    echo ""
    
    # Expected counts based on file analysis
    local expected_firewalls=25
    local expected_vdoms=205
    local expected_interfaces=572
    
    if [ "$firewalls_count" -eq "$expected_firewalls" ]; then
        log_success "Firewalls import verified ($firewalls_count/$expected_firewalls)"
    else
        log_warning "Firewalls count mismatch: got $firewalls_count, expected $expected_firewalls"
    fi
    
    if [ "$vdoms_count" -eq "$expected_vdoms" ]; then
        log_success "VDOMs import verified ($vdoms_count/$expected_vdoms)"
    else
        log_warning "VDOMs count mismatch: got $vdoms_count, expected $expected_vdoms"
    fi
    
    if [ "$interfaces_count" -eq "$expected_interfaces" ]; then
        log_success "Interfaces import verified ($interfaces_count/$expected_interfaces)"
    else
        log_warning "Interfaces count mismatch: got $interfaces_count, expected $expected_interfaces"
    fi
    
    if [ "$routes_count" -gt 0 ]; then
        log_success "Routes import completed ($routes_count records)"
    else
        log_warning "No routes imported"
    fi
    
    if [ "$vips_count" -gt 0 ]; then
        log_success "VIPs import completed ($vips_count records)"
    else
        log_warning "No VIPs imported"
    fi
}

# Function to backup existing data (if any)
backup_existing_data() {
    log "Checking for existing data..."
    
    local existing_tables=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('firewalls', 'vdoms', 'interfaces', 'routes', 'vips');" 2>/dev/null | tr -d ' ')
    
    if [ "$existing_tables" -gt 0 ]; then
        log_warning "Existing tables found. Creating backup..."
        local backup_file="/tmp/fortinet_backup_$(date +%Y%m%d_%H%M%S).sql"
        
        if docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --schema=public > "$backup_file"; then
            log_success "Backup created: $backup_file"
        else
            log_warning "Backup creation failed, continuing anyway..."
        fi
    else
        log "No existing tables found, proceeding with fresh import"
    fi
}

# Main import function
main() {
    echo ""
    echo "=============================================="
    echo "    FORTINET DATABASE IMPORT SCRIPT"
    echo "=============================================="
    echo "Starting import process..."
    echo ""
    
    # Step 1: Check prerequisites
    check_container
    wait_for_db
    
    # Step 2: Backup existing data
    backup_existing_data
    
    # Step 3: Create schema
    log "Creating database schema..."
    if execute_sql "import_schema.sql" "Schema creation"; then
        log_success "Database schema created successfully"
    else
        log_error "Schema creation failed"
        exit 1
    fi
    
    # Step 4: Import data in dependency order
    echo ""
    log "Starting data import in dependency order..."
    echo ""
    
    # Import firewalls (no dependencies)
    log "Phase 1: Importing firewalls (parent table)"
    if execute_sql "firewalls_rows.sql" "Firewalls import"; then
        local count=$(get_record_count "firewalls")
        log_success "Firewalls imported: $count records"
    else
        log_error "Firewalls import failed"
        exit 1
    fi
    
    # Import vdoms (depends on firewalls)
    log "Phase 2: Importing VDOMs (depends on firewalls)"
    if execute_sql "vdoms_rows.sql" "VDOMs import"; then
        local count=$(get_record_count "vdoms")
        log_success "VDOMs imported: $count records"
    else
        log_error "VDOMs import failed"
        exit 1
    fi
    
    # Import interfaces (depends on firewalls and vdoms)
    log "Phase 3: Importing interfaces (depends on firewalls + vdoms)"
    if execute_sql "interfaces_rows.sql" "Interfaces import"; then
        local count=$(get_record_count "interfaces")
        log_success "Interfaces imported: $count records"
    else
        log_error "Interfaces import failed"
        exit 1
    fi
    
    # Import routes (depends on vdoms)
    log "Phase 4: Importing routes (depends on vdoms)"
    if execute_sql "routes_rows.sql" "Routes import"; then
        local count=$(get_record_count "routes")
        log_success "Routes imported: $count records"
    else
        log_error "Routes import failed"
        exit 1
    fi
    
    # Import vips (depends on vdoms)
    log "Phase 5: Importing VIPs (depends on vdoms)"
    if execute_sql "vips_rows.sql" "VIPs import"; then
        local count=$(get_record_count "vips")
        log_success "VIPs imported: $count records"
    else
        log_error "VIPs import failed"
        exit 1
    fi
    
    # Step 5: Verify import
    echo ""
    verify_import
    
    # Step 6: Update statistics
    log "Updating database statistics..."
    execute_sql_command "ANALYZE;" "Database statistics update"
    
    # Step 7: Final success message
    echo ""
    echo "=============================================="
    log_success "DATABASE IMPORT COMPLETED SUCCESSFULLY!"
    echo "=============================================="
    echo ""
    log "Next steps:"
    echo "1. Restart API services: docker-compose restart fortinet-api-1 fortinet-api-2"
    echo "2. Test API endpoints to verify data access"
    echo "3. Check application functionality"
    echo ""
}

# Error handling
trap 'log_error "Import script failed at line $LINENO"' ERR

# Run main function
main "$@"