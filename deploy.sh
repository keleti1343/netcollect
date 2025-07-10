#!/bin/bash

# Enhanced Fortinet Application Deployment Script for Hostinger VPS
# Multi-environment deployment with production and development support
# Optimized for VPS deployment with permission handling and system configuration

set -e

echo "🚀 Starting Fortinet Application Deployment on VPS"
echo "=================================================="

# VPS Configuration
VPS_IP="31.97.138.198"
DOMAIN_NAME="projectsonline.xyz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default configuration
DEFAULT_ENVIRONMENT="production"
ENVIRONMENT="${1:-$DEFAULT_ENVIRONMENT}"
COMMAND="${2:-deploy}"

# Environment-specific configuration
setup_environment() {
    case "$ENVIRONMENT" in
        "production"|"prod")
            ENVIRONMENT="production"
            COMPOSE_FILES="-f docker-compose.yml"
            ENV_FILE=".env"
            # Use domain name for production health checks
            HEALTH_URL="http://$DOMAIN_NAME"
            API_PORTS="8000"
            WEB_PORTS="3000"
            # Explicitly disable override file for production
            export COMPOSE_FILE="docker-compose.yml"
            ;;
        "development"|"dev")
            ENVIRONMENT="development"
            COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"
            ENV_FILE=".env.dev"
            HEALTH_URL="http://localhost"
            API_PORTS="8001,8002"
            WEB_PORTS="3001,3002"
            ;;
        "debug")
            ENVIRONMENT="debug"
            COMPOSE_FILES="-f docker-compose.yml -f docker-compose.debug.yml"
            ENV_FILE=".env.debug"
            HEALTH_URL="http://localhost"
            API_PORTS="8001,8002"
            WEB_PORTS="3001,3002"
            ;;
        *)
            log_error "Unknown environment: $ENVIRONMENT"
            echo "Supported environments: production, development, debug"
            exit 1
            ;;
    esac
    
    log_info "Environment: $ENVIRONMENT"
    log_info "Compose files: $COMPOSE_FILES"
    log_info "Environment file: $ENV_FILE"
}

# Functions
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

log_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

generate_secret_key() {
    if command -v python3 &> /dev/null; then
        python3 -c "import secrets; print(secrets.token_urlsafe(32))"
    elif command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        log_warning "Cannot generate secure key. Please install Python3 or OpenSSL"
        echo "fallback_key_$(date +%s)_$(shuf -i 1000-9999 -n 1)"
    fi
}

# VPS-specific system configuration check
check_system_configuration() {
    log_info "Checking VPS system configuration requirements..."
    
    # Check for memory overcommit setting (required by Redis)
    OVERCOMMIT_VALUE=$(cat /proc/sys/vm/overcommit_memory 2>/dev/null || echo "0")
    if [ "$OVERCOMMIT_VALUE" != "1" ]; then
        log_warning "Redis requires vm.overcommit_memory=1, current value: $OVERCOMMIT_VALUE"
        log_info "Setting vm.overcommit_memory=1 for current session..."
        
        # Try to set the value for the current session
        if command -v sysctl &> /dev/null; then
            if sudo sysctl vm.overcommit_memory=1 2>/dev/null; then
                log_success "Memory overcommit setting applied for current session"
            else
                log_warning "Failed to set vm.overcommit_memory. Please manually run:"
                echo "echo \"vm.overcommit_memory = 1\" | sudo tee -a /etc/sysctl.conf"
                echo "sudo sysctl vm.overcommit_memory=1"
            fi
        else
            log_warning "sysctl command not found. Please manually configure vm.overcommit_memory=1"
        fi
        
        # Add to sysctl.conf for persistence
        if [ ! -f "/etc/sysctl.conf" ] || ! grep -q "vm.overcommit_memory" "/etc/sysctl.conf" 2>/dev/null; then
            log_info "Adding vm.overcommit_memory=1 to /etc/sysctl.conf for persistence..."
            if echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf 2>/dev/null; then
                log_success "Memory overcommit setting added to /etc/sysctl.conf"
            else
                log_warning "Failed to update /etc/sysctl.conf. Please manually add: vm.overcommit_memory = 1"
            fi
        fi
    else
        log_success "Redis memory overcommit setting correctly configured"
    fi
    
    # Check for locales (required by PostgreSQL)
    if ! locale -a 2>/dev/null | grep -i "en_US.utf8" &> /dev/null; then
        log_warning "en_US.UTF-8 locale not found (required by PostgreSQL)"
        log_info "Attempting to generate required locale..."
        
        if command -v locale-gen &> /dev/null; then
            if sudo locale-gen en_US.UTF-8 2>/dev/null; then
                log_success "Locale en_US.UTF-8 generated successfully"
                sudo update-locale LANG=en_US.UTF-8 2>/dev/null || true
            else
                log_warning "Failed to generate locale. Please manually run:"
                echo "sudo locale-gen en_US.UTF-8"
                echo "sudo update-locale LANG=en_US.UTF-8"
            fi
        else
            log_warning "locale-gen command not found. Please manually configure the en_US.UTF-8 locale"
        fi
    else
        log_success "Required locale en_US.UTF-8 is available"
    fi
    
    log_success "VPS system configuration check completed"
}

# Setup volume permissions for VPS deployment
setup_volume_permissions() {
    log_info "Setting up volume permissions for VPS container data persistence..."
    
    # Create required directories if they don't exist
    mkdir -p ./data/postgres ./data/redis ./data/nginx/logs ./backups
    
    # Set proper permissions for PostgreSQL data directory
    # PostgreSQL runs as user 999 in the container
    log_info "Setting permissions for PostgreSQL data directory..."
    if command -v chown &> /dev/null; then
        if sudo chown -R 999:999 ./data/postgres 2>/dev/null; then
            log_success "PostgreSQL directory permissions set successfully"
        else
            log_warning "Failed to set PostgreSQL directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chown -R 999:999 ./data/postgres"
        fi
    else
        log_warning "chown command not found. Please manually set PostgreSQL directory permissions"
    fi
    
    # Set proper permissions for Redis data directory
    # Redis runs as user 999 in the container
    log_info "Setting permissions for Redis data directory..."
    if command -v chown &> /dev/null; then
        if sudo chown -R 999:999 ./data/redis 2>/dev/null; then
            log_success "Redis directory permissions set successfully"
        else
            log_warning "Failed to set Redis directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chown -R 999:999 ./data/redis"
        fi
    else
        log_warning "chown command not found. Please manually set Redis directory permissions"
    fi
    
    # Set permissions for Nginx logs
    log_info "Setting permissions for Nginx logs directory..."
    if command -v chmod &> /dev/null; then
        if sudo chmod -R 777 ./data/nginx/logs 2>/dev/null; then
            log_success "Nginx logs directory permissions set successfully"
        else
            log_warning "Failed to set Nginx logs directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chmod -R 777 ./data/nginx/logs"
        fi
    else
        log_warning "chmod command not found. Please manually set Nginx logs directory permissions"
    fi
    
    # Set permissions for backup directory
    log_info "Setting permissions for backups directory..."
    if command -v chmod &> /dev/null; then
        if sudo chmod -R 777 ./backups 2>/dev/null; then
            log_success "Backups directory permissions set successfully"
        else
            log_warning "Failed to set backups directory permissions"
            log_warning "If you encounter permission errors, manually run: sudo chmod -R 777 ./backups"
        fi
    else
        log_warning "chmod command not found. Please manually set backups directory permissions"
    fi
    
    log_success "Volume permissions setup completed"
}

# Enhanced database initialization for VPS (schema-first approach)
enhanced_database_init() {
    log_info "Performing enhanced database initialization for VPS..."
    
    # Wait for PostgreSQL to be ready (max 60 seconds)
    log_info "Waiting for PostgreSQL to be ready..."
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt+1))
        
        if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db pg_isready -U postgres 2>/dev/null; then
            log_success "PostgreSQL is ready!"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_warning "PostgreSQL not ready after $max_attempts attempts, continuing anyway"
            return 0
        fi
        
        log_info "Waiting for PostgreSQL... (attempt $attempt/$max_attempts)"
        sleep 2
    done
    
    # Check if schema file exists in container location
    SCHEMA_FILE="/docker-entrypoint-initdb.d/schema.sql"
    log_info "Checking for schema file in container: $SCHEMA_FILE"
    
    # Apply schema if available (with proper error handling)
    if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db test -f "$SCHEMA_FILE"; then
        log_info "Applying database schema with strict error checking..."
        if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db psql -v ON_ERROR_STOP=1 -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -f "$SCHEMA_FILE"; then
            log_success "Database schema applied successfully"
        else
            log_warning "Failed to apply database schema (strict mode), API will handle initialization"
            return 1
        fi
    else
        log_info "No schema file found, database will rely on API migrations"
    fi
    
    # Verify database tables
    log_info "Verifying database tables..."
    if $DOCKER_COMPOSE $COMPOSE_FILES exec -T postgres-db psql -U postgres -d "${POSTGRES_DB:-fortinet_network_collector_dev}" -c "\dt" 2>/dev/null | grep -q "firewalls"; then
        log_success "Database tables verified successfully"
    else
        log_info "Database tables not found, API will create them on startup"
    fi
    
    log_success "Enhanced database initialization completed"
    return 0
}

setup_environment_file() {
    log_info "Setting up environment file: $ENV_FILE"
    
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f ".env.example" ]; then
            log_info "Creating $ENV_FILE from .env.example..."
            cp .env.example "$ENV_FILE"
            
            # Generate API secret key for development/debug environments
            if [ "$ENVIRONMENT" != "production" ]; then
                log_info "Generating API secret key for $ENVIRONMENT environment..."
                SECRET_KEY=$(generate_secret_key)
                
                # Replace placeholder in environment file
                if grep -q "your_api_secret_key_here" "$ENV_FILE"; then
                    sed -i "s/your_api_secret_key_here/$SECRET_KEY/g" "$ENV_FILE"
                    log_success "API secret key generated and set"
                fi
                
                # Set development-specific values
                case "$ENVIRONMENT" in
                    "development")
                        sed -i "s/ENVIRONMENT=production/ENVIRONMENT=development/g" "$ENV_FILE"
                        sed -i "s/NODE_ENV=production/NODE_ENV=development/g" "$ENV_FILE"
                        sed -i "s/fortinet_network_collector/fortinet_network_collector_dev/g" "$ENV_FILE"
                        # Ensure consistent database name format
                        sed -i "s/POSTGRES_DB=.*/POSTGRES_DB=fortinet_network_collector_dev/g" "$ENV_FILE"
                        sed -i "s/your_secure_password_here/dev_password_123/g" "$ENV_FILE"
                        sed -i "s/LOG_LEVEL=INFO/LOG_LEVEL=DEBUG/g" "$ENV_FILE"
                        ;;
                    "debug")
                        sed -i "s/ENVIRONMENT=production/ENVIRONMENT=debug/g" "$ENV_FILE"
                        sed -i "s/NODE_ENV=production/NODE_ENV=development/g" "$ENV_FILE"
                        sed -i "s/fortinet_network_collector/fortinet_network_collector_debug/g" "$ENV_FILE"
                        sed -i "s/your_secure_password_here/debug_password_123/g" "$ENV_FILE"
                        sed -i "s/LOG_LEVEL=INFO/LOG_LEVEL=DEBUG/g" "$ENV_FILE"
                        ;;
                esac
                
                log_success "Environment file configured for $ENVIRONMENT"
            else
                log_warning "Production environment detected. Please manually configure $ENV_FILE with secure values."
                log_warning "Generate API secret key with: python3 -c \"import secrets; print(secrets.token_urlsafe(32))\""
                read -p "Press Enter to continue after configuring $ENV_FILE..."
            fi
        else
            log_error ".env.example file not found. Cannot create $ENV_FILE file."
            exit 1
        fi
    else
        log_success "Environment file $ENV_FILE already exists"
    fi
}

