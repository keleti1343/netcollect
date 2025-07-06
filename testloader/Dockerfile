FROM node:latest

# Set working directory
WORKDIR /app

# Install loadtest globally
RUN npm install -g loadtest

# Install additional testing tools
RUN npm install -g artillery autocannon

# Create test scripts directory
RUN mkdir -p /app/scripts

# Copy test scripts
COPY scripts/ /app/scripts/
COPY package.json /app/

# Install local dependencies if any
RUN npm install

# Create non-root user
RUN groupadd -r testuser && useradd -r -g testuser testuser
RUN chown -R testuser:testuser /app

# Switch to non-root user
USER testuser

# Default command
CMD ["node", "scripts/run-tests.js"]