#!/bin/bash

# Complete Database Import Script for New Schema
# This script creates the new schema and imports cleaned data

set -e

# Configuration
DB_CONTAINER="fortinet-supabase-db"
DB_NAME="postgres"
DB_USER="postgres"
PGPASSWORD="your-super-secret-jwt-token-with-at-least-32-characters-long"

echo "=== Complete Database Import Process ==="
echo "Timestamp: $(date)"

# Function to execute SQL in the database
execute_sql() {
    local sql_command="$1"
    local description="$2"
    
    echo "  - $description"
    docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -c "$sql_command" > /dev/null 2>&1
}

# Function to execute SQL file in the database
execute_sql_file() {
    local sql_file="$1"
    local description="$2"
    
    echo "  - $description"
    docker exec -i -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" < "$sql_file"
}

# Step 1: Clean the data files
echo ""
echo "Step 1: Cleaning data files..."
chmod +x clean_data.sh
./clean_data.sh

# Step 2: Create new schema
echo ""
echo "Step 2: Creating new database schema..."
execute_sql_file "new_schema.sql" "Creating tables and indexes"

# Step 3: Import data in dependency order
echo ""
echo "Step 3: Importing data in dependency order..."

echo "  3.1: Importing firewalls (parent table)..."
if [ -f "firewalls_rows.sql" ]; then
    execute_sql_file "firewalls_rows.sql" "Importing firewall data"
    firewall_count=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM firewalls;" | tr -d ' ')
    echo "    ✓ Imported $firewall_count firewalls"
else
    echo "    ✗ firewalls_rows.sql not found"
    exit 1
fi

echo "  3.2: Importing vdoms (child of firewalls)..."
if [ -f "vdoms_rows.sql" ]; then
    execute_sql_file "vdoms_rows.sql" "Importing VDOM data"
    vdom_count=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM vdoms;" | tr -d ' ')
    echo "    ✓ Imported $vdom_count VDOMs"
else
    echo "    ✗ vdoms_rows.sql not found"
    exit 1
fi

echo "  3.3: Importing interfaces (child of firewalls and vdoms)..."
if [ -f "interfaces_rows.sql" ]; then
    execute_sql_file "interfaces_rows.sql" "Importing interface data"
    interface_count=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM interfaces;" | tr -d ' ')
    echo "    ✓ Imported $interface_count interfaces"
else
    echo "    ✗ interfaces_rows.sql not found"
    exit 1
fi

echo "  3.4: Importing routes (child of vdoms)..."
if [ -f "routes_rows.sql" ]; then
    execute_sql_file "routes_rows.sql" "Importing route data"
    route_count=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM routes;" | tr -d ' ')
    echo "    ✓ Imported $route_count routes"
else
    echo "    ✗ routes_rows.sql not found"
    exit 1
fi

echo "  3.5: Importing vips (child of vdoms)..."
if [ -f "vips_rows.sql" ]; then
    execute_sql_file "vips_rows.sql" "Importing VIP data"
    vip_count=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM vips;" | tr -d ' ')
    echo "    ✓ Imported $vip_count VIPs"
else
    echo "    ✗ vips_rows.sql not found"
    exit 1
fi

# Step 4: Verify data integrity
echo ""
echo "Step 4: Verifying data integrity..."

# Check foreign key relationships
echo "  4.1: Checking foreign key relationships..."

# Check vdoms -> firewalls
orphaned_vdoms=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM vdoms v LEFT JOIN firewalls f ON v.firewall_id = f.firewall_id WHERE f.firewall_id IS NULL;" | tr -d ' ')
echo "    - Orphaned VDOMs: $orphaned_vdoms"

# Check interfaces -> firewalls
orphaned_interfaces_fw=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM interfaces i LEFT JOIN firewalls f ON i.firewall_id = f.firewall_id WHERE f.firewall_id IS NULL;" | tr -d ' ')
echo "    - Interfaces with invalid firewall_id: $orphaned_interfaces_fw"

# Check interfaces -> vdoms (allowing NULL vdom_id)
orphaned_interfaces_vdom=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM interfaces i LEFT JOIN vdoms v ON i.vdom_id = v.vdom_id WHERE i.vdom_id IS NOT NULL AND v.vdom_id IS NULL;" | tr -d ' ')
echo "    - Interfaces with invalid vdom_id: $orphaned_interfaces_vdom"

# Check routes -> vdoms
orphaned_routes=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM routes r LEFT JOIN vdoms v ON r.vdom_id = v.vdom_id WHERE v.vdom_id IS NULL;" | tr -d ' ')
echo "    - Orphaned routes: $orphaned_routes"

# Check vips -> vdoms
orphaned_vips=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
    psql -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM vips vip LEFT JOIN vdoms v ON vip.vdom_id = v.vdom_id WHERE v.vdom_id IS NULL;" | tr -d ' ')
echo "    - Orphaned VIPs: $orphaned_vips"

# Step 5: Generate summary statistics
echo ""
echo "Step 5: Import Summary..."
echo "  ┌─────────────────────────────────────┐"
echo "  │           IMPORT SUMMARY            │"
echo "  ├─────────────────────────────────────┤"
printf "  │ %-20s │ %10s │\n" "Table" "Records"
echo "  ├─────────────────────────────────────┤"
printf "  │ %-20s │ %10s │\n" "Firewalls" "$firewall_count"
printf "  │ %-20s │ %10s │\n" "VDOMs" "$vdom_count"
printf "  │ %-20s │ %10s │\n" "Interfaces" "$interface_count"
printf "  │ %-20s │ %10s │\n" "Routes" "$route_count"
printf "  │ %-20s │ %10s │\n" "VIPs" "$vip_count"
echo "  └─────────────────────────────────────┘"

# Calculate total records
total_records=$((firewall_count + vdom_count + interface_count + route_count + vip_count))
echo "  Total records imported: $total_records"

# Step 6: Update table statistics
echo ""
echo "Step 6: Updating database statistics..."
execute_sql "ANALYZE;" "Updating table statistics"

# Step 7: Final verification
echo ""
echo "Step 7: Final verification..."
echo "  - Checking if all tables exist and are accessible..."

for table in firewalls vdoms interfaces routes vips; do
    table_exists=$(docker exec -e PGPASSWORD="$PGPASSWORD" "$DB_CONTAINER" \
        psql -U "$DB_USER" -d "$DB_NAME" -t -c \
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '$table');" | tr -d ' ')
    if [ "$table_exists" = "t" ]; then
        echo "    ✓ Table '$table' exists and is accessible"
    else
        echo "    ✗ Table '$table' is missing or inaccessible"
    fi
done

echo ""
echo "=== Database Import Complete ==="
echo "Timestamp: $(date)"

# Check for any errors
if [ "$orphaned_vdoms" -gt 0 ] || [ "$orphaned_interfaces_fw" -gt 0 ] || [ "$orphaned_interfaces_vdom" -gt 0 ] || [ "$orphaned_routes" -gt 0 ] || [ "$orphaned_vips" -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: Some foreign key constraint violations detected!"
    echo "   This may indicate data quality issues that need attention."
    exit 1
else
    echo ""
    echo "✅ SUCCESS: All data imported successfully with no integrity issues!"
    echo ""
    echo "Next steps:"
    echo "1. Restart API services to refresh database connections"
    echo "2. Test API endpoints to verify data accessibility"
    echo "3. Test frontend application functionality"
fi