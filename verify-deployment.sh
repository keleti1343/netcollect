#!/bin/bash
# Deployment verification script for Fortinet Network Collector on VPS

set -e

echo "=== Fortinet Network Collector Deployment Verification ==="
echo "Timestamp: $(date)"
echo

# Determine Docker Compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Load environment variables safely
if [ -f ".env" ]; then
    echo "Loading environment variables from .env..."
    # Use set +e to prevent script exit on sourcing errors
    set +e
    source .env
    source_result=$?
    set -e
    
    if [ $source_result -ne 0 ]; then
        echo "⚠ Warning: Error loading .env file, using defaults"
        POSTGRES_DB="fortinet_network_collector"
    else
        echo "✓ Environment file loaded successfully"
        # Use the database name from .env or default
        POSTGRES_DB="${POSTGRES_DB:-fortinet_network_collector}"
    fi
else
    echo "⚠ Warning: .env file not found, using defaults"
    POSTGRES_DB="fortinet_network_collector"
fi

echo

# Check Docker and Docker Compose
echo "=== Docker Environment ==="
if docker --version; then
    echo "✓ Docker is installed"
else
    echo "✗ Docker is not installed or not accessible"
    exit 1
fi

if $DOCKER_COMPOSE version; then
    echo "✓ Docker Compose is available"
else
    echo "✗ Docker Compose is not available"
    exit 1
fi

echo

# Check container status
echo "=== Container Status ==="
if $DOCKER_COMPOSE ps; then
    echo "✓ Container status retrieved"
else
    echo "⚠ Could not retrieve container status"
fi

echo

# Check individual services
echo "=== Service Health Checks ==="

# PostgreSQL
echo "Checking PostgreSQL..."
if $DOCKER_COMPOSE exec -T postgres-db pg_isready -U postgres 2>/dev/null; then
    echo "✓ PostgreSQL is running and accepting connections"
    
    # Check database exists
    if $DOCKER_COMPOSE exec -T postgres-db psql -U postgres -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
        echo "✓ Database '$POSTGRES_DB' exists"
        
        # Check tables
        table_count=$($DOCKER_COMPOSE exec -T postgres-db psql -U postgres -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
        if [ "$table_count" -gt 0 ]; then
            echo "✓ Database has $table_count tables"
        else
            echo "⚠ Database exists but has no tables"
        fi
    else
        echo "✗ Database '$POSTGRES_DB' does not exist"
    fi
else
    echo "✗ PostgreSQL is not responding"
fi

# Redis
echo "Checking Redis..."
if $DOCKER_COMPOSE exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo "✓ Redis is running and responding"
else
    echo "✗ Redis is not responding"
fi

# API Service
echo "Checking API service..."
if $DOCKER_COMPOSE exec -T fortinet-api curl -f http://localhost:8000/health 2>/dev/null; then
    echo "✓ API service is responding to health checks"
else
    echo "⚠ API service health check failed (may still be starting)"
fi

# Web Service
echo "Checking Web service..."
if $DOCKER_COMPOSE exec -T fortinet-web curl -f http://localhost:3000 2>/dev/null >/dev/null; then
    echo "✓ Web service is responding"
else
    echo "⚠ Web service is not responding (may still be starting)"
fi

echo

# Check external connectivity
echo "=== External Connectivity ==="
echo "Checking external access to services..."

# Check if ports are accessible
if curl -f http://projectsonline.xyz:8000/health 2>/dev/null >/dev/null; then
    echo "✓ API is accessible externally at http://projectsonline.xyz:8000"
else
    echo "⚠ API is not accessible externally (check firewall/port forwarding)"
fi

if curl -f http://projectsonline.xyz:3000 2>/dev/null >/dev/null; then
    echo "✓ Web interface is accessible externally at http://projectsonline.xyz:3000"
else
    echo "⚠ Web interface is not accessible externally (check firewall/port forwarding)"
fi

echo

# Check logs for errors
echo "=== Recent Error Logs ==="
echo "Checking for recent errors in service logs..."

echo "PostgreSQL errors (last 10 lines):"
$DOCKER_COMPOSE logs --tail=10 postgres-db 2>/dev/null | grep -i error || echo "No recent PostgreSQL errors"

echo
echo "Redis errors (last 10 lines):"
$DOCKER_COMPOSE logs --tail=10 redis 2>/dev/null | grep -i error || echo "No recent Redis errors"

echo
echo "API errors (last 10 lines):"
$DOCKER_COMPOSE logs --tail=10 fortinet-api 2>/dev/null | grep -i error || echo "No recent API errors"

echo
echo "Web errors (last 10 lines):"
$DOCKER_COMPOSE logs --tail=10 fortinet-web 2>/dev/null | grep -i error || echo "No recent Web errors"

echo

# System resources
echo "=== System Resources ==="
echo "Disk usage:"
df -h | grep -E "(Filesystem|/dev/)"

echo
echo "Memory usage:"
free -h

echo
echo "Docker system info:"
docker system df

echo

# Final summary
echo "=== Deployment Summary ==="
if $DOCKER_COMPOSE ps | grep -q "Up"; then
    echo "✓ Deployment appears to be running"
    echo "📱 Web Interface: http://projectsonline.xyz:3000"
    echo "🔌 API Endpoint: http://projectsonline.xyz:8000"
    echo "📊 API Health: http://projectsonline.xyz:8000/health"
    echo "📚 API Docs: http://projectsonline.xyz:8000/docs"
else
    echo "⚠ Some services may not be running properly"
    echo "Run 'docker compose logs' to check detailed logs"
fi

echo
echo "Verification completed at $(date)"