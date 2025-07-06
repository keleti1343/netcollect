#!/bin/bash

# Data Cleaning Script for Exported SQL Files
# Fixes data quality issues before import

set -e

echo "=== Starting Data Cleaning Process ==="

# Create backup directory
mkdir -p backups
timestamp=$(date +%Y%m%d_%H%M%S)

# Function to backup and clean a file
clean_file() {
    local file=$1
    local backup_file="backups/${file%.sql}_backup_${timestamp}.sql"
    
    echo "Processing $file..."
    
    # Create backup
    cp "$file" "$backup_file"
    echo "  - Backup created: $backup_file"
    
    # Clean the file
    sed -i \
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
        "$file"
    
    echo "  - Cleaned successfully"
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