#!/bin/bash

# Fix remaining data quality issues for interfaces and routes

set -e

echo "=== Fixing Remaining Data Quality Issues ==="
echo "Timestamp: $(date)"

# Function to create backup
create_backup() {
    local file="$1"
    local backup_dir="backups"
    mkdir -p "$backup_dir"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${backup_dir}/${file}_fix_backup_${timestamp}.sql"
    cp "$file" "$backup_file"
    echo "  - Backup created: $backup_file"
}

# Fix interfaces data
echo ""
echo "1. Fixing interfaces data..."
if [ -f "interfaces_rows.sql" ]; then
    create_backup "interfaces_rows.sql"
    
    # Fix apostrophe issues in descriptions
    echo "  - Fixing apostrophe escaping issues..."
    
    # Replace problematic patterns
    sed -i "s/don\\\\'t have def/don''t have def/g" interfaces_rows.sql
    sed -i "s/can\\\\'t/can''t/g" interfaces_rows.sql
    sed -i "s/won\\\\'t/won''t/g" interfaces_rows.sql
    sed -i "s/isn\\\\'t/isn''t/g" interfaces_rows.sql
    sed -i "s/doesn\\\\'t/doesn''t/g" interfaces_rows.sql
    sed -i "s/haven\\\\'t/haven''t/g" interfaces_rows.sql
    sed -i "s/shouldn\\\\'t/shouldn''t/g" interfaces_rows.sql
    sed -i "s/wouldn\\\\'t/wouldn''t/g" interfaces_rows.sql
    sed -i "s/couldn\\\\'t/couldn''t/g" interfaces_rows.sql
    
    # Fix any remaining backslash-apostrophe combinations
    sed -i "s/\\\\'/'/g" interfaces_rows.sql
    
    # Fix any triple quotes or escaped quotes
    sed -i "s/'''/'/g" interfaces_rows.sql
    sed -i "s/\\\\\"/\"/g" interfaces_rows.sql
    
    echo "  - Interfaces data fixed"
else
    echo "  - interfaces_rows.sql not found"
fi

# Fix routes data
echo ""
echo "2. Fixing routes data..."
if [ -f "routes_rows.sql" ]; then
    create_backup "routes_rows.sql"
    
    # Fix invalid INET values
    echo "  - Fixing invalid INET values..."
    
    # Replace 'n/a' with NULL for gateway field (5th field in routes)
    sed -i "s/, 'n\/a', /, NULL, /g" routes_rows.sql
    
    # Replace any other invalid IP patterns
    sed -i "s/, 'N\/A', /, NULL, /g" routes_rows.sql
    sed -i "s/, 'none', /, NULL, /g" routes_rows.sql
    sed -i "s/, 'None', /, NULL, /g" routes_rows.sql
    sed -i "s/, 'NONE', /, NULL, /g" routes_rows.sql
    sed -i "s/, '', /, NULL, /g" routes_rows.sql
    
    # Fix any remaining apostrophe issues in routes
    sed -i "s/\\\\'/'/g" routes_rows.sql
    sed -i "s/'''/'/g" routes_rows.sql
    
    echo "  - Routes data fixed"
else
    echo "  - routes_rows.sql not found"
fi

# Validation
echo ""
echo "3. Validation check..."

if [ -f "interfaces_rows.sql" ]; then
    apostrophe_issues=$(grep -c "\\\\'" interfaces_rows.sql || true)
    triple_quotes=$(grep -c "'''" interfaces_rows.sql || true)
    echo "  - interfaces_rows.sql: $apostrophe_issues backslash-apostrophes, $triple_quotes triple quotes"
fi

if [ -f "routes_rows.sql" ]; then
    na_values=$(grep -c "'n/a'" routes_rows.sql || true)
    invalid_ips=$(grep -c "'N/A'\|'none'\|'None'\|'NONE'" routes_rows.sql || true)
    echo "  - routes_rows.sql: $na_values 'n/a' values, $invalid_ips other invalid values"
fi

echo ""
echo "=== Data Quality Fix Complete ==="
echo "Ready to retry import!"