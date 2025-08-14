# Fortinet Network Collector - Containerized Deployment

A containerized, load-balanced deployment of the Fortinet Network Collector application with FastAPI backend, Next.js frontend, PostgreSQL database, Redis cache, and Nginx load balancer.

## 🏗️ Architecture

```
┌─────────────────┐
│   Nginx LB      │ ← Entry Point (Port 80/443)
│   (Port 80)     │
└─────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│API-1  │ │API-2  │ ← FastAPI Instances
│:8001  │ │:8002  │
└───────┘ └───────┘
    │         │
┌───▼───┐ ┌──▼────┐
│WEB-1  │ │WEB-2  │ ← Next.js Instances  
│:3001  │ │:3002  │
└───────┘ └───────┘
    │         │
    └────┬────┘
         │
┌────────▼────────┐
│   PostgreSQL    │ ← Postgres Database
│   Redis Cache   │
└─────────────────┘
```

## 📦 Services

| Service | Description | Instances | Ports |
|---------|-------------|-----------|-------|
| **nginx** | Load Balancer & Reverse Proxy | 1 | 80, 443 |
| **fortinet-api** | FastAPI Backend | 2 | 8001, 8002 |
| **fortinet-web** | Next.js Frontend | 2 | 3001, 3002 |
| **supabase-db** | PostgreSQL Database | 1 | 5432 |
| **redis** | Cache & Session Store | 1 | 6379 |
| **testloader** | Load Testing Tool | 1 | - |

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### 1. Clone and Setup

```bash
git clone <your-repo>
cd network_collector_project

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 2. Deploy Production

```bash
# Deploy all services with load balancing
./deploy.sh

# Or manually with docker-compose
docker-compose up -d
```

### 3. Access Application

- **Web Application**: http://localhost
- **API Documentation**: http://localhost/api/docs
- **Health Check**: http://localhost/health

## 🛠️ Multi-Environment Deployment

The enhanced deployment script supports multiple environments with automated configuration:

### Production Deployment (Default)
```bash
# Deploy production with load balancing
./deploy.sh
# or explicitly
./deploy.sh production deploy
```

### Development Environment
```bash
# Deploy development with hot-reload and exposed ports
./deploy.sh development deploy

# Quick development setup
./dev-tools.sh setup    # Auto-generate .env.dev with secure keys
./dev-tools.sh status   # Check development status
```

### Debug Environment
```bash
# Deploy debug environment with enhanced logging
./deploy.sh debug deploy
```

### Development Tools
```bash
./dev-tools.sh setup        # Setup development environment
./dev-tools.sh status       # Show development status
./dev-tools.sh reset-db     # Reset development database
./dev-tools.sh clear-cache  # Clear Redis cache
./dev-tools.sh logs [svc]   # View service logs
./dev-tools.sh connect-db   # Connect to development database
./dev-tools.sh api-key      # Generate new API secret key
```

## 📋 Management Commands

### Enhanced Deploy Script

```bash
# Environment-specific deployment
./deploy.sh [environment] [command]

# Available environments: production, development, debug
./deploy.sh production deploy   # Production deployment
./deploy.sh development deploy  # Development with hot-reload
./deploy.sh debug deploy        # Debug with enhanced logging

# Management commands
./deploy.sh [env] stop      # Stop all services
./deploy.sh [env] restart   # Restart all services
./deploy.sh [env] logs      # View logs
./deploy.sh [env] status    # Show service status
./deploy.sh [env] test      # Run load tests (not in debug)
./deploy.sh [env] build     # Build images only
./deploy.sh [env] clean     # Stop and clean up volumes
./deploy.sh help            # Show detailed help
```

### Environment Files
- **Production**: `.env` (manual configuration required)
- **Development**: `.env.dev` (auto-generated with secure keys)
- **Debug**: `.env.debug` (auto-generated with debug settings)

## 🔧 Troubleshooting

If you encounter build issues or deployment problems, see the comprehensive troubleshooting guide:
- **[BUILD_TROUBLESHOOTING.md](BUILD_TROUBLESHOOTING.md)** - Solutions for common build and deployment issues

### Quick Fixes
```bash
# Reset development environment
./deploy.sh development clean
./dev-tools.sh setup
./deploy.sh development deploy

