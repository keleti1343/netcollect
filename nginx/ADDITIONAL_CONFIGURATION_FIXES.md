# NGINX Additional Configuration Improvements

Based on review of the actual NGINX configuration files, the following additional improvements are recommended beyond the original `entrypoint.sh` fixes.

## Issues Identified

### 1. Rate Limit Zone Definitions
**Problem**: Using limit_req zones in `default.conf` that are defined in `nginx.conf`, but this relationship isn't clear.

**Solution**: Ensure all rate limit zones are properly defined in the http context of `nginx.conf` and reference the converted r/s variables:

```nginx
http {
    # Rate limiting zones - properly using r/s
    limit_req_zone $binary_remote_addr zone=api:10m rate=${NGINX_API_RATE_LIMIT_NUMERIC}r/s;
    limit_req_zone $binary_remote_addr zone=web:10m rate=${NGINX_WEB_RATE_LIMIT_NUMERIC}r/s;
    limit_req_zone $binary_remote_addr zone=health:10m rate=${NGINX_HEALTH_RATE_LIMIT_NUMERIC}r/s;
    
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
}
```

### 2. Health Check Location Block
**Problem**: The `add_header` directive in the `/health` location is after the `return` statement, so it won't take effect.

**Solution**: Fix the order in the health check location:

```nginx
location /health {
    limit_req zone=health burst=${NGINX_HEALTH_BURST} nodelay;
    add_header Content-Type text/plain;
    return 200 "nginx healthy\n";
}
```

### 3. Proxy Buffering Consistency
**Problem**: Proxy buffering is configured only for the API location but not others.

**Solution**: Add consistent proxy buffering settings to all proxy locations:

```nginx
# Add to the '/' location
proxy_buffering on;
proxy_buffer_size 4k;
proxy_buffers 8 4k;
```

### 4. HTTP/1.1 Support
**Problem**: Missing optimal HTTP/1.1 settings for proxying.

**Solution**: Add the following to all proxy locations:

```nginx
proxy_http_version 1.1;
proxy_set_header Connection "";
```

### 5. SSL Configuration
**Problem**: The commented SSL configuration uses outdated cipher names.

**Solution**: Update to modern cipher settings:

```nginx
ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
```

### 6. Additional Security Headers
**Problem**: Missing modern security headers.

**Solution**: Add Referrer-Policy header to the security headers section:

```nginx
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### 7. Static Assets Handling
**Problem**: Missing proper file handling for static assets.

**Solution**: Add try_files directive to the static assets location:

```nginx
try_files $uri $uri/ =404;
```

## Implementation Plan

### Step 1: Fix Health Check Location Order
Update the health check location in `nginx/conf.d/default.conf.template`:

```nginx
location /health {
    limit_req zone=health burst=${NGINX_HEALTH_BURST} nodelay;
    add_header Content-Type text/plain;
    return 200 "nginx healthy\n";
}
```

### Step 2: Add Consistent Proxy Settings
Add proxy buffering and HTTP/1.1 settings to the web location in `nginx/conf.d/default.conf.template`:

```nginx
location / {
    limit_req zone=web burst=${NGINX_WEB_BURST} delay=${NGINX_WEB_DELAY};
    limit_req_status 429;
    
    error_page 429 /rate-limit-error.html;
    
    proxy_pass http://fortinet_web;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Timeouts
    proxy_connect_timeout 30s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Buffer settings
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
}
```

Also add HTTP/1.1 settings to the API location:

```nginx
proxy_http_version 1.1;
proxy_set_header Connection "";
```

### Step 3: Update Security Headers
Add Referrer-Policy header to the security headers section:

```nginx
# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### Step 4: Update Static Assets Location
Add try_files directive to the static assets location:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    try_files $uri $uri/ =404;
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    proxy_pass http://fortinet_web;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Step 5: Update SSL Configuration
Update the commented SSL configuration with modern cipher settings:

```nginx
# SSL configuration (for production with certificates)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com;
#
#     ssl_certificate /etc/ssl/certs/your-cert.pem;
#     ssl_certificate_key /etc/ssl/private/your-key.pem;
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
#     ssl_prefer_server_ciphers off;
#
#     # Include the same location blocks as above
# }
```

## Testing Recommendations

After implementing these changes:

1. Verify that NGINX configuration syntax passes testing
2. Check that rate limiting works properly across all endpoints
3. Test HTTP/1.1 connections to ensure proper keep-alive behavior
4. Validate all security headers using tools like [securityheaders.com](https://securityheaders.com)
5. Test static asset caching and 404 handling