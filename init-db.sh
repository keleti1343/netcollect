#!/bin/bash
# Database initialization script for Fortinet Network Collector on VPS

set -e

echo "Starting database initialization for VPS deployment..."

# Load environment variables safely - avoid problematic lines
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    # Use grep to exclude problematic lines and source safely
    set +e
    grep -v "NGINX_SSL_PROTOCOLS\|API_ACCESS_LOG_FORMAT" .env > /tmp/safe_env.tmp
    source /tmp/safe_env.tmp
    source_result=$?
    rm -f /tmp/safe_env.tmp
    set -e
    
    if [ $source_result -ne 0 ]; then
        echo "Warning: Error loading .env file, using defaults"
        POSTGRES_DB="fortinet_network_collector_dev"
    else
        echo "Environment variables loaded successfully"
        # Use the database name from .env or default
        POSTGRES_DB="${POSTGRES_DB:-fortinet_network_collector_dev}"
        # Ensure consistent database name format
        POSTGRES_DB="${POSTGRES_DB%_dev}_dev"
    fi
else
    echo "Warning: .env file not found, using defaults"
    POSTGRES_DB="fortinet_network_collector_dev"
fi

echo "Using database: $POSTGRES_DB"

# Determine Docker Compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Wait for PostgreSQL to be ready (max 60 seconds)
echo "Waiting for PostgreSQL to start..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    attempt=$((attempt+1))
    echo "Attempt $attempt/$max_attempts..."
    
    if $DOCKER_COMPOSE exec -T postgres-db pg_isready -U postgres 2>/dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        echo "Error: PostgreSQL not ready after $max_attempts attempts"
        exit 1
    fi
    
    echo "Waiting for PostgreSQL to start (attempt $attempt/$max_attempts)..."
    sleep 2
done

# Check if database already has tables
echo "Checking if database tables already exist..."
if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
    echo "Database tables already exist, skipping initialization"
    exit 0
fi

# Apply schema from schema.sql
echo "Applying database schema..."

# Try multiple approaches to create the schema
SCHEMA_APPLIED=false

# Method 1: Check if schema file exists in container and apply it
if $DOCKER_COMPOSE exec -T postgres-db test -f /docker-entrypoint-initdb.d/schema.sql 2>/dev/null; then
    echo "Found schema file in container, applying..."
    if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -f /docker-entrypoint-initdb.d/schema.sql; then
        echo "Database schema applied successfully from container!"
        SCHEMA_APPLIED=true
    fi
fi

# Method 2: If container method failed, try to copy schema from host and apply
if [ "$SCHEMA_APPLIED" = false ]; then
    echo "Trying to apply schema from host file..."
    
    # Find the schema file on host
    SCHEMA_FILE=""
    if [ -f "postgres-db/data/schema.sql" ]; then
        SCHEMA_FILE="postgres-db/data/schema.sql"
    elif [ -f "../network_collector_project/postgres-db/data/schema.sql" ]; then
        SCHEMA_FILE="../network_collector_project/postgres-db/data/schema.sql"
    fi
    
    if [ -n "$SCHEMA_FILE" ]; then
        echo "Found schema file at: $SCHEMA_FILE"
        echo "Copying schema to container and applying..."
        
        # Copy schema file to container and apply it
        if cat "$SCHEMA_FILE" | $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}"; then
            echo "Database schema applied successfully from host file!"
            SCHEMA_APPLIED=true
        else
            echo "Failed to apply schema from host file"
        fi
    fi
fi

# Method 3: If all else fails, create basic schema manually
if [ "$SCHEMA_APPLIED" = false ]; then
    echo "Creating basic database schema manually..."
    
    # Create basic tables that the API expects
    $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" << 'EOF'
-- Create basic schema for Fortinet Network Collector
CREATE TABLE IF NOT EXISTS firewalls (
    firewall_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vdoms (
    vdom_id SERIAL PRIMARY KEY,
    firewall_id INTEGER REFERENCES firewalls(firewall_id),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interfaces (
    interface_id SERIAL PRIMARY KEY,
    firewall_id INTEGER REFERENCES firewalls(firewall_id),
    vdom_id INTEGER REFERENCES vdoms(vdom_id),
    name VARCHAR(255) NOT NULL,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    route_id SERIAL PRIMARY KEY,
    vdom_id INTEGER REFERENCES vdoms(vdom_id),
    destination CIDR,
    gateway INET,
    interface VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vips (
    vip_id SERIAL PRIMARY KEY,
    vdom_id INTEGER REFERENCES vdoms(vdom_id),
    name VARCHAR(255) NOT NULL,
    external_ip INET,
    mapped_ip INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

EOF
    
    if [ $? -eq 0 ]; then
        echo "Basic database schema created successfully!"
        SCHEMA_APPLIED=true
    else
        echo "Failed to create basic schema"
    fi
fi

if [ "$SCHEMA_APPLIED" = false ]; then
    echo "Error: Failed to apply database schema using any method"
    exit 1
fi

# Verify tables were created
echo "Verifying database tables..."
if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
    echo "Tables verified successfully!"
    
    # Show table list
    echo "Created tables:"
    $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -c "\dt"
else
    echo "Error: Tables not created properly. Check schema file and PostgreSQL logs."
    exit 1
fi

echo "Database initialization completed successfully!"