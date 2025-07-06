FROM redis:7-alpine

# Install additional tools
RUN apk add --no-cache curl

# Create redis user and directories
RUN addgroup -g 999 redis || true
RUN adduser -D -s /bin/sh -u 999 -G redis redis || true

# Create data directory
RUN mkdir -p /data /etc/redis
RUN chown -R redis:redis /data /etc/redis

# Copy custom redis configuration
COPY redis.conf /etc/redis/redis.conf

# Set proper permissions
RUN chmod 644 /etc/redis/redis.conf

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD redis-cli ping || exit 1

# Expose port
EXPOSE 6379

# Switch to redis user
USER redis

# Start Redis with custom configuration
CMD ["redis-server", "/etc/redis/redis.conf"]