#!/bin/bash

# Data Cleaning Script for Exported SQL Files
# Fixes data quality issues before import

set -e

echo "=== Starting Data Cleaning Process ==="

# Create backup directory with proper permissions
if ! mkdir -p backups; then
    echo "ERROR: Failed to create backups directory"
    exit 1
fi
chmod 755 backups
timestamp=$(date +%Y%m%d_%H%M%S)

# Verify we have write permissions
if [ ! -w . ]; then
    echo "ERROR: No write permissions in current directory"
    exit 1
fi

# Function to backup and clean a file
clean_file() {
    local file=$1
    local backup_file="backups/${file%.sql}_backup_${timestamp}.sql"
    
    echo "Processing $file..."
    
    # Verify source file exists and is readable
    if [ ! -r "$file" ]; then
        echo "  - ERROR: Cannot read file $file"
        return 1
    fi
    
    # Create backup
    if ! cp "$file" "$backup_file"; then
        echo "  - ERROR: Failed to create backup $backup_file"
        return 1
    fi
    chmod 644 "$backup_file"
    echo "  - Backup created: $backup_file"
    
    # Verify we can modify the file
    if [ ! -w "$file" ]; then
        echo "  - ERROR: Cannot modify file $file"
        return 1
    fi
    
    # Clean the file
    if ! sed -i \
        -e "s/'None'/NULL/g" \
        -e "s/, 'None',/, NULL,/g" \
        -e "s/('None',/(NULL,/g" \
        -e "s/, 'None')/, NULL)/g" \
        -e "s/('None')/(NULL)/g" \
        -e "s/'None'$/NULL/g" \
        -e "s/'''/'/g" \
        -e "s/can''t/can\\'t/g" \
        -e "s/don''t/don\\'t/g" \
        -e "s/won''t/won\\'t/g" \
        -e "s/isn''t/isn\\'t/g" \
        -e "s/doesn''t/doesn\\'t/g" \
        -e "s/haven''t/haven\\'t/g" \
        -e "s/shouldn''t/shouldn\\'t/g" \
        -e "s/wouldn''t/wouldn\\'t/g" \
        -e "s/couldn''t/couldn\\'t/g" \
        -e "s/mustn''t/mustn\\'t/g" \
        -e "s/needn''t/needn\\'t/g" \
        -e "s/daren''t/daren\\'t/g" \
        -e "s/shan''t/shan\\'t/g" \
        -e "s/mayn''t/mayn\\'t/g" \
        -e "s/mightn''t/mightn\\'t/g" \
        -e "s/oughtn''t/oughtn\\'t/g" \
        -e "s/usedn''t/usedn\\'t/g" \
        -e "s/'''/\\'/g" \
        "$file"; then
        echo "  - ERROR: Failed to clean file $file"
        return 1
    fi
    
    echo "  - Cleaned successfully"
    return 0
}

# Clean all data files
echo "1. Cleaning firewalls data..."
clean_file "firewalls_rows.sql"

echo "2. Cleaning vdoms data..."
clean_file "vdoms_rows.sql"

echo "3. Cleaning interfaces data..."
clean_file "interfaces_rows.sql"

echo "4. Cleaning routes data..."
clean_file "routes_rows.sql"

echo "5. Cleaning vips data..."
clean_file "vips_rows.sql"

# Validate cleaned files
echo ""
echo "=== Validation Check ==="
echo "Checking for remaining 'None' values..."

for file in firewalls_rows.sql vdoms_rows.sql interfaces_rows.sql routes_rows.sql vips_rows.sql; do
    none_count=$(grep -o "'None'" "$file" | wc -l || echo "0")
    echo "  - $file: $none_count 'None' values remaining"
done

echo ""
echo "Checking for triple quotes..."
for file in firewalls_rows.sql vdoms_rows.sql interfaces_rows.sql routes_rows.sql vips_rows.sql; do
    triple_count=$(grep -o "'''" "$file" | wc -l || echo "0")
    echo "  - $file: $triple_count triple quotes remaining"
done

echo ""
echo "=== Data Cleaning Complete ==="
echo "All files have been cleaned and backed up."
echo "Backup files are stored in the 'backups' directory."
echo ""
echo "Ready for database import!"