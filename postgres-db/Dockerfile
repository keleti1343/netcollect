FROM postgres:15-alpine

# Install additional tools
RUN apk add --no-cache bash curl

# Copy scripts
COPY scripts/ /scripts/
RUN chmod +x /scripts/*.sh

# Copy custom PostgreSQL configuration
COPY data/postgresql.conf /usr/share/postgresql/postgresql.conf.sample

# Create exports directory
RUN mkdir -p /exports

WORKDIR /scripts

# Use default PostgreSQL entrypoint - do not override CMD
# The container will automatically run postgres and execute initialization scripts