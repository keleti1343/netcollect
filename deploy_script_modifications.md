# Enhanced Deployment Script for Hostinger VPS

This document contains modifications that should be applied to the existing `deploy.sh` script to ensure proper operation on a Hostinger VPS. These changes address permission issues, system configuration requirements, and database initialization problems.

## Key Modifications for `deploy.sh`

The existing `deploy.sh` script should be modified with the following additions:

```bash
#!/bin/bash

# Enhanced Fortinet Application Deployment Script for Hostinger VPS
# Modified for permission handling and proper initialization

set -e

echo "🚀 Starting Fortinet Application Deployment on VPS"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# [Keep existing color and environment configuration sections]

# Add system configuration check
check_system_configuration() {
    log_info "Checking system configuration requirements..."
    
    # Check for memory overcommit setting (required by Redis)
    OVERCOMMIT_VALUE=$(cat /proc/sys/vm/overcommit_memory)
    if [ "$OVERCOMMIT_VALUE" != "1" ]; then
        log_warning "Redis requires vm.overcommit_memory=1, current value: $OVERCOMMIT_VALUE"
        log_info "Setting vm.overcommit_memory=1 for current session..."
        
        # Try to set the value for the current session
        if command -v sysctl &> /dev/null; then
            sudo sysctl vm.overcommit_memory=1 || {
                log_warning "Failed to set vm.overcommit_memory. Please manually run:"
                echo "echo \"vm.overcommit_memory = 1\" | sudo tee -a /etc/sysctl.conf"
                echo "sudo sysctl vm.overcommit_memory=1"
            }
        else
            log_warning "sysctl command not found. Please manually configure vm.overcommit_memory=1"
        fi
        
        # Add to sysctl.conf for persistence
        if [ ! -f "/etc/sysctl.conf" ] || ! grep -q "vm.overcommit_memory" "/etc/sysctl.conf"; then
            log_info "Adding vm.overcommit_memory=1 to /etc/sysctl.conf for persistence..."
            echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf || {
                log_warning "Failed to update /etc/sysctl.conf. Please manually add: vm.overcommit_memory = 1"
            }
        fi
    else
        log_success "Redis memory overcommit setting correctly configured"
    fi
    
    # Check for locales (required by PostgreSQL)
    if ! locale -a | grep -i "en_US.utf8" &> /dev/null; then
        log_warning "en_US.UTF-8 locale not found (required by PostgreSQL)"
        log_info "Attempting to generate required locale..."
        
        if command -v locale-gen &> /dev/null; then
            sudo locale-gen en_US.UTF-8 || {
                log_warning "Failed to generate locale. Please manually run:"
                echo "sudo locale-gen en_US.UTF-8"
                echo "sudo update-locale LANG=en_US.UTF-8"
            }
            sudo update-locale LANG=en_US.UTF-8
        else
            log_warning "locale-gen command not found. Please manually configure the en_US.UTF-8 locale"
        fi
    else
        log_success "Required locale en_US.UTF-8 is available"
    fi
    
    log_success "System configuration check completed"
}

# Add volume permission setup function
setup_volume_permissions() {
    log_info "Setting up volume permissions for container data persistence..."
    
    # Create required directories if they don't exist
    mkdir -p ./data/postgres ./data/redis ./data/nginx/logs ./backups
    
    # Set proper permissions for PostgreSQL data directory
    # PostgreSQL runs as user 999 in the container
    log_info "Setting permissions for PostgreSQL data directory..."
    if command -v chown &> /dev/null; then
        sudo chown -R 999:999 ./data/postgres || {
            log_warning "Failed to set PostgreSQL directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chown -R 999:999 ./data/postgres"
        }
    else
        log_warning "chown command not found. Please manually set PostgreSQL directory permissions"
    fi
    
    # Set proper permissions for Redis data directory
    # Redis runs as user 999 in the container
    log_info "Setting permissions for Redis data directory..."
    if command -v chown &> /dev/null; then
        sudo chown -R 999:999 ./data/redis || {
            log_warning "Failed to set Redis directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chown -R 999:999 ./data/redis"
        }
    else
        log_warning "chown command not found. Please manually set Redis directory permissions"
    fi
    
    # Set permissions for Nginx logs
    log_info "Setting permissions for Nginx logs directory..."
    if command -v chmod &> /dev/null; then
        sudo chmod -R 777 ./data/nginx/logs || {
            log_warning "Failed to set Nginx logs directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chmod -R 777 ./data/nginx/logs"
        }
    else
        log_warning "chmod command not found. Please manually set Nginx logs directory permissions"
    fi
    
    # Set permissions for backup directory
    log_info "Setting permissions for backups directory..."
    if command -v chmod &> /dev/null; then
        sudo chmod -R 777 ./backups || {
            log_warning "Failed to set backups directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chmod -R 777 ./backups"
        }
    else
        log_warning "chmod command not found. Please manually set backups directory permissions"
    fi
    
    log_success "Volume permissions setup completed"
}

# Modify the check_requirements function to include additional checks
check_requirements() {
    log_info "Checking requirements..."
    
    # [Keep existing Docker and Docker Compose checks]
    
    # Check for required tools
    log_info "Checking for required system tools..."
    for cmd in python3 curl openssl sudo chmod chown; do
        if ! command -v $cmd &> /dev/null; then
            log_warning "$cmd is not installed but recommended"
        fi
    done
    
    # Check for Python packages if deploying API
    if [ "$ENVIRONMENT" != "development" ]; then
        log_info "Checking for required Python packages..."
        if command -v pip3 &> /dev/null; then
            # Check for essential packages
            MISSING_PACKAGES=""
            for pkg in fastapi uvicorn gunicorn sqlalchemy psycopg2-binary redis pydantic alembic; do
                if ! pip3 list | grep -i "$pkg" &> /dev/null; then
                    MISSING_PACKAGES="$MISSING_PACKAGES $pkg"
                fi
            done
            
            if [ -n "$MISSING_PACKAGES" ]; then
                log_warning "Some Python packages may be missing:$MISSING_PACKAGES"
                log_info "These will be installed inside the containers, but having them locally can help with development"
            fi
        else
            log_warning "pip3 not found, skipping Python package checks"
        fi
    fi
    
    # Check for Node.js if deploying web frontend
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js version: $NODE_VERSION"
        
        # Check if Node.js version is adequate (>= 18.x)
        if [[ "$NODE_VERSION" =~ ^v([0-9]+) ]] && [ "${BASH_REMATCH[1]}" -lt 18 ]; then
            log_warning "Node.js version ${BASH_REMATCH[1]} is below recommended version 18+"
        fi
    else
        log_warning "Node.js not found, but will be used inside containers"
    fi
    
    log_success "Requirements check passed"
}

# Enhance the database initialization process
enhanced_database_init() {
    log_info "Performing enhanced database initialization..."
    
    # First, create the schema file if it doesn't exist yet
    SCHEMA_FILE="./postgres-db/data/schema.sql"
    if [ ! -f "$SCHEMA_FILE" ]; then
        log_warning "Schema file not found: $SCHEMA_FILE"
        log_info "Checking if we can generate the schema from models..."
        
        # Attempt to generate schema from models if available
        if [ -d "./fortinet-api/app/models" ]; then
            log_info "Attempting to generate schema from API models..."
            
            # Create a temporary script to generate schema
            TMP_SCRIPT="./generate_schema.py"
            cat > $TMP_SCRIPT << 'EOF'
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.schema import CreateTable

# Add the application directory to path
sys.path.insert(0, os.path.abspath('./fortinet-api'))

try:
    # Import all models
    from app.models import *
    from app.models.base import Base

    # Create engine
    engine = create_engine('postgresql://postgres:postgres@localhost/postgres')
    
    # Generate schema
    with open('./postgres-db/data/schema.sql', 'w') as f:
        f.write('-- Auto-generated database schema\n\n')
        
        # Get all tables
        for table in Base.metadata.sorted_tables:
            create_table = CreateTable(table)
            f.write(str(create_table).rstrip() + ';\n\n')
            
            # Add indexes if any
            for index in table.indexes:
                f.write(f'CREATE INDEX IF NOT EXISTS {index.name} ON {table.name} ({", ".join(index.columns.keys())});\n\n')
    
    print("Schema generated successfully!")
except Exception as e:
    print(f"Error generating schema: {e}")
    sys.exit(1)
EOF
            
            # Run the script
            if command -v python3 &> /dev/null; then
                python3 $TMP_SCRIPT || {
                    log_warning "Failed to generate schema from models"
                }
                rm $TMP_SCRIPT
            else
                log_warning "Python3 not found, cannot generate schema"
            fi
        else
            log_warning "API models directory not found, cannot generate schema"
        fi
    fi
    
    # Check if schema file exists now
    if [ -f "$SCHEMA_FILE" ]; then
        log_success "Schema file found: $SCHEMA_FILE"
    else
        log_error "Schema file not found. Database initialization may fail."
        log_warning "Please manually create the schema file with table definitions"
        return 1
    fi
    
    # Ensure PostgreSQL is running
    log_info "Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db pg_isready -U postgres &> /dev/null; then
            log_success "PostgreSQL is ready"
            break
        fi
        
        if [ $i -eq 30 ]; then
            log_error "PostgreSQL not ready after 30 attempts"
            return 1
        fi
        
        log_info "Waiting for PostgreSQL... (attempt $i/30)"
        sleep 2
    done
    
    # Apply schema to database
    log_info "Applying database schema..."
    if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/schema.sql; then
        log_success "Database schema applied successfully"
    else
        log_error "Failed to apply database schema"
        return 1
    fi
    
    # Verify database tables
    log_info "Verifying database tables..."
    if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -c "\dt" | grep -q "firewalls"; then
        log_success "Database tables verified"
    else
        log_warning "Database tables not found after schema application"
        log_info "Tables will be created when API starts if using migrations"
    fi
    
    log_success "Enhanced database initialization completed"
}

# Modify deploy_production to include enhanced setup and initialization
deploy_production() {
    log_info "Deploying production environment on VPS..."
    
    # Check system configuration for VPS environment
    check_system_configuration
    
    # Set up volume permissions
    setup_volume_permissions
    
    # Stop existing services
    log_info "Stopping existing services..."
    $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans
    
    # Start database and cache first
    log_info "Starting database and cache services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d postgres-db redis
    
    # Wait for database to be ready and initialize it
    log_info "Initializing database..."
    enhanced_database_init || {
        log_warning "Database initialization had issues but continuing deployment"
    }
    
    # [Keep the rest of the existing deployment steps]
    
    # Start API services
    log_info "Starting API services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d fortinet-api-1 fortinet-api-2
    
    # Wait for APIs to be ready
    log_info "Waiting for API services to be ready..."
    sleep 20
    
    # Start web services
    log_info "Starting web services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d fortinet-web-1 fortinet-web-2
    
    # Wait for web services to be ready
    log_info "Waiting for web services to be ready..."
    sleep 15
    
    # Start load balancer
    log_info "Starting load balancer..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d nginx
    
    log_success "Production environment deployed successfully on VPS"
}

# Modify main function to include new steps
main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Setup environment configuration
    setup_environment
    
    # Run deployment steps
    check_requirements
    check_system_configuration  # New step
    setup_environment_file
    setup_volume_permissions    # New step
    build_images
    deploy_services
    
    # Health checks
    if health_check; then
        log_success "🎉 $ENVIRONMENT deployment completed successfully!"
        show_status
    else
        log_error "Health checks failed. Please check the logs."
        $DOCKER_COMPOSE $COMPOSE_FILES logs --tail=50
        exit 1
    fi
}

# [Keep the rest of the existing script functions]
```

