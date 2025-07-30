FROM nginx:alpine

# Install additional tools for health checks and template processing
RUN apk add --no-cache curl gettext bash

# Remove default nginx configuration files
#RUN rm /etc/nginx/conf.d/default.conf
#RUN rm -f /etc/nginx/nginx.conf

# Copy template files (NOT final configuration files)
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template

# Copy static files
COPY rate-limit-error.html /usr/share/nginx/html/rate-limit-error.html

# Copy and make entrypoint script executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create log directory
RUN mkdir -p /var/log/nginx

# Create nginx user if it doesn't exist
RUN addgroup -g 101 -S nginx || true
RUN adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx
RUN chmod -R 755 /var/cache/nginx /var/log/nginx
# Add these lines before HEALTHCHECK:
RUN chown -R nginx:nginx /etc/nginx
RUN chmod -R 755 /etc/nginx

# Health check (static values - Docker doesn't support env vars in HEALTHCHECK)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose ports
EXPOSE 80 443

# Use custom entrypoint that generates configuration from templates
ENTRYPOINT ["/entrypoint.sh"]