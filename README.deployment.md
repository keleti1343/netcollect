# Enhanced Multi-Environment Deployment Guide

This guide covers the enhanced deployment script that supports production, development, and debug environments for the Fortinet Network Collector application.

## Overview

The enhanced [`deploy.sh`](deploy.sh) script provides:
- **Multi-environment support**: Production, Development, and Debug
- **Automated secret generation** for non-production environments
- **Environment-specific configurations** and health checks
- **Simplified command interface** with comprehensive help

## Quick Start

### Production Deployment
```bash
# Deploy production (default)
./deploy.sh
# or explicitly
./deploy.sh production deploy
```

### Development Deployment
```bash
# Deploy development environment with hot-reload
./deploy.sh development deploy
```

### Debug Deployment
```bash
# Deploy debug environment with enhanced logging
./deploy.sh debug deploy
```

## Environment Configurations

### Production Environment
- **Compose Files**: `docker-compose.yml`
- **Environment File**: `.env`
- **Features**: Load balancing, production optimizations, security hardening
- **Services**: 2x API instances, 2x Web instances, Load balancer, Database, Redis

### Development Environment
- **Compose Files**: `docker-compose.yml` + `docker-compose.override.yml`
- **Environment File**: `.env.dev` (auto-generated)
- **Features**: Hot-reload, exposed ports, development database, debug logging
- **Services**: Same as production but with development configurations

### Debug Environment
- **Compose Files**: `docker-compose.yml` + `docker-compose.debug.yml` (fallback to override)
- **Environment File**: `.env.debug` (auto-generated)
- **Features**: Enhanced logging, debugging tools, minimal performance settings
- **Services**: Same as development with additional debug capabilities

## Available Commands

### Deployment Commands
```bash
./deploy.sh [environment] deploy    # Deploy all services
./deploy.sh [environment] build     # Build Docker images only
./deploy.sh [environment] stop      # Stop all services
./deploy.sh [environment] restart   # Restart all services
./deploy.sh [environment] clean     # Stop and clean up volumes
```

### Monitoring Commands
```bash
./deploy.sh [environment] status    # Show service status
./deploy.sh [environment] logs      # Show live logs
./deploy.sh [environment] test      # Run load tests (not in debug)
```

### Help
```bash
./deploy.sh help                    # Show detailed help
```

## Environment Files

### Automatic Generation
The script automatically generates environment files for development and debug:
- **Development**: `.env.dev` - Generated from `.env.example` with dev settings
- **Debug**: `.env.debug` - Generated from `.env.example` with debug settings
- **Production**: `.env` - Must be manually configured with secure values

### Secret Generation
For non-production environments, the script automatically:
1. Generates secure API secret keys using Python's `secrets` module
2. Sets development-appropriate database names and passwords
3. Configures debug logging levels
4. Sets relaxed security settings for local development

## Service Access

### Production URLs
- **Web Application**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/health

### Development URLs
- **Load Balanced Web**: http://localhost
- **Web Service 1**: http://localhost:3001
- **Web Service 2**: http://localhost:3002
- **Load Balanced API**: http://localhost/api/docs
- **API Service 1**: http://localhost:8001/docs
- **API Service 2**: http://localhost:8002/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

### Debug URLs
Same as development with additional debug endpoints and enhanced logging.

## Health Checks

### Production
- Load balancer health endpoint
- Service scaling verification
- Production-grade health monitoring

### Development/Debug
- Individual service health checks
- Exposed port verification
- Development tool accessibility
- Hot-reload functionality

## Security Considerations

### Production
- Requires manual configuration of secure passwords and API keys
- SSL/TLS configuration support
- Restricted CORS origins
- Production security headers

### Development/Debug
- Auto-generated development passwords (not secure)
- Relaxed CORS settings for local development
- Debug endpoints enabled
- Verbose logging (may contain sensitive data)

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chmod +x deploy.sh
   ```

2. **Docker Not Found**
   - Install Docker and Docker Compose
   - Ensure Docker daemon is running

3. **Port Conflicts**
   - Check if ports 80, 3001, 3002, 8001, 8002, 5432, 6379 are available
   - Stop conflicting services

4. **Environment File Issues**
   - Ensure `.env.example` exists for auto-generation
   - Manually create environment files if needed

### Logs and Debugging
```bash
# View all logs
./deploy.sh [environment] logs

# View specific service logs
docker-compose -f docker-compose.yml logs [service-name]

# Check service status
./deploy.sh [environment] status
```

## Advanced Usage

### Custom Environment Files
You can create custom environment files and modify the script to use them:
```bash
# Edit the script to add custom environments
# Add case statements in setup_environment() function
```

### Service Scaling
For production scaling, modify the docker-compose.yml:
```yaml
# Add more service instances
fortinet-api-3:
  # ... configuration
```

### Load Testing
```bash
# Run load tests (production/development only)
./deploy.sh production test
./deploy.sh development test
```

## Migration from Old Script

The enhanced script is backward compatible:
- `./deploy.sh` still deploys production (default behavior)
- All existing commands work with explicit environment specification
- New features are additive and don't break existing workflows

## Environment Variables Reference

### Required Variables
- `POSTGRES_DB`: Database name
- `POSTGRES_PASSWORD`: Database password
- `API_SECRET_KEY`: JWT signing key

### Optional Variables
- `REDIS_PASSWORD`: Redis authentication
- `SSL_CERT_PATH`: SSL certificate path
- `SSL_KEY_PATH`: SSL private key path
- `LOG_LEVEL`: Logging level (INFO, DEBUG, ERROR)

### Auto-Generated Variables
For development/debug environments, these are automatically set:
- Database names with environment suffix
- Development passwords
- Debug logging levels
- Relaxed security settings

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review logs with `./deploy.sh [environment] logs`
3. Verify service status with `./deploy.sh [environment] status`
4. Ensure all requirements are met (Docker, Docker Compose)