## Docker Compose Modifications

The following changes should be made to `docker-compose.yml`:

```yaml
# Modifications for Redis service
redis:
  build: ./redis
  container_name: fortinet-redis
  environment:
    # Redis Configuration
    - REDIS_MAXMEMORY=${REDIS_MAXMEMORY:-400M}
    - REDIS_MAXMEMORY_POLICY=${REDIS_MAXMEMORY_POLICY:-allkeys-lru}
    - REDIS_TIMEOUT=${REDIS_TIMEOUT:-300}
    - REDIS_TCP_KEEPALIVE=${REDIS_TCP_KEEPALIVE:-60}
    - REDIS_PASSWORD=${REDIS_PASSWORD:-}
  volumes:
    # Use absolute paths with proper permissions
    - ${PWD}/data/redis:/data
  # Add these extra settings for permission management
  user: "999:999"
  command: ["sh", "-c", "chown -R redis:redis /data && redis-server /etc/redis/redis.conf"]
  
# Modifications for PostgreSQL service
postgres-db:
  build: ./postgres-db
  container_name: postgres-db
  environment:
    - POSTGRES_DB=${POSTGRES_DB}
    - POSTGRES_USER=postgres
    # Change from trust to md5 authentication
    - POSTGRES_HOST_AUTH_METHOD=md5
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    # Add locale settings
    - LANG=en_US.utf8
    - LC_ALL=en_US.utf8
    # PostgreSQL Performance Configuration
    - POSTGRES_MAX_CONNECTIONS=${DB_MAX_CONNECTIONS:-100}
    - POSTGRES_SHARED_BUFFERS=${DB_SHARED_BUFFERS:-256MB}
    - POSTGRES_EFFECTIVE_CACHE_SIZE=${DB_EFFECTIVE_CACHE_SIZE:-1GB}
    - POSTGRES_WORK_MEM=${DB_WORK_MEM:-4MB}
  volumes:
    # Use absolute paths with proper permissions
    - ${PWD}/data/postgres:/var/lib/postgresql/data
    - ${PWD}/postgres-db/data:/docker-entrypoint-initdb.d
    - ${PWD}/postgres-db/exports:/exports
    - ${PWD}/backups:/backups
  # Add these extra settings for permission management
  user: "999:999"
```

