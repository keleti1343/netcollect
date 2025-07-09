FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
# Create app tmp directory with app user permissions
RUN mkdir -p /app/tmp && chown app:app /app/tmp
USER app

# Expose port
EXPOSE 8000

# Health check endpoint dependency (per guidelines)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Use Gunicorn with Uvicorn workers
CMD ["gunicorn", "--config", "gunicorn.conf.py", "app.main:app"]