check_requirements() {
    log_info "Checking VPS deployment requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        log_info "Run the VPS setup commands from install_script.md"
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        log_info "Run the VPS setup commands from install_script.md"
        exit 1
    fi
    
    # Use docker compose or docker-compose based on availability
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    # Check for required VPS tools
    log_info "Checking for required VPS system tools..."
    for cmd in python3 curl openssl sudo chmod chown; do
        if ! command -v $cmd &> /dev/null; then
            log_warning "$cmd is not installed but recommended for VPS deployment"
        fi
    done
    
    # Check for Python packages if deploying API
    if [ "$ENVIRONMENT" != "development" ]; then
        log_info "Checking for required Python packages..."
        if command -v pip3 &> /dev/null; then
            # Check for essential packages
            MISSING_PACKAGES=""
            for pkg in fastapi uvicorn gunicorn sqlalchemy psycopg2-binary redis pydantic alembic; do
                if ! pip3 list 2>/dev/null | grep -i "$pkg" &> /dev/null; then
                    MISSING_PACKAGES="$MISSING_PACKAGES $pkg"
                fi
            done
            
            if [ -n "$MISSING_PACKAGES" ]; then
                log_info "Some Python packages may be missing:$MISSING_PACKAGES"
                log_info "These will be installed inside the containers"
            fi
        else
            log_info "pip3 not found, packages will be installed inside containers"
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
        log_info "Node.js not found locally, but will be used inside containers"
    fi
    
    log_success "VPS requirements check passed"
}

build_images() {
    log_info "Building Docker images for $ENVIRONMENT environment..."
    
    # Build all images
    $DOCKER_COMPOSE $COMPOSE_FILES build --no-cache
    
    log_success "Docker images built successfully"
}

deploy_production() {
    log_info "Deploying production environment on VPS..."
    
    # Check VPS system configuration
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
    log_info "Application accessible at: http://$DOMAIN_NAME"
    log_info "Server IP: $VPS_IP"
}

deploy_development() {
    log_info "Deploying development environment..."
    
    # Stop existing services
    log_info "Stopping existing services..."
    $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans
    
    # Start all services (development has different startup order)
    log_info "Starting development services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d
    
    # Wait for services to be ready
    log_info "Waiting for development services to be ready..."
    sleep 20
    
    log_success "Development environment deployed successfully"
    log_info "Development services are running with hot-reload enabled"
    log_info "API services available at: http://localhost:8001, http://localhost:8002"
    log_info "Web services available at: http://localhost:3001, http://localhost:3002"
    log_info "Database available at: localhost:5432"
    log_info "Redis available at: localhost:6379"
}

deploy_debug() {
    log_info "Deploying debug environment..."
    
    # Check if debug compose file exists
    if [ ! -f "docker-compose.debug.yml" ]; then
        log_warning "docker-compose.debug.yml not found. Using development configuration..."
        COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"
    fi
    
    # Stop existing services
    log_info "Stopping existing services..."
    $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans
    
    # Start all services
    log_info "Starting debug services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d
    
    # Wait for services to be ready
    log_info "Waiting for debug services to be ready..."
    sleep 25
    
    log_success "Debug environment deployed successfully"
    log_info "Debug services are running with enhanced logging and debugging tools"
}

deploy_services() {
    case "$ENVIRONMENT" in
        "production")
            deploy_production
            ;;
        "development")
            deploy_development
            ;;
        "debug")
            deploy_debug
            ;;
    esac
}

