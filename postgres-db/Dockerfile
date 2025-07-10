FROM postgres:15-alpine

# Install additional tools
RUN apk add --no-cache bash curl shadow

# Create exports directory first
RUN mkdir -p /exports

# Create postgres user with host UID/GID (1000)
RUN groupmod -g 1000 postgres && \
    usermod -u 1000 postgres && \
    chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql /exports

# Copy scripts
COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh

# Copy custom PostgreSQL configuration
COPY data/postgresql.conf /usr/share/postgresql/postgresql.conf.sample

WORKDIR /scripts

# Use default PostgreSQL entrypoint - do not override CMD
# The container will automatically run postgres and execute initialization scripts