# Check service status
./dev-tools.sh status

# View service logs
./dev-tools.sh logs [service-name]
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Scale services
docker-compose up -d --scale fortinet-api-1=3

# Rebuild images
docker-compose build --no-cache

# Remove everything including volumes
docker-compose down -v --remove-orphans
```

## 🧪 Load Testing

### Run Load Tests

```bash
# Using deploy script
./deploy.sh test

# Using docker-compose
docker-compose --profile testing run --rm testloader

# Custom load test
docker-compose --profile testing run --rm testloader \
  node scripts/run-tests.js --target http://nginx --concurrency 20 --requests 2000
```

### Test Options

```bash
# Test API endpoints only
docker-compose --profile testing run --rm testloader \
  node scripts/run-tests.js --api-only

# Test web application only  
docker-compose --profile testing run --rm testloader \
  node scripts/run-tests.js --web-only

# Full stack test
docker-compose --profile testing run --rm testloader \
  node scripts/run-tests.js --full
```

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```bash
# Database
POSTGRES_DB=fortinet_network_collector
POSTGRES_PASSWORD=your_secure_password

# Security
API_SECRET_KEY=your_api_secret_key
REDIS_PASSWORD=your_redis_password

# URLs
NEXT_PUBLIC_API_URL=http://localhost/api
```

### Scaling Services

```bash
# Scale API instances
docker-compose up -d --scale fortinet-api-1=3 --scale fortinet-api-2=3

# Scale web instances  
docker-compose up -d --scale fortinet-web-1=2 --scale fortinet-web-2=2
```

### SSL/HTTPS Setup

1. Add SSL certificates to `nginx/ssl/`
2. Uncomment SSL configuration in `nginx/conf.d/default.conf`
3. Update environment variables:

```bash
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
```

## 📊 Monitoring

### Health Checks

All services include health checks:

```bash
# Check all service health
docker-compose ps

# Manual health check
curl http://localhost/health
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nginx
docker-compose logs -f fortinet-api-1

# Follow logs with timestamps
docker-compose logs -f -t
```

### Resource Usage

```bash
# Container stats
docker stats

# Service resource usage
docker-compose top
```

## 🔒 Security

### Production Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up log rotation
- [ ] Enable Redis authentication
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts

### Network Security

- Services are isolated in separate networks
- Database and Redis not exposed externally in production
- Nginx handles SSL termination
- Rate limiting configured

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs

# Check system resources
docker system df
docker system prune
```

**Database connection issues:**
```bash
# Check database status
docker-compose exec supabase-db pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d supabase-db
```

**Load balancer issues:**
```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload
```

### Performance Issues

**High memory usage:**
```bash
# Check container memory
docker stats --no-stream

# Adjust memory limits in docker-compose.yml
```

**Slow response times:**
```bash
# Run load test to identify bottlenecks
./deploy.sh test

# Check database performance
docker-compose exec supabase-db psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 📁 Project Structure

```
├── fortinet-api/           # FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
├── fortinet-web/           # Next.js frontend  
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.js
│   └── app/
├── nginx/                  # Load balancer
│   ├── Dockerfile
│   ├── nginx.conf
│   └── conf.d/
├── redis/                  # Cache service
│   ├── Dockerfile
│   └── redis.conf
├── testloader/             # Load testing
│   ├── Dockerfile
│   ├── package.json
│   └── scripts/
├── supabase/              # Database config
│   └── config.toml
├── docker-compose.yml      # Production config
├── docker-compose.override.yml  # Development overrides
├── .env.example           # Environment template
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test locally
4. Run load tests: `./deploy.sh test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.