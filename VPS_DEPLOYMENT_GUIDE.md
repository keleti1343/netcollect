# VPS Deployment Guide for Hostinger

## ⚠️ Important: Understanding "deploy.sh development clear"

### What happens with `./deploy.sh development clear`?

Looking at the [`deploy.sh`](deploy.sh:457) script, the "clear" command is actually called "**clean**" (not "clear"). Here's what it does:

```bash
./deploy.sh development clean
```

**This command will:**
1. **Stop all containers**: `docker-compose down --remove-orphans --volumes`
2. **Remove all volumes**: This includes your **database data**! 
3. **Remove unused Docker resources**: `docker system prune -f`

### ⚠️ **CRITICAL WARNING**: 
**Running `./deploy.sh development clean` will DELETE ALL YOUR DATABASE DATA!**

Your imported production data (25 firewalls, 205 VDOMs, 572 interfaces, 500 routes, 141 VIPs) will be **permanently lost** because the `--volumes` flag removes the PostgreSQL data volume.

### What happens after cleaning and redeploying?

If you run:
```bash
./deploy.sh development clean
./deploy.sh development deploy
```

**Result:**
1. ✅ **Application will work** - all services will start correctly
2. ❌ **Database will be EMPTY** - all your imported data will be gone
3. ❌ **You'll need to re-import all data** using the scripts in [`postgres-db/data/`](postgres-db/data/)

### Safe Alternative Commands

Instead of "clean", use these safer commands:

```bash
# Restart services without losing data
./deploy.sh development restart

# Stop services (keeps data)
./deploy.sh development stop

# Redeploy without losing data
./deploy.sh development stop
./deploy.sh development deploy
```

## 🌐 Remote VPS Deployment at Hostinger

### Yes, you CAN deploy to a remote VPS! Here's how:

### 1. **Prepare Your VPS**

#### SSH into your Hostinger VPS:
```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

#### Install Docker and Docker Compose:
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Start Docker service
systemctl start docker
systemctl enable docker

# Add user to docker group (if not root)
usermod -aG docker $USER
```

### 2. **Transfer Your Application**

#### Option A: Git Clone (Recommended)
```bash
# On your VPS
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

#### Option B: SCP Transfer
```bash
# From your local machine
scp -r /home/keleti/network_collector_project root@your-vps-ip:/opt/fortinet-app
```

#### Option C: Rsync Transfer
```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  /home/keleti/network_collector_project/ \
  root@your-vps-ip:/opt/fortinet-app/
```

### 3. **Configure for VPS Deployment**

#### Update Environment Configuration
Create a VPS-specific environment file:

```bash
# On your VPS
cp .env .env.vps
```

Edit `.env.vps` for VPS-specific settings:
```bash
# VPS-specific configuration
ENVIRONMENT=production
NODE_ENV=production

# Database settings (keep same as development for consistency)
POSTGRES_DB=fortinet_network_collector_dev
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_vps_password_here

# API Configuration
API_SECRET_KEY=your_generated_secure_key_here

# Network settings for VPS
NEXT_PUBLIC_API_URL=http://your-vps-ip/api
```

#### Update Docker Compose for VPS
Create a VPS-specific compose override:

```yaml
# docker-compose.vps.yml
version: '3.8'

services:
  nginx:
    ports:
      - "80:80"
      - "443:443"  # For SSL later
    environment:
      - SERVER_NAME=your-domain.com your-vps-ip
  
  # Remove port exposures for security
  fortinet-api-1:
    ports: []
  
  fortinet-api-2:
    ports: []
  
  fortinet-web-1:
    ports: []
  
  fortinet-web-2:
    ports: []
  
  supabase-db:
    ports: []
  
  redis:
    ports: []
```

### 4. **Deploy to VPS**

#### Update deploy.sh for VPS
Add VPS environment support to [`deploy.sh`](deploy.sh:26):

```bash
# Add this to the setup_environment() function
"vps")
    ENVIRONMENT="vps"
    COMPOSE_FILES="-f docker-compose.yml -f docker-compose.vps.yml"
    ENV_FILE=".env.vps"
    HEALTH_URL="http://localhost"
    API_PORTS="8000"
    WEB_PORTS="3000"
    ;;
```

#### Deploy on VPS
```bash
# On your VPS
./deploy.sh vps deploy
```

### 5. **Transfer Your Database Data**

#### Option A: Transfer Data Files
```bash
# From your local machine to VPS
scp -r postgres-db/data/ root@your-vps-ip:/opt/fortinet-app/postgres-db/

# On VPS, import data
cd /opt/fortinet-app/postgres-db/data
./import_data.sh
```

#### Option B: Database Dump/Restore
```bash
# On local machine - create dump
docker exec supabase-db pg_dump -U postgres -d fortinet_network_collector_dev > fortinet_backup.sql

# Transfer to VPS
scp fortinet_backup.sql root@your-vps-ip:/opt/fortinet-app/

# On VPS - restore
docker exec -i supabase-db psql -U postgres -d fortinet_network_collector_dev < fortinet_backup.sql
```

### 6. **Configure Domain and SSL (Optional)**

#### Domain Configuration
Update your domain's DNS to point to your VPS IP:
```
A record: @ -> your-vps-ip
A record: www -> your-vps-ip
```

#### SSL with Let's Encrypt
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. **VPS-Specific Security**

#### Firewall Configuration
```bash
# Install UFW
apt install ufw

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

#### Docker Security
```bash
# Create docker daemon configuration
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "userland-proxy": false
}
EOF

systemctl restart docker
```

### 8. **Monitoring and Maintenance**

#### Create VPS Monitoring Script
```bash
# vps-monitor.sh
#!/bin/bash
echo "=== VPS Health Check ==="
echo "Date: $(date)"
echo "Uptime: $(uptime)"
echo "Disk Usage: $(df -h / | tail -1)"
echo "Memory Usage: $(free -h)"
echo "Docker Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "Application Health:"
curl -s http://localhost/health || echo "Health check failed"
```

#### Backup Strategy
```bash
# backup-vps.sh
#!/bin/bash
BACKUP_DIR="/opt/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
docker exec supabase-db pg_dump -U postgres -d fortinet_network_collector_dev > $BACKUP_DIR/database.sql

# Backup application files
tar -czf $BACKUP_DIR/app_files.tar.gz /opt/fortinet-app --exclude=/opt/fortinet-app/node_modules

# Keep only last 7 days of backups
find /opt/backups -type d -mtime +7 -exec rm -rf {} \;
```

## 🚀 Quick VPS Deployment Checklist

- [ ] VPS provisioned at Hostinger
- [ ] Docker and Docker Compose installed
- [ ] Application files transferred
- [ ] Environment configuration updated
- [ ] Database data imported
- [ ] Services deployed and healthy
- [ ] Domain configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] Firewall configured
- [ ] Monitoring and backup scripts set up

## 📞 Support Commands for VPS

```bash
# Check VPS resources
htop
df -h
free -h

# Monitor Docker containers
docker stats

# View application logs
./deploy.sh vps logs

# Restart services
./deploy.sh vps restart

# Check service status
./deploy.sh vps status
```

Your application is fully ready for VPS deployment! The containerized architecture makes it portable across any Docker-compatible environment.