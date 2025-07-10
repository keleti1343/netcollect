# Docker Compose Modifications for Hostinger VPS

This document contains specific modifications to the `docker-compose.yml` file to address permission issues, system configuration requirements, and proper service initialization when deploying on Hostinger VPS.

## Issues Identified in Current Docker Compose Configuration

1. **Redis Permission Issues**:
   - Failed to write PID file: Permission denied
   - Container running with incorrect user permissions
   - Need to enable memory overcommit setting

2. **PostgreSQL Issues**:
   - Insecure authentication method (trust)
   - Missing locale configuration
   - Permission denied when creating backups directory
   - Database relation "firewalls" does not exist

3. **Volume Mounting Issues**:
   - Inadequate permissions for persistent data volumes
   - Lack of explicit user/group mappings

## Modified Docker Compose File

Apply these changes to your `docker-compose.yml` file to resolve the identified issues:

```yaml
# ============================================================================
# DOCKER COMPOSE CONFIGURATION FOR HOSTINGER VPS DEPLOYMENT
# ============================================================================
# Modified to address permission issues, proper initialization, and security
# ============================================================================

services:
  # Load Balancer - Modified for VPS
  nginx:
    build: ./nginx
    container_name: fortinet-nginx
    ports:
      - "0.0.0.0:80:80"
      - "0.0.0.0:443:443"
    depends_on:
      - fortinet-api-1
      - fortinet-api-2
      - fortinet-web-1
      - fortinet-web-2
    networks:
      - frontend-network
      - backend-network
    volumes:
      # Use explicit path with proper permissions
      - ${PWD}/data/nginx/logs:/var/log/nginx
    restart: unless-stopped
    # Keep original environment variables...

  # FastAPI Backend Services - Modified for VPS
  fortinet-api-1:
    build: ./fortinet-api
    container_name: fortinet-api-1
    environment:
      # Use explicit password instead of variable interpolation
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres-db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
      - API_PORT=8000
      - ENVIRONMENT=${ENVIRONMENT:-production}
      # Worker Configuration (keep original settings)...
    depends_on:
      postgres-db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend-network
    restart: unless-stopped
    # Add initialization wait command to ensure database is ready
    command: >
      sh -c "
        echo 'Waiting for database...' &&
        until nc -z postgres-db 5432; do sleep 1; done &&
        echo 'Database is ready!' &&
        gunicorn --config gunicorn.conf.py app.main:app
      "
    # Keep original resource limits and healthcheck...

  fortinet-api-2:
    # Same modifications as fortinet-api-1...
    build: ./fortinet-api
    container_name: fortinet-api-2
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres-db:5432/${POSTGRES_DB}
      - REDIS_URL=redis://redis:6379/0
      - API_PORT=8000
      - ENVIRONMENT=${ENVIRONMENT:-production}
      # Worker Configuration (keep original settings)...
    depends_on:
      postgres-db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend-network
    restart: unless-stopped
    # Add initialization wait command to ensure database is ready
    command: >
      sh -c "
        echo 'Waiting for database...' &&
        until nc -z postgres-db 5432; do sleep 1; done &&
        echo 'Database is ready!' &&
        gunicorn --config gunicorn.conf.py app.main:app
      "
    # Keep original resource limits and healthcheck...

  # Next.js Frontend Services - No significant changes needed
  fortinet-web-1:
    # Keep original configuration...
    depends_on:
      - fortinet-api-1
      - fortinet-api-2

  fortinet-web-2:
    # Keep original configuration...
    depends_on:
      - fortinet-api-1
      - fortinet-api-2

  # Database Service - Modified for VPS
  postgres-db:
    build: ./postgres-db
    container_name: postgres-db
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=postgres
      # Change authentication method from trust to md5
      - POSTGRES_HOST_AUTH_METHOD=md5
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      # Add locale settings
      - LANG=en_US.utf8
      - LC_ALL=en_US.utf8
      # Keep performance configuration...
    volumes:
      # Use explicit paths with proper permissions
      - ${PWD}/data/postgres:/var/lib/postgresql/data
      - ${PWD}/postgres-db/data:/docker-entrypoint-initdb.d
      - ${PWD}/postgres-db/exports:/exports
      - ${PWD}/backups:/backups
    networks:
      - backend-network
    restart: unless-stopped
    # Run as specific user for permissions
    user: "999:999"
    # Add init container flag to handle PID 1 properly
    init: true
    # Keep original resource limits...
    healthcheck:
      # Improved healthcheck
      test: ["CMD-SHELL", "pg_isready -U postgres -d ${POSTGRES_DB:-postgres}"]
      interval: ${HEALTH_CHECK_INTERVAL:-30s}
      timeout: ${HEALTH_CHECK_TIMEOUT:-10s}
      retries: ${HEALTH_CHECK_RETRIES:-5}
      start_period: ${HEALTH_CHECK_START_PERIOD:-60s}

  # Redis Cache Service - Modified for VPS
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
      # Use explicit path with proper permissions
      - ${PWD}/data/redis:/data
    networks:
      - backend-network
    restart: unless-stopped
    # Run as specific user for permissions
    user: "999:999"
    # Use modified startup command to ensure proper permissions
    command: >
      sh -c "
        mkdir -p /data &&
        chown -R redis:redis /data &&
        chmod 700 /data &&
        sysctl vm.overcommit_memory=1 || true &&
        redis-server /etc/redis/redis.conf
      "
    # Keep original resource limits...
    healthcheck:
      # Improved healthcheck that works with authentication
      test: ["CMD", "redis-cli", "ping"]
      interval: ${HEALTH_CHECK_INTERVAL:-30s}
      timeout: ${HEALTH_CHECK_TIMEOUT:-10s}
      retries: ${HEALTH_CHECK_RETRIES:-3}
      start_period: ${HEALTH_CHECK_START_PERIOD:-60s}

  # Keep original network and volume configurations...
networks:
  frontend-network:
    driver: bridge
    name: fortinet-frontend
  backend-network:
    driver: bridge
    name: fortinet-backend

volumes:
  postgres-data:
    name: fortinet-postgres-data
    # Add driver_opts for explicit permissions
    driver_opts:
      type: none
      device: ${PWD}/data/postgres
      o: bind
  redis-data:
    name: fortinet-redis-data
    # Add driver_opts for explicit permissions
    driver_opts:
      type: none
      device: ${PWD}/data/redis
      o: bind
  nginx-logs:
    name: fortinet-nginx-logs
    # Add driver_opts for explicit permissions
    driver_opts:
      type: none
      device: ${PWD}/data/nginx/logs
      o: bind
```

## Additional Docker Compose Best Practices for VPS Deployment

1. **Use Named Volumes with Explicit Paths**
   - Replace Docker-managed volumes with host-mapped volumes with explicit paths
   - Create these directories beforehand with proper permissions

2. **Health Checks and Dependencies**
   - Add `condition: service_healthy` to service dependencies
   - Implement proper health checks for each service

3. **User Permissions**
   - Use explicit user IDs (999:999 for PostgreSQL and Redis)
   - Configure proper ownership in volume directories

4. **Init Containers**
   - Use init flag to properly handle PID 1 processes
   - Add initialization scripts for proper startup sequencing

5. **Security Considerations**
   - Change PostgreSQL auth from trust to md5
   - Use environment variables for passwords
   - Consider implementing TLS for services

## Implementation Steps

1. Make a backup of the original docker-compose.yml
2. Apply the modifications above
3. Create the necessary directories with proper permissions:
   ```bash
   mkdir -p ./data/postgres ./data/redis ./data/nginx/logs ./backups
   chmod -R 777 ./data ./backups
   ```
4. Update the environment variables in .env file
5. Deploy using the enhanced deploy script