## Additional Files to Create

### 1. Redis Configuration File: `redis/redis.conf`

This file should be created if it doesn't exist:

```
# Redis configuration for VPS deployment
# Basic configuration that addresses permission issues

# Set appropriate permissions for PID file
dir /data
pidfile /data/redis_6379.pid

# Set memory limit and policy
maxmemory 400mb
maxmemory-policy allkeys-lru

# Set timeouts
timeout 300
tcp-keepalive 60

# Logging configuration
loglevel notice
logfile /data/redis.log

# Performance tuning
databases 16
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
```

### 2. Database Verification Script: `verify_db.sh`

This script can help diagnose database issues:

```bash
#!/bin/bash
# Database verification script

# Get connection details from environment
source .env

# Check database connectivity
echo "Checking database connection..."
docker-compose exec postgres-db pg_isready -U postgres

# List database tables
echo "Listing database tables..."
docker-compose exec postgres-db psql -U postgres -d "$POSTGRES_DB" -c "\dt"

# Check specific table
echo "Checking firewalls table..."
docker-compose exec postgres-db psql -U postgres -d "$POSTGRES_DB" -c "SELECT COUNT(*) FROM firewalls;"

echo "Database verification complete"
```

## Additional Recommendations

1. **Backup Strategy**: Implement regular database backups
2. **Monitoring**: Set up container monitoring
3. **Logs**: Configure centralized logging
4. **Security**: Implement proper authentication and HTTPS