health_check() {
    log_info "Performing health checks for $ENVIRONMENT environment..."
    
    # Wait a bit for services to fully start
    sleep 10
    
    # Check nginx health
    if curl -f "$HEALTH_URL/health" > /dev/null 2>&1; then
        log_success "Load balancer is healthy"
    else
        log_warning "Load balancer health check failed (this may be normal for development)"
        
        # Try alternative health check for development
        if [ "$ENVIRONMENT" != "production" ]; then
            log_info "Trying alternative health checks for development..."
            
            # Check individual API services
            for port in $(echo $API_PORTS | tr ',' ' '); do
                if curl -f "http://localhost:$port/health" > /dev/null 2>&1; then
                    log_success "API service on port $port is healthy"
                else
                    log_warning "API service on port $port health check failed"
                fi
            done
        fi
    fi
    
    # Check if services are running
    if $DOCKER_COMPOSE $COMPOSE_FILES ps | grep -q "Up"; then
        log_success "Services are running"
    else
        log_error "Some services are not running"
        return 1
    fi
    
    log_success "Health checks completed"
}

show_status() {
    log_info "Deployment Status ($ENVIRONMENT environment):"
    echo ""
    $DOCKER_COMPOSE $COMPOSE_FILES ps
    echo ""
    
    case "$ENVIRONMENT" in
        "production")
            log_info "Production URLs (VPS):"
            echo "  🌐 Web Application: http://$DOMAIN_NAME"
            echo "  🌐 Web Application (IP): http://$VPS_IP"
            echo "  🔧 API Documentation: http://$DOMAIN_NAME/api/docs"
            echo "  ❤️  Health Check: http://$DOMAIN_NAME/health"
            echo "  🖥️  Server IP: $VPS_IP"
            ;;
        "development")
            log_info "Development URLs:"
            echo "  🌐 Web Application: http://localhost (load balanced)"
            echo "  🌐 Web Service 1: http://localhost:3001"
            echo "  🌐 Web Service 2: http://localhost:3002"
            echo "  🔧 API Documentation: http://localhost/api/docs (load balanced)"
            echo "  🔧 API Service 1: http://localhost:8001/docs"
            echo "  🔧 API Service 2: http://localhost:8002/docs"
            echo "  🗄️  Database: localhost:5432"
            echo "  🔴 Redis: localhost:6379"
            echo "  ❤️  Health Check: http://localhost/health"
            ;;
        "debug")
            log_info "Debug URLs:"
            echo "  🌐 Web Application: http://localhost (load balanced)"
            echo "  🌐 Web Service 1: http://localhost:3001"
            echo "  🌐 Web Service 2: http://localhost:3002"
            echo "  🔧 API Documentation: http://localhost/api/docs (load balanced)"
            echo "  🔧 API Service 1: http://localhost:8001/docs"
            echo "  🔧 API Service 2: http://localhost:8002/docs"
            echo "  🗄️  Database: localhost:5432"
            echo "  🔴 Redis: localhost:6379"
            echo "  🐛 Debug Tools: Available with enhanced logging"
            ;;
    esac
    
    echo ""
    log_info "Management Commands:"
    echo "  📋 View logs: $0 $ENVIRONMENT logs"
    echo "  📊 View status: $0 $ENVIRONMENT status"
    echo "  📈 View stats: $0 $ENVIRONMENT stats"
    echo "  � 🛑 Stop services: $0 $ENVIRONMENT stop"
    echo "  🔄 Restart services: $0 $ENVIRONMENT restart"
    if [ "$ENVIRONMENT" != "debug" ]; then
        echo "  🧪 Run tests: $0 $ENVIRONMENT test"
    fi
    echo "  🆘 Help: $0 help"
}

cleanup_on_error() {
    log_error "Deployment failed. Cleaning up..."
    $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans
    exit 1
}

# Main deployment process
main() {
    # Set up error handling
    trap cleanup_on_error ERR
    
    # Setup environment configuration
    setup_environment
    
    # Run deployment steps with VPS enhancements
    check_requirements
    check_system_configuration    # New VPS step
    setup_environment_file
    setup_volume_permissions      # New VPS step
    build_images
    deploy_services
    
    # Health checks
    if health_check; then
        log_success "🎉 $ENVIRONMENT deployment completed successfully on VPS!"
        log_info "🌐 Application URL: http://$DOMAIN_NAME"
        log_info "🖥️  Server IP: $VPS_IP"
        show_status
    else
        log_error "Health checks failed. Please check the logs."
        $DOCKER_COMPOSE $COMPOSE_FILES logs --tail=50
        exit 1
    fi
}

