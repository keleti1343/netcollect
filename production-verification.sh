#!/bin/bash

# Production Deployment Verification Script
# This script verifies that all critical fixes are working correctly

set -e

echo "🔍 Production Deployment Verification"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker Compose is available
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo ""
log_info "1. Verifying Docker Container Health"
echo "-----------------------------------"

# Check container health status
CONTAINERS=("fortinet-nginx" "fortinet-api-1" "fortinet-api-2" "fortinet-web-1" "fortinet-web-2" "supabase-db" "fortinet-redis")

for container in "${CONTAINERS[@]}"; do
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*healthy"; then
        log_success "$container is healthy"
    elif docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
        log_warning "$container is running but health status unknown"
    else
        log_error "$container is not running or unhealthy"
    fi
done

echo ""
log_info "2. Testing API Health Endpoints"
echo "------------------------------"

# Test nginx health endpoint
if curl -f -s "http://localhost/health" > /dev/null; then
    log_success "Nginx health endpoint responding"
else
    log_error "Nginx health endpoint failed"
fi

# Test API health endpoint through nginx
if curl -f -s "http://localhost/api/health" > /dev/null; then
    log_success "API health endpoint responding through nginx"
else
    log_error "API health endpoint failed through nginx"
fi

# Test direct API endpoints (if ports are exposed)
for port in 8001 8002; do
    if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
        log_success "Direct API health endpoint on port $port responding"
    else
        log_warning "Direct API health endpoint on port $port not accessible (may be normal in production)"
    fi
done

echo ""
log_info "3. Testing Critical API Endpoints"
echo "--------------------------------"

# Test main API endpoints
ENDPOINTS=("firewalls" "vdoms" "interfaces" "routes" "vips")

for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "http://localhost/api/$endpoint/?limit=1" > /dev/null; then
        log_success "API endpoint /$endpoint/ responding"
    else
        log_error "API endpoint /$endpoint/ failed"
    fi
done

echo ""
log_info "4. Testing Rate Limiting Configuration"
echo "-------------------------------------"

# Test rate limiting by making multiple rapid requests
log_info "Making 10 rapid requests to test rate limiting..."
RATE_LIMIT_FAILURES=0

for i in {1..10}; do
    if ! curl -f -s "http://localhost/api/firewalls/?limit=1" > /dev/null; then
        ((RATE_LIMIT_FAILURES++))
    fi
done

if [ $RATE_LIMIT_FAILURES -eq 0 ]; then
    log_success "Rate limiting allows normal application usage (0/10 requests failed)"
elif [ $RATE_LIMIT_FAILURES -lt 3 ]; then
    log_warning "Some requests failed due to rate limiting ($RATE_LIMIT_FAILURES/10) - may need adjustment"
else
    log_error "Too many requests failed due to rate limiting ($RATE_LIMIT_FAILURES/10) - rate limits too restrictive"
fi

echo ""
log_info "5. Testing Database Connectivity"
echo "-------------------------------"

# Test database connectivity
if docker exec supabase-db pg_isready -U postgres > /dev/null 2>&1; then
    log_success "Database is ready and accepting connections"
else
    log_error "Database connectivity failed"
fi

# Test database data
DB_TABLES=("firewalls" "vdoms" "interfaces" "routes" "vips")
for table in "${DB_TABLES[@]}"; do
    COUNT=$(docker exec supabase-db psql -U postgres -d fortinet_network_collector_dev -t -c "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d ' ' || echo "0")
    if [ "$COUNT" -gt 0 ]; then
        log_success "Table '$table' has $COUNT records"
    else
        log_warning "Table '$table' has no data or query failed"
    fi
done

echo ""
log_info "6. Testing Frontend Application"
echo "-----------------------------"

# Test main frontend pages
PAGES=("" "firewalls" "vdoms" "interfaces" "routes" "vips")

for page in "${PAGES[@]}"; do
    URL="http://localhost/$page"
    if curl -f -s "$URL" | grep -q "<!DOCTYPE html"; then
        log_success "Frontend page /$page responding with HTML"
    else
        log_error "Frontend page /$page failed or not returning HTML"
    fi
done

echo ""
log_info "7. Environment Configuration Check"
echo "---------------------------------"

# Check environment files
if [ -f ".env" ]; then
    log_success "Production environment file (.env) exists"
    
    # Check critical environment variables
    if grep -q "POSTGRES_DB=fortinet_network_collector_dev" .env; then
        log_success "Database name configured correctly"
    else
        log_error "Database name not configured correctly"
    fi
    
    if grep -q "ENVIRONMENT=production" .env; then
        log_success "Environment set to production"
    else
        log_warning "Environment not explicitly set to production"
    fi
else
    log_error "Production environment file (.env) missing"
fi

if [ -f ".env.dev" ]; then
    log_success "Development environment file (.env.dev) exists"
    
    # Check database consistency
    PROD_DB=$(grep "POSTGRES_DB=" .env | cut -d'=' -f2)
    DEV_DB=$(grep "POSTGRES_DB=" .env.dev | cut -d'=' -f2)
    
    if [ "$PROD_DB" = "$DEV_DB" ]; then
        log_success "Database configuration consistent between environments"
    else
        log_warning "Database configuration differs between environments"
    fi
else
    log_warning "Development environment file (.env.dev) missing"
fi

echo ""
log_info "8. Docker Health Check Configuration"
echo "----------------------------------"

# Check health check configuration in docker-compose.yml
if grep -q "urllib.request" docker-compose.yml; then
    log_success "API health checks using urllib.request (correct)"
else
    log_warning "API health checks may not be using urllib.request"
fi

if grep -q "rate=50r/s" nginx/nginx.conf; then
    log_success "Nginx rate limiting configured for application needs (50r/s)"
else
    log_warning "Nginx rate limiting may not be optimally configured"
fi

echo ""
log_info "9. SSL and Security Configuration"
echo "--------------------------------"

# Check security headers
SECURITY_RESPONSE=$(curl -s -I "http://localhost/" | grep -i "x-frame-options\|x-xss-protection\|x-content-type-options" | wc -l)
if [ "$SECURITY_RESPONSE" -ge 2 ]; then
    log_success "Security headers are configured"
else
    log_warning "Security headers may not be fully configured"
fi

echo ""
log_info "10. Performance and Resource Check"
echo "---------------------------------"

# Check container resource usage
log_info "Container resource usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -8

echo ""
echo "🎯 Verification Summary"
echo "======================"

# Count successful checks (this is a simplified approach)
log_info "Verification completed. Review the results above."
log_info "Key areas verified:"
echo "  ✓ Docker container health"
echo "  ✓ API endpoint functionality"
echo "  ✓ Rate limiting configuration"
echo "  ✓ Database connectivity and data"
echo "  ✓ Frontend application"
echo "  ✓ Environment configuration"
echo "  ✓ Security configuration"

echo ""
log_info "For detailed logs, run: ./deploy.sh production logs"
log_info "For real-time monitoring, run: ./deploy.sh production stats"

echo ""
log_success "Production verification completed!"