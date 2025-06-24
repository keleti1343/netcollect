# Database Schema Verification Plan

## Objective
Verify the actual schema of the Supabase PostgreSQL database against the documented schema in `plan/02_database_schema_and_setup.md` and update the documentation if discrepancies are found.

## Database Connection Information
```
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "postgres"
DB_HOST = "localhost"
DB_PORT = "55322"
```

## Verification Approach

### 1. Install Required Dependencies
```bash
pip install psycopg2-binary
```

### 2. Create a Schema Verification Script
Create a Python script `fortinet-collector/db_utils/describe_tables.py` with the following functionality:

```python
import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection parameters
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "55322")

def get_tables():
    """Get all tables in the public schema."""
    conn = None
    tables = []
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = [table[0] for table in cursor.fetchall()]
        cursor.close()
    except Exception as e:
        print(f"Error fetching tables: {e}")
    finally:
        if conn:
            conn.close()
    return tables

def get_table_columns(table_name):
    """Get column information for a specific table."""
    conn = None
    columns = []
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = %s
            ORDER BY ordinal_position;
        """, (table_name,))
        columns = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Error fetching columns for table {table_name}: {e}")
    finally:
        if conn:
            conn.close()
    return columns

def get_table_constraints(table_name):
    """Get constraints for a specific table."""
    conn = None
    constraints = []
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                tc.constraint_name,
                tc.constraint_type,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM
                information_schema.table_constraints AS tc
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                LEFT JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
            WHERE tc.table_name = %s
            AND tc.table_schema = 'public'
            ORDER BY tc.constraint_type, tc.constraint_name;
        """, (table_name,))
        constraints = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Error fetching constraints for table {table_name}: {e}")
    finally:
        if conn:
            conn.close()
    return constraints

def get_table_indexes(table_name):
    """Get indexes for a specific table."""
    conn = None
    indexes = []
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                i.relname as index_name,
                a.attname as column_name
            FROM
                pg_class t,
                pg_class i,
                pg_index ix,
                pg_attribute a
            WHERE
                t.oid = ix.indrelid
                AND i.oid = ix.indexrelid
                AND a.attrelid = t.oid
                AND a.attnum = ANY(ix.indkey)
                AND t.relkind = 'r'
                AND t.relname = %s
            ORDER BY
                i.relname;
        """, (table_name,))
        indexes = cursor.fetchall()
        cursor.close()
    except Exception as e:
        print(f"Error fetching indexes for table {table_name}: {e}")
    finally:
        if conn:
            conn.close()
    return indexes

def print_table_schema(table_name):
    """Print the complete schema for a table."""
    print(f"\n=== Table: {table_name} ===")
    
    # Print columns
    columns = get_table_columns(table_name)
    if columns:
        print("\nColumns:")
        for col in columns:
            print(f"  {col[0]}: {col[1]}, Nullable: {col[2]}, Default: {col[3]}")
    
    # Print constraints
    constraints = get_table_constraints(table_name)
    if constraints:
        print("\nConstraints:")
        for constraint in constraints:
            name, type_code, column, ref_table, ref_column = constraint
            if type_code == "PRIMARY KEY":
                print(f"  PRIMARY KEY {name} on {column}")
            elif type_code == "FOREIGN KEY":
                print(f"  FOREIGN KEY {name} on {column} references {ref_table}({ref_column})")
            elif type_code == "UNIQUE":
                print(f"  UNIQUE {name} on {column}")
            else:
                print(f"  {type_code} {name} on {column}")
    
    # Print indexes
    indexes = get_table_indexes(table_name)
    if indexes:
        print("\nIndexes:")
        current_index = None
        index_columns = []
        
        for idx in indexes:
            idx_name, column = idx
            if current_index != idx_name:
                if current_index:
                    print(f"  {current_index} on {', '.join(index_columns)}")
                current_index = idx_name
                index_columns = [column]
            else:
                index_columns.append(column)
        
        if current_index:
            print(f"  {current_index} on {', '.join(index_columns)}")

def main():
    tables = get_tables()
    if not tables:
        print("No tables found in the database or could not connect to the database.")
        return
    
    print(f"Found {len(tables)} tables: {', '.join(tables)}\n")
    
    for table in tables:
        print_table_schema(table)

if __name__ == "__main__":
    main()
```

### 3. Run the Script to Extract Actual Schema
```bash
python fortinet-collector/db_utils/describe_tables.py > schema_results.txt
```

### 4. Compare the Actual Schema with the Documented Schema
Compare the output in `schema_results.txt` with the schema documented in `plan/02_database_schema_and_setup.md`:

1. Verify that all documented tables exist in the actual schema
2. For each table, check:
   - All documented columns exist with correct data types
   - Primary keys match
   - Foreign key relationships match
   - Unique constraints match
   - Indexes are properly created

### 5. Document Discrepancies and Update Documentation
Create a document listing any discrepancies found, such as:
- Missing tables
- Missing or additional columns
- Different data types
- Missing or additional constraints
- Missing or additional indexes

Update the `plan/02_database_schema_and_setup.md` file to reflect the actual schema if necessary.

## Expected Challenges and Solutions

### Connection Issues
If unable to connect to the PostgreSQL database:
1. Verify that the Supabase server is running
2. Confirm the connection parameters in the `.env` file
3. Ensure the PostgreSQL port is accessible

### Missing Tables
If tables are missing from the actual schema:
1. Run the table creation script from the documentation
2. Verify there are no errors during table creation
3. Update the documentation if there are valid reasons for tables not being created

### Schema Differences
If the actual schema differs from the documentation:
1. Determine if the differences are intentional or accidental
2. Update either the actual schema or the documentation based on project requirements

## Next Steps After Verification
1. Update the documentation with any discovered discrepancies
2. Ensure the database schema and documentation stay in sync as the project evolves
3. Consider implementing automated schema verification as part of CI/CD