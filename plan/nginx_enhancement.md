# NGINX Domain Restriction Enhancement

## Implementation Steps

### 1. Update .env File
Add these lines to the Security section (around line 47):
```ini
# Allowed domains (space-separated)
ALLOWED_DOMAINS="demo.projectsonline.xyz www.projectsonline.xyz"

# SSL config
ENABLE_SSL=true
LETSENCRYPT_EMAIL=keleti.toure@gmail.com
```

### 2. Update docker-compose.yml
Ensure the nginx service includes:
```yaml
services:
  nginx:
    image: nginx:alpine
    env_file: .env
    environment:
      - ALLOWED_DOMAINS=${ALLOWED_DOMAINS}  # Pass domains from .env
    volumes:
      - ./templates:/etc/nginx/templates
      - /etc/letsencrypt:/etc/letsencrypt
    ports:
      - "80:80"
      - "443:443"
```

### 3. Modify NGINX Template
Update [`nginx/conf.d/default.conf.template`](nginx/conf.d/default.conf.template:1) with:

```nginx
# Map ALLOWED_DOMAINS to a variable for reuse
map $host $allowed_host {
    default 0;
    ~^${ALLOWED_DOMAINS}$ 1;
}

server {
    listen 80;
    server_name _;

    # Block non-allowed domains (444 = No Response)
    if ($allowed_host = 0) {
        return 444;
    }

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    {{ if $ENABLE_SSL }}
    return 301 https://$host$request_uri;
    {{ end }}
}

{{ if $ENABLE_SSL }}
server {
    listen 443 ssl;
    server_name ${ALLOWED_DOMAINS};

    # Block non-allowed SSL domains
    if ($allowed_host = 0) {
        return 444;
    }

    # SSL cert paths (certbot will use first domain)
    ssl_certificate /etc/letsencrypt/live/${NGINX_HOST}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${NGINX_HOST}/privkey.pem;

    # SSL settings (TLS 1.3 only for security)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';

    location / {
        proxy_pass http://your_app:port;
        proxy_set_header Host $host;
    }
}
{{ end }}
```

### 4. Update Entrypoint Script
Modify [`nginx/entrypoint.sh`](nginx/entrypoint.sh:1) to:
1. Add ALLOWED_DOMAINS to the validation section
2. Include it in the envsubst processing

Add this to the validation section (around line 100):
```bash
# Validate allowed domains
if [ -z "${ALLOWED_DOMAINS}" ]; then
    echo "❌ ERROR: ALLOWED_DOMAINS must be set"
    exit 1
fi
echo "✅ ALLOWED_DOMAINS: ${ALLOWED_DOMAINS}"
```

Add `${ALLOWED_DOMAINS}` to both envsubst commands (lines 206-233 and 244-263).

## Verification Steps

1. After deployment, test with:
```bash
curl -I http://demo.projectsonline.xyz
curl -I http://www.projectsonline.xyz 
curl -I http://invalid.domain.com  # Should return 444
```

2. Check SSL certificate issuance:
```bash
docker exec nginx ls /etc/letsencrypt/live/
```

3. Verify HTTPS redirects:
```bash
curl -I http://demo.projectsonline.xyz  # Should 301 redirect to HTTPS
```

## Security Considerations

1. The 444 response provides no information to potential attackers
2. TLS 1.2/1.3 provides strong encryption
3. Certbot will automatically renew certificates
4. Domain restrictions are enforced before any application processing