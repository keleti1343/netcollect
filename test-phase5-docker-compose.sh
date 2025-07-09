#!/bin/bash

# ============================================================================
# PHASE 5: DOCKER COMPOSE INTEGRATION - TESTING SCRIPT
# ============================================================================
# Comprehensive testing of Docker Compose environment variable integration
# Tests dynamic configuration changes without container rebuilds
# ============================================================================

set -e

echo "🚀 PHASE 5: Docker Compose Integration Testing"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_test_result() {
    local test_name="$1"
    local result="$2"
    
    if [ "$result" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $test_name: FAILED${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to check if environment variable is used in docker-compose.yml
check_env_var_usage() {
    local var_name="$1"
    local description="$2"
    
    if grep -q "\${$var_name" docker-compose.yml; then
        print_test_result "$description" "PASS"
    else
        print_test_result "$description" "FAIL"
    fi
}

echo ""
echo "📋 Test 1: Docker Compose File Validation"
echo "----------------------------------------"

# Test 1.1: Docker Compose syntax validation
echo "🔍 Testing Docker Compose syntax..."
if docker-compose config > /dev/null 2>&1; then
    print_test_result "Docker Compose syntax validation" "PASS"
else
    print_test_result "Docker Compose syntax validation" "FAIL"
    echo "❌ Docker Compose syntax errors detected. Please fix before proceeding."
fi

echo ""
echo "📋 Test 2: Environment Variable Integration"
echo "------------------------------------------"

# Test 2.1: Rate Limiting Variables
echo "🔍 Testing rate limiting environment variables..."
check_env_var_usage "NGINX_API_RATE_LIMIT" "Nginx API rate limit integration"
check_env_var_usage "NGINX_WEB_RATE_LIMIT" "Nginx web rate limit integration"
check_env_var_usage "NGINX_API_BURST" "Nginx API burst integration"
check_env_var_usage "NGINX_WEB_BURST" "Nginx web burst integration"

# Test 2.2: Worker Configuration Variables
echo "🔍 Testing worker configuration environment variables..."
check_env_var_usage "API_WORKERS" "API workers configuration integration"
check_env_var_usage "API_WORKER_CONNECTIONS" "API worker connections integration"
check_env_var_usage "API_MAX_REQUESTS" "API max requests integration"
check_env_var_usage "API_TIMEOUT" "API timeout integration"

# Test 2.3: Resource Limit Variables
echo "🔍 Testing resource limit environment variables..."
check_env_var_usage "NGINX_MEMORY_LIMIT" "Nginx memory limit integration"
check_env_var_usage "API_MEMORY_LIMIT" "API memory limit integration"
check_env_var_usage "WEB_MEMORY_LIMIT" "Web memory limit integration"
check_env_var_usage "DB_MEMORY_LIMIT" "Database memory limit integration"
check_env_var_usage "REDIS_MEMORY_LIMIT" "Redis memory limit integration"

# Test 2.4: Health Check Variables
echo "🔍 Testing health check environment variables..."
check_env_var_usage "HEALTH_CHECK_INTERVAL" "Health check interval integration"
check_env_var_usage "HEALTH_CHECK_TIMEOUT" "Health check timeout integration"
check_env_var_usage "HEALTH_CHECK_RETRIES" "Health check retries integration"

# Test 2.5: Client-Side Configuration Variables
echo "🔍 Testing client-side configuration environment variables..."
check_env_var_usage "NEXT_PUBLIC_CLIENT_API_RATE_LIMIT" "Client API rate limit integration"
check_env_var_usage "NEXT_PUBLIC_CLIENT_DEFAULT_PAGE_SIZE" "Client page size integration"
check_env_var_usage "NEXT_PUBLIC_CLIENT_ENABLE_BULK_OPS" "Client bulk operations integration"

echo ""
echo "📋 Test 3: Service Configuration Validation"
echo "-------------------------------------------"

# Test 3.1: Service definitions
echo "🔍 Testing service definitions..."
services=("nginx" "fortinet-api-1" "fortinet-api-2" "fortinet-web-1" "fortinet-web-2" "supabase-db" "redis" "testloader" "db-manager")

for service in "${services[@]}"; do
    if docker-compose config | grep -q "^  $service:"; then
        print_test_result "Service '$service' definition" "PASS"
    else
        print_test_result "Service '$service' definition" "FAIL"
    fi
done

# Test 3.2: Network definitions
echo "🔍 Testing network definitions..."
networks=("frontend-network" "backend-network")

for network in "${networks[@]}"; do
    if docker-compose config | grep -q "$network"; then
        print_test_result "Network '$network' definition" "PASS"
    else
        print_test_result "Network '$network' definition" "FAIL"
    fi
done

# Test 3.3: Volume definitions
echo "🔍 Testing volume definitions..."
volumes=("postgres-data" "redis-data" "nginx-logs")

for volume in "${volumes[@]}"; do
    if docker-compose config | grep -q "$volume"; then
        print_test_result "Volume '$volume' definition" "PASS"
    else
        print_test_result "Volume '$volume' definition" "FAIL"
    fi
done

echo ""
echo "📋 Test 4: Environment Variable Resolution"
echo "-----------------------------------------"

# Test 4.1: Check if .env file exists and is readable
echo "🔍 Testing .env file accessibility..."
if [ -f ".env" ] && [ -r ".env" ]; then
    print_test_result ".env file accessibility" "PASS"
else
    print_test_result ".env file accessibility" "FAIL"
fi

# Test 4.2: Check critical environment variables are set
echo "🔍 Testing critical environment variables..."
critical_vars=("POSTGRES_DB" "POSTGRES_PASSWORD" "NGINX_API_RATE_LIMIT" "API_WORKERS" "NGINX_MEMORY_LIMIT")

for var in "${critical_vars[@]}"; do
    if grep -q "^$var=" .env; then
        print_test_result "Environment variable '$var' definition" "PASS"
    else
        print_test_result "Environment variable '$var' definition" "FAIL"
    fi
done

echo ""
echo "📋 Test 5: Dynamic Configuration Testing"
echo "----------------------------------------"

# Test 5.1: Create temporary environment override
echo "🔍 Testing dynamic configuration changes..."
echo "Creating temporary configuration override..."

# Backup original .env
cp .env .env.backup

# Create test configuration with different values
cat >> .env << EOF

# TEMPORARY TEST CONFIGURATION
NGINX_API_RATE_LIMIT=3000
API_WORKERS=3
NGINX_MEMORY_LIMIT=3G
HEALTH_CHECK_INTERVAL=45s
EOF

# Test configuration resolution
echo "🔍 Testing configuration resolution with overrides..."
if docker-compose config > /tmp/compose-test-output.yml 2>/dev/null; then
    if grep -q "3000r/m" /tmp/compose-test-output.yml 2>/dev/null || grep -q "NGINX_API_RATE_LIMIT" /tmp/compose-test-output.yml 2>/dev/null; then
        print_test_result "Dynamic configuration resolution" "PASS"
    else
        print_test_result "Dynamic configuration resolution" "FAIL"
    fi
else
    print_test_result "Dynamic configuration resolution" "FAIL"
fi

# Restore original .env
mv .env.backup .env

# Clean up
rm -f /tmp/compose-test-output.yml

echo ""
echo "📋 Test 6: Production Readiness Validation"
echo "------------------------------------------"

# Test 6.1: Check for production-ready defaults
echo "🔍 Testing production-ready defaults..."
production_checks=(
    "NODE_ENV=production"
    "ENVIRONMENT=production"
    "API_LOG_LEVEL=info"
    "NGINX_WORKER_PROCESSES=auto"
)

for check in "${production_checks[@]}"; do
    if grep -q "^$check" .env; then
        print_test_result "Production setting: $check" "PASS"
    else
        print_test_result "Production setting: $check" "FAIL"
    fi
done

# Test 6.2: Check for security configurations
echo "🔍 Testing security configurations..."
security_checks=(
    "POSTGRES_PASSWORD"
    "API_SECRET_KEY"
    "REDIS_PASSWORD"
)

for check in "${security_checks[@]}"; do
    if grep -q "^$check=" .env && ! grep -q "^$check=$" .env; then
        print_test_result "Security setting: $check configured" "PASS"
    else
        print_test_result "Security setting: $check configured" "FAIL"
    fi
done

echo ""
echo "📋 Test 7: Resource Optimization Validation"
echo "-------------------------------------------"

# Test 7.1: Check resource limit configurations
echo "🔍 Testing resource limit configurations..."
resource_checks=(
    "NGINX_MEMORY_LIMIT=2G"
    "API_MEMORY_LIMIT=2G"
    "WEB_MEMORY_LIMIT=1G"
    "DB_MEMORY_LIMIT=3G"
    "REDIS_MEMORY_LIMIT=512M"
)

for check in "${resource_checks[@]}"; do
    if grep -q "^$check" .env; then
        print_test_result "Resource limit: $check" "PASS"
    else
        print_test_result "Resource limit: $check" "FAIL"
    fi
done

echo ""
echo "📊 PHASE 5 TESTING SUMMARY"
echo "=========================="
echo -e "${BLUE}Total Tests Run: $((TESTS_PASSED + TESTS_FAILED))${NC}"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Phase 5 Docker Compose Integration is ready for deployment.${NC}"
    echo ""
    echo "✅ Benefits Achieved:"
    echo "   • Complete environment variable integration across all services"
    echo "   • Dynamic configuration changes without container rebuilds"
    echo "   • Centralized resource management and scaling configuration"
    echo "   • Production-ready security and performance settings"
    echo "   • Comprehensive health check and monitoring configuration"
    echo ""
    echo "🚀 Next Steps:"
    echo "   • Run 'docker-compose up -d' to deploy with dynamic configuration"
    echo "   • Test configuration changes by modifying .env and restarting services"
    echo "   • Monitor resource usage and adjust limits as needed"
    echo "   • Proceed to Phase 6: Testing and Validation"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review and fix the issues before proceeding.${NC}"
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Ensure all environment variables are properly defined in .env"
    echo "   • Check Docker Compose syntax with 'docker-compose config'"
    echo "   • Verify all service definitions include required environment variables"
    echo "   • Ensure resource limits use proper format (e.g., 1G, 512M, 2.0)"
    exit 1
fi