# Command handling
handle_command() {
    setup_environment
    check_requirements
    
    case "$COMMAND" in
        "deploy")
            main
            ;;
        "stop")
            log_info "Stopping all services in $ENVIRONMENT environment..."
            $DOCKER_COMPOSE $COMPOSE_FILES down
            log_success "All services stopped"
            ;;
        "restart")
            log_info "Restarting all services in $ENVIRONMENT environment..."
            $DOCKER_COMPOSE $COMPOSE_FILES restart
            log_success "All services restarted"
            ;;
        "logs")
            log_info "Showing logs for $ENVIRONMENT environment..."
            $DOCKER_COMPOSE $COMPOSE_FILES logs -f
            ;;
        "status")
            setup_environment
            echo "Status for $ENVIRONMENT environment:"
            $DOCKER_COMPOSE $COMPOSE_FILES ps
            ;;
        "stats")
            log_info "Showing real-time container stats for $ENVIRONMENT environment..."
            log_info "Press Ctrl+C to exit stats view"
            echo ""
            
            # Check if containers are running first
            if ! $DOCKER_COMPOSE $COMPOSE_FILES ps | grep -q "Up"; then
                log_error "No containers are currently running in $ENVIRONMENT environment"
                log_info "Start services first with: $0 $ENVIRONMENT deploy"
                exit 1
            fi
            
            # Show stats for all containers
            docker stats fortinet-api-1 fortinet-api-2 fortinet-nginx fortinet-redis postgres-db fortinet-web-1 fortinet-web-2
            ;;
        "test")
            if [ "$ENVIRONMENT" = "debug" ]; then
                log_warning "Load testing not recommended in debug environment"
                exit 1
            fi
            log_info "Running load tests against $ENVIRONMENT environment..."
            $DOCKER_COMPOSE $COMPOSE_FILES --profile testing run --rm testloader
            ;;
        "build")
            log_info "Building images for $ENVIRONMENT environment..."
            build_images
            ;;
        "clean")
            log_info "Cleaning up $ENVIRONMENT environment..."
            $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans --volumes
            docker system prune -f
            log_success "Cleanup completed"
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

show_help() {
    echo "Enhanced Fortinet Application Deployment Script"
    echo "=============================================="
    echo ""
    echo "Usage: $0 [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  production   - Production deployment with load balancing (default)"
    echo "  development  - Development with hot-reload and exposed ports"
    echo "  debug        - Debug environment with enhanced logging"
    echo ""
    echo "Commands:"
    echo "  deploy       - Deploy all services (default)"
    echo "  stop         - Stop all services"
    echo "  restart      - Restart all services"
    echo "  logs         - Show logs from all services"
    echo "  status       - Show status of all services"
    echo "  stats        - Show real-time container resource usage"
    echo "  test         - Run load tests (not available in debug)"
    echo "  build        - Build Docker images only"
    echo "  clean        - Stop services and clean up volumes"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Deploy production (default)"
    echo "  $0 production deploy         # Deploy production explicitly"
    echo "  $0 development deploy        # Deploy development environment"
    echo "  $0 dev logs                  # Show development logs"
    echo "  $0 production stats          # Show production container stats"
    echo "  $0 dev stats                 # Show development container stats"
    echo "  $0 debug deploy              # Deploy debug environment"
    echo "  $0 production stop           # Stop production services"
    echo ""
    echo "Environment Files:"
    echo "  Production:  .env"
    echo "  Development: .env.dev (auto-generated from .env.example)"
    echo "  Debug:       .env.debug (auto-generated from .env.example)"
}

# Parse command line arguments and execute
if [ "$1" = "help" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
fi

# If only one argument and it's a command, use default environment
if [ $# -eq 1 ] && [[ "$1" =~ ^(deploy|stop|restart|logs|status|stats|test|build|clean)$ ]]; then
    ENVIRONMENT="$DEFAULT_ENVIRONMENT"
    COMMAND="$1"
fi

handle_command