# Fortinet Network Collector - Installation Guide for Hostinger VPS

This guide provides step-by-step instructions for setting up the Fortinet Network Collector application on a Hostinger VPS. It addresses common permission issues, system configuration requirements, and ensures proper database initialization.

## 1. System Requirements

Ensure your VPS meets these minimum requirements:
- At least 4GB RAM (8GB recommended)
- 2 CPU cores (4 recommended)
- 20GB SSD storage
- Ubuntu 20.04 LTS or later

## 2. Install Required Software

Run the following commands to install all necessary dependencies:

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Install system dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release locales

# Set up proper locales
sudo locale-gen en_US.UTF-8
sudo update-locale LANG=en_US.UTF-8

# Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.12.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version

# Add current user to docker group (to avoid sudo for docker commands)
sudo usermod -aG docker $USER
```

Log out and log back in to apply the group membership changes.

## 3. System Configuration for Container Requirements

### Redis Memory Overcommit Configuration

Redis requires memory overcommit settings to be enabled:

```bash
# Configure system for Redis
echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl vm.overcommit_memory=1
```

### Container Permission Setup

Create required directories with proper permissions:

```bash
# Create project directory
mkdir -p ~/fortinet-network-collector
cd ~/fortinet-network-collector

# Create directories for persistent data with proper permissions
mkdir -p ./data/postgres
mkdir -p ./data/redis
mkdir -p ./data/nginx/logs
mkdir -p ./backups

# Set liberal permissions for development (adjust for production)
chmod -R 777 ./data
chmod -R 777 ./backups
```

## 4. Application Setup

### Clone or Upload Project Files

Clone the repository or upload your project files to the VPS:

```bash
# If using Git
git clone [your-repository-url] ~/fortinet-network-collector
cd ~/fortinet-network-collector

# Or if uploading via SCP/SFTP, upload to ~/fortinet-network-collector
```

### Environment Configuration

Create a secure environment file:

```bash
# Create production environment file
cp .env.example .env

# Generate a secure API key
SECURE_KEY=$(openssl rand -base64 32)
sed -i "s/your_api_secret_key_here/$SECURE_KEY/g" .env

# Set secure database password
DB_PASSWORD=$(openssl rand -base64 16)
sed -i "s/your_secure_password_here/$DB_PASSWORD/g" .env
```

Edit the .env file to customize other settings:

```bash
nano .env
```

## 5. Update Docker Compose for VPS Deployment

Make these modifications to `docker-compose.yml`:

1. Change container volume paths to use explicit host paths
2. Update PostgreSQL configuration for security
3. Ensure Redis has proper permissions

Key changes include:

- Using absolute paths for volumes
- Adding user mapping for containers
- Setting explicit ownership for data directories

## 6. Database Initialization

Ensure the database is properly initialized by modifying the startup sequence:

```bash
# Create a database initialization script
cat > init-db.sh << 'EOF'
#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
until docker-compose exec -T postgres-db pg_isready -U postgres; do
  sleep 2
done

# Run database migrations
echo "Initializing database schema..."
docker-compose exec -T postgres-db psql -U postgres -d ${POSTGRES_DB} -f /docker-entrypoint-initdb.d/schema.sql

echo "Database initialization complete!"
EOF

chmod +x init-db.sh
```

## 7. Deployment

Use the enhanced deployment script:

```bash
# Deploy in production mode
./deploy.sh production deploy
```

## 8. Troubleshooting

If you encounter permission issues:

```bash
# Check container logs
docker-compose logs postgres-db
docker-compose logs redis

# Verify directory permissions
ls -la ./data

# Reset permissions if needed
sudo chown -R 999:999 ./data/postgres
sudo chown -R 999:999 ./data/redis
```

## 9. Security Recommendations

For production deployments, consider these security enhancements:

1. Set up proper firewall rules using UFW
2. Configure SSL certificates for HTTPS
3. Use a secure password for PostgreSQL
4. Set up regular database backups
5. Implement proper monitoring

```bash
# Set up basic firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

## 10. Maintenance

Regular maintenance tasks:

```bash
# View logs
./deploy.sh production logs

# Backup database
./deploy.sh production backup

# Restart services
./deploy.sh production restart

# Check status
./deploy.sh production status