-- Import all data in dependency order
-- This script imports data from exported Supabase files
-- Execute with: docker exec -i fortinet-supabase-db psql -U postgres -d postgres < import_all.sql

-- First, create the schema if it doesn't exist
\i /docker-entrypoint-initdb.d/import_schema.sql
--
-- Import data in dependency order
-- 1. Firewalls (parent table)
\echo 'Importing firewalls...'
\i /docker-entrypoint-initdb.d/firewalls_rows.sql

-- 2. VDOMs (depends on firewalls)
\echo 'Importing vdoms...'
\i /docker-entrypoint-initdb.d/vdoms_rows.sql

-- 3. Interfaces (depends on firewalls and vdoms)
\echo 'Importing interfaces...'
\i /docker-entrypoint-initdb.d/interfaces_rows.sql

-- 4. Routes (depends on vdoms)
\echo 'Importing routes...'
\i /docker-entrypoint-initdb.d/routes_rows.sql

-- 5. VIPs (depends on vdoms)
\echo 'Importing vips...'
\i /docker-entrypoint-initdb.d/vips_rows.sql

-- Verify import results
\echo 'Import complete! Verifying data...'
SELECT 'firewalls' as table_name, COUNT(*) as row_count FROM firewalls
UNION ALL
SELECT 'vdoms' as table_name, COUNT(*) as row_count FROM vdoms
UNION ALL
SELECT 'interfaces' as table_name, COUNT(*) as row_count FROM interfaces
UNION ALL
SELECT 'routes' as table_name, COUNT(*) as row_count FROM routes
UNION ALL
SELECT 'vips' as table_name, COUNT(*) as row_count FROM vips;

\echo 'Data import verification complete!'