FROM nginx:alpine

# Install additional tools for health checks and template processing
RUN apk add --no-cache curl gettext bash

# Remove only default server config, keep nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# Copy template files
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template

# Copy static files
COPY rate-limit-error.html /usr/share/nginx/html/rate-limit-error.html

# Copy and make entrypoint script executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create log directory
RUN mkdir -p /var/log/nginx

# Create nginx user
#RUN addgroup -g 101 -S nginx && \
 #   adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set proper permissions
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx && \
    chmod -R 755 /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx && \
    chmod -R 755 /etc/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose ports
EXPOSE 80 443

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]