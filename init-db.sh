#!/bin/bash
# Database initialization script for Fortinet Network Collector on VPS

set -e

echo "Starting database initialization for VPS deployment..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    echo "Warning: .env file not found, using defaults"
    POSTGRES_DB="fortinet_network_collector"
fi

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
if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
    echo "Database tables already exist, skipping initialization"
    exit 0
fi

# Apply schema from schema.sql
echo "Applying database schema..."
if [ -f "postgres-db/data/schema.sql" ]; then
    if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/schema.sql; then
        echo "Database schema applied successfully!"
    else
        echo "Error: Failed to apply database schema"
        exit 1
    fi
else
    echo "Error: Schema file postgres-db/data/schema.sql not found!"
    echo "Please ensure the schema file exists before running this script"
    exit 1
fi

# Verify tables were created
echo "Verifying database tables..."
if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
    echo "Tables verified successfully!"
    
    # Show table list
    echo "Created tables:"
    $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -c "\dt"
else
    echo "Error: Tables not created properly. Check schema file and PostgreSQL logs."
    exit 1
fi

echo "Database initialization completed successfully!"