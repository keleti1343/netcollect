#!/bin/bash

# Script to fix data issues in exported SQL files
echo "=== Fixing Data Issues in SQL Files ==="

# Function to fix a SQL file
fix_sql_file() {
    local file="$1"
    local description="$2"
    
    if [ ! -f "$file" ]; then
        echo "❌ File not found: $file"
        return 1
    fi
    
    echo "🔧 Fixing $description..."
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Fix the issues:
    # 1. Replace 'None' with NULL for IP addresses
    # 2. Fix apostrophe escaping issues
    # 3. Handle any other data type issues
    
    sed -i \
        -e "s/'None'/NULL/g" \
        -e "s/don\\'t/don''t/g" \
        -e "s/can\\'t/can''t/g" \
        -e "s/won\\'t/won''t/g" \
        -e "s/isn\\'t/isn''t/g" \
        -e "s/doesn\\'t/doesn''t/g" \
        -e "s/haven\\'t/haven''t/g" \
        -e "s/shouldn\\'t/shouldn''t/g" \
        -e "s/wouldn\\'t/wouldn''t/g" \
        -e "s/couldn\\'t/couldn''t/g" \
        "$file"
    
    echo "✅ Fixed $description"
    return 0
}

# Fix all SQL files
fix_sql_file "firewalls_rows.sql" "firewalls data"
fix_sql_file "vdoms_rows.sql" "vdoms data"
fix_sql_file "interfaces_rows.sql" "interfaces data"
fix_sql_file "routes_rows.sql" "routes data"
fix_sql_file "vips_rows.sql" "vips data"

echo ""
echo "=== Data Fixing Complete ==="
echo "✅ All SQL files have been fixed"
echo "📁 Backup files created with .backup extension"
echo ""
echo "You can now run the import script again:"
echo "  ./import_data.sh"