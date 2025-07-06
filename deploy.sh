#!/bin/bash

# Enhanced Fortinet Application Deployment Script
# Multi-environment deployment with production and development support

set -e

echo "🚀 Starting Fortinet Application Deployment"
echo "=========================================="

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
            HEALTH_URL="http://localhost"
            API_PORTS="8000"
            WEB_PORTS="3000"
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
    log_info "Checking requirements..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Use docker compose or docker-compose based on availability
    if docker compose version &> /dev/null; then
        DOCKER_COMPOSE="docker compose"
    else
        DOCKER_COMPOSE="docker-compose"
    fi
    
    log_success "Requirements check passed"
}

build_images() {
    log_info "Building Docker images for $ENVIRONMENT environment..."
    
    # Build all images
    $DOCKER_COMPOSE $COMPOSE_FILES build --no-cache
    
    log_success "Docker images built successfully"
}

deploy_production() {
    log_info "Deploying production environment..."
    
    # Stop existing services
    log_info "Stopping existing services..."
    $DOCKER_COMPOSE $COMPOSE_FILES down --remove-orphans
    
    # Start database and cache first
    log_info "Starting database and cache services..."
    $DOCKER_COMPOSE $COMPOSE_FILES up -d supabase-db redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 30
    
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
    
    log_success "Production environment deployed successfully"
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
            log_info "Production URLs:"
            echo "  🌐 Web Application: http://localhost"
            echo "  🔧 API Documentation: http://localhost/api/docs"
            echo "  ❤️  Health Check: http://localhost/health"
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
    
    # Run deployment steps
    check_requirements
    setup_environment_file
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
            docker stats fortinet-api-1 fortinet-api-2 fortinet-nginx fortinet-redis fortinet-supabase-db fortinet-web-1 fortinet-web-2
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