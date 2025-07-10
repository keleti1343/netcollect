# VPS Deployment Guide - Fortinet Network Collector

## Quick Start

Your deployment scripts have been enhanced for VPS deployment. Follow these steps to deploy on your Hostinger VPS:

### 1. Pre-Deployment Checklist

```bash
# Ensure you're in the project directory
cd /path/to/network_collector_project

# Verify all required files exist
ls -la deploy.sh init-db.sh verify-deployment.sh
ls -la docker-compose.yml .env
ls -la postgres-db/data/schema.sql
```

### 2. Deploy the Application

```bash
# Run the enhanced deployment script
./deploy.sh

# The script will automatically:
# - Check system configuration (Redis memory overcommit, locales)
# - Set up proper volume permissions
# - Deploy containers with Docker Compose
# - Initialize the database
# - Verify deployment
```

### 3. Manual Database Initialization (if needed)

If database initialization fails during deployment:

```bash
# Run the dedicated database initialization script
./init-db.sh
```

### 4. Verify Deployment

```bash
# Run comprehensive deployment verification
./verify-deployment.sh
```

## Access Your Application

After successful deployment:

- **Web Interface**: http://projectsonline.xyz:3000
- **API Endpoint**: http://projectsonline.xyz:8000
- **API Documentation**: http://projectsonline.xyz:8000/docs
- **API Health Check**: http://projectsonline.xyz:8000/health

## Troubleshooting

### Common Issues and Solutions

#### 1. Redis Permission Errors
```bash
# Check Redis container logs
docker compose logs redis

# If you see PID file permission errors, run:
sudo chown -R 999:999 ./redis-data
```

#### 2. PostgreSQL Authentication Issues
```bash
# Check PostgreSQL logs
docker compose logs postgres-db

# Verify database initialization
./init-db.sh
```

#### 3. Container Permission Issues
```bash
# Reset all volume permissions
sudo chown -R 999:999 ./postgres-db/data ./redis-data
sudo chmod -R 755 ./postgres-db/data ./redis-data
```

#### 4. Services Not Accessible Externally
```bash
# Check if ports are open on your VPS
sudo ufw status
sudo ufw allow 3000
sudo ufw allow 8000

# Check if services are running
docker compose ps
```

### Detailed Logs

```bash
# View all service logs
docker compose logs

# View specific service logs
docker compose logs fortinet-api
docker compose logs fortinet-web
docker compose logs postgres-db
docker compose logs redis

# Follow logs in real-time
docker compose logs -f
```

### Service Management

```bash
# Stop all services
docker compose down

# Start services
docker compose up -d

# Restart specific service
docker compose restart fortinet-api

# Rebuild and restart
docker compose up -d --build
```

## File Structure

Your enhanced deployment includes:

```
network_collector_project/
├── deploy.sh                 # Enhanced deployment script
├── init-db.sh               # Database initialization script
├── verify-deployment.sh     # Deployment verification script
├── docker-compose.yml       # Container orchestration
├── .env                     # Environment variables
├── postgres-db/
│   └── data/
│       └── schema.sql       # Database schema
├── fortinet-api/            # API service code
├── fortinet-web/            # Web interface code
└── documentation/           # Deployment guides
```

## Environment Configuration

Your `.env` file should contain:

```env
# Database Configuration
POSTGRES_DB=fortinet_network_collector
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Web Configuration
WEB_HOST=0.0.0.0
WEB_PORT=3000

# Production URLs
PRODUCTION_DOMAIN=projectsonline.xyz
PRODUCTION_IP=31.97.138.198
```

## Security Considerations

1. **Firewall Configuration**: Ensure only necessary ports (3000, 8000) are open
2. **Database Security**: Use strong passwords and consider restricting database access
3. **SSL/TLS**: Consider setting up SSL certificates for production use
4. **Regular Updates**: Keep Docker images and system packages updated

## Monitoring

Use the verification script regularly to monitor your deployment:

```bash
# Run verification daily
./verify-deployment.sh

# Set up a cron job for automated monitoring
echo "0 */6 * * * cd /path/to/project && ./verify-deployment.sh >> deployment.log 2>&1" | crontab -
```

## Support

If you encounter issues:

1. Run `./verify-deployment.sh` to get a comprehensive status report
2. Check the troubleshooting section above
3. Review Docker Compose logs: `docker compose logs`
4. Ensure all prerequisites from the original documentation are met

## Next Steps

After successful deployment:

1. Configure your Fortinet devices to connect to the collector
2. Set up monitoring and alerting
3. Configure backup procedures for your database
4. Consider setting up SSL/TLS certificates
5. Implement log rotation and cleanup procedures