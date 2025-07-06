#!/bin/bash

# Development Tools Script
# Quick utilities for development environment management

set -e

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

# Generate API secret key
generate_api_key() {
    log_info "Generating secure API secret key..."
    if command -v python3 &> /dev/null; then
        SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
        echo "$SECRET_KEY"
        log_success "API secret key generated"
    elif command -v openssl &> /dev/null; then
        SECRET_KEY=$(openssl rand -base64 32)
        echo "$SECRET_KEY"
        log_success "API secret key generated"
    else
        log_error "Cannot generate secure key. Please install Python3 or OpenSSL"
        exit 1
    fi
}

# Setup development environment
setup_dev() {
    log_info "Setting up development environment..."
    
    # Create .env.dev if it doesn't exist
    if [ ! -f ".env.dev" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.dev
            log_success "Created .env.dev from .env.example"
            
            # Generate and set API key
            SECRET_KEY=$(generate_api_key)
            sed -i "s/your_api_secret_key_here/$SECRET_KEY/g" .env.dev
            
            # Set development values
            sed -i "s/ENVIRONMENT=production/ENVIRONMENT=development/g" .env.dev
            sed -i "s/NODE_ENV=production/NODE_ENV=development/g" .env.dev
            sed -i "s/fortinet_network_collector/fortinet_network_collector_dev/g" .env.dev
            sed -i "s/your_secure_password_here/dev_password_123/g" .env.dev
            sed -i "s/LOG_LEVEL=INFO/LOG_LEVEL=DEBUG/g" .env.dev
            
            log_success "Development environment configured"
        else
            log_error ".env.example not found"
            exit 1
        fi
    else
        log_warning ".env.dev already exists"
    fi
}

# Reset development database
reset_dev_db() {
    log_info "Resetting development database..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml stop supabase-db
    docker-compose -f docker-compose.yml -f docker-compose.override.yml rm -f supabase-db
    docker volume rm fortinet-postgres-data 2>/dev/null || true
    log_success "Development database reset"
}

# Clear Redis cache
clear_cache() {
    log_info "Clearing Redis cache..."
    if docker-compose -f docker-compose.yml -f docker-compose.override.yml ps redis | grep -q "Up"; then
        docker-compose -f docker-compose.yml -f docker-compose.override.yml exec redis redis-cli FLUSHALL
        log_success "Redis cache cleared"
    else
        log_warning "Redis is not running"
    fi
}

# Show development status
dev_status() {
    log_info "Development Environment Status:"
    echo ""
    
    # Check if services are running
    if docker-compose -f docker-compose.yml -f docker-compose.override.yml ps | grep -q "Up"; then
        log_success "Development services are running"
        echo ""
        docker-compose -f docker-compose.yml -f docker-compose.override.yml ps
        echo ""
        
        log_info "Development URLs:"
        echo "  🌐 Web (Load Balanced): http://localhost"
        echo "  🌐 Web Service 1: http://localhost:3001"
        echo "  🌐 Web Service 2: http://localhost:3002"
        echo "  🔧 API (Load Balanced): http://localhost/api/docs"
        echo "  🔧 API Service 1: http://localhost:8001/docs"
        echo "  🔧 API Service 2: http://localhost:8002/docs"
        echo "  🗄️  Database: localhost:5432"
        echo "  🔴 Redis: localhost:6379"
    else
        log_warning "Development services are not running"
        echo "Start with: ./deploy.sh development deploy"
    fi
}

# View logs for specific service
view_logs() {
    SERVICE="$1"
    if [ -z "$SERVICE" ]; then
        log_info "Available services:"
        docker-compose -f docker-compose.yml -f docker-compose.override.yml config --services
        echo ""
        log_info "Usage: $0 logs <service-name>"
        return
    fi
    
    log_info "Showing logs for $SERVICE..."
    docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f "$SERVICE"
}

# Connect to development database
connect_db() {
    log_info "Connecting to development database..."
    if docker-compose -f docker-compose.yml -f docker-compose.override.yml ps supabase-db | grep -q "Up"; then
        docker-compose -f docker-compose.yml -f docker-compose.override.yml exec supabase-db psql -U postgres -d fortinet_network_collector_dev
    else
        log_error "Development database is not running"
        log_info "Start with: ./deploy.sh development deploy"
    fi
}

# Show help
show_help() {
    echo "Development Tools for Fortinet Network Collector"
    echo "=============================================="
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  setup        - Setup development environment (.env.dev)"
    echo "  status       - Show development environment status"
    echo "  reset-db     - Reset development database"
    echo "  clear-cache  - Clear Redis cache"
    echo "  logs [svc]   - View logs (optionally for specific service)"
    echo "  connect-db   - Connect to development database"
    echo "  api-key      - Generate new API secret key"
    echo "  help         - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup              # Setup development environment"
    echo "  $0 status             # Check development status"
    echo "  $0 logs fortinet-api-1  # View API service logs"
    echo "  $0 reset-db           # Reset development database"
}

# Main command handling
case "${1:-help}" in
    "setup")
        setup_dev
        ;;
    "status")
        dev_status
        ;;
    "reset-db")
        reset_dev_db
        ;;
    "clear-cache")
        clear_cache
        ;;
    "logs")
        view_logs "$2"
        ;;
    "connect-db")
        connect_db
        ;;
    "api-key")
        generate_api_key
        ;;
    "help")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac