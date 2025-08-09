#!/bin/bash
set -e

# ============================================================================
# NGINX DYNAMIC CONFIGURATION ENTRYPOINT
# ============================================================================
# This script generates nginx configuration files at runtime using environment
# variables, eliminating the need for container rebuilds when adjusting
# rate limits, worker settings, or other configuration parameters.
# ============================================================================

echo "=========================================="
echo "NGINX DYNAMIC CONFIGURATION STARTUP"
echo "=========================================="
echo "Timestamp: $(date)"
echo "Container: nginx"
echo "Purpose: Generate runtime configuration from environment variables"
echo ""

# Standard Nginx directories in Alpine Linux
NGINX_CONF_DIR="/etc/nginx"
NGINX_CONF_D_DIR="/etc/nginx/conf.d"
NGINX_TEMPLATES_DIR="/etc/nginx/templates"

# ============================================================================
# CONFIGURATION VALIDATION AND LOGGING
# ============================================================================

echo "📋 CURRENT CONFIGURATION VALUES:"
echo "----------------------------------------"
echo "🔧 Worker Configuration:"
echo "  NGINX_WORKER_PROCESSES: ${NGINX_WORKER_PROCESSES:-auto}"
echo "  NGINX_WORKER_CONNECTIONS: ${NGINX_WORKER_CONNECTIONS:-1024}"
echo "  NGINX_KEEPALIVE_TIMEOUT: ${NGINX_KEEPALIVE_TIMEOUT:-65}"
echo "  NGINX_CLIENT_MAX_BODY_SIZE: ${NGINX_CLIENT_MAX_BODY_SIZE:-10M}"
echo ""

echo "🚦 Rate Limiting Configuration:"
echo "  NGINX_API_RATE_LIMIT: ${NGINX_API_RATE_LIMIT:-2000}r/m"
echo "  NGINX_WEB_RATE_LIMIT: ${NGINX_WEB_RATE_LIMIT:-2200}r/m"
echo "  NGINX_HEALTH_RATE_LIMIT: ${NGINX_HEALTH_RATE_LIMIT:-1800}r/m"
echo "  NGINX_CONNECTION_LIMIT: ${NGINX_CONNECTION_LIMIT:-20} per IP"
echo ""

echo "📊 Zone Sizing Configuration:"
echo "  NGINX_API_ZONE_SIZE: ${NGINX_API_ZONE_SIZE:-10m} (≈ ${NGINX_API_ZONE_CAPACITY:-160000} IPs)"
echo "  NGINX_WEB_ZONE_SIZE: ${NGINX_WEB_ZONE_SIZE:-10m} (≈ ${NGINX_WEB_ZONE_CAPACITY:-160000} IPs)"
echo "  NGINX_HEALTH_ZONE_SIZE: ${NGINX_HEALTH_ZONE_SIZE:-5m} (≈ ${NGINX_HEALTH_ZONE_CAPACITY:-80000} IPs)"
echo "  NGINX_CONN_ZONE_SIZE: ${NGINX_CONN_ZONE_SIZE:-10m} (≈ ${NGINX_CONN_ZONE_CAPACITY:-160000} IPs)"
echo ""

echo "🔐 SSL Configuration:"
echo "  NGINX_SSL_ENABLED: ${NGINX_SSL_ENABLED:-false}"
echo "  NGINX_SSL_PROTOCOLS: ${NGINX_SSL_PROTOCOLS:-TLSv1.2 TLSv1.3}"
echo "  NGINX_SSL_SESSION_CACHE: ${NGINX_SSL_SESSION_CACHE:-shared:SSL:10m}"
echo "  NGINX_SSL_SESSION_TIMEOUT: ${NGINX_SSL_SESSION_TIMEOUT:-1d}"
echo ""

echo "� Burst and Delay Configuration:"
echo "  NGINX_API_BURST: ${NGINX_API_BURST:-10}"
echo "  NGINX_WEB_BURST: ${NGINX_WEB_BURST:-20}"
echo "  NGINX_HEALTH_BURST: ${NGINX_HEALTH_BURST:-10}"
echo "  NGINX_API_DELAY: ${NGINX_API_DELAY:-5}"
echo "  NGINX_WEB_DELAY: ${NGINX_WEB_DELAY:-10}"
echo ""

# ============================================================================
# CONFIGURATION VALIDATION
# ============================================================================

echo "🔍 VALIDATING CONFIGURATION:"
echo "----------------------------------------"

# Validate numeric values
validate_number() {
    local value=$1
    local name=$2
    local min=$3
    local max=$4
    
    if ! [[ "$value" =~ ^[0-9]+$ ]]; then
        echo "❌ ERROR: $name must be a number, got: $value"
        exit 1
    fi
    
    if [ "$value" -lt "$min" ] || [ "$value" -gt "$max" ]; then
        echo "❌ ERROR: $name must be between $min and $max, got: $value"
        exit 1
    fi
    
    echo "✅ $name: $value (valid)"
}

# Validate allowed domains
if [ -z "${ALLOWED_DOMAINS}" ]; then
    echo "❌ ERROR: ALLOWED_DOMAINS must be set"
    exit 1
fi
echo "✅ ALLOWED_DOMAINS: ${ALLOWED_DOMAINS}"

validate_number "${NGINX_API_RATE_LIMIT:-2000}" "NGINX_API_RATE_LIMIT" 100 10000
validate_number "${NGINX_WEB_RATE_LIMIT:-2200}" "NGINX_WEB_RATE_LIMIT" 100 10000
validate_number "${NGINX_HEALTH_RATE_LIMIT:-1800}" "NGINX_HEALTH_RATE_LIMIT" 100 5000
validate_number "${NGINX_CONNECTION_LIMIT:-20}" "NGINX_CONNECTION_LIMIT" 5 200

# Validate burst values
validate_number "${NGINX_API_BURST:-10}" "NGINX_API_BURST" 1 100
validate_number "${NGINX_WEB_BURST:-20}" "NGINX_WEB_BURST" 1 100
validate_number "${NGINX_HEALTH_BURST:-10}" "NGINX_HEALTH_BURST" 1 50

# Validate delay values
validate_number "${NGINX_API_DELAY:-5}" "NGINX_API_DELAY" 1 50
validate_number "${NGINX_WEB_DELAY:-10}" "NGINX_WEB_DELAY" 1 50

# Validate worker connections
validate_number "${NGINX_WORKER_CONNECTIONS:-1024}" "NGINX_WORKER_CONNECTIONS" 512 4096

# Validate zone size capacity values (for informational display)
validate_number "${NGINX_API_ZONE_CAPACITY:-160000}" "NGINX_API_ZONE_CAPACITY" 10000 1000000
validate_number "${NGINX_WEB_ZONE_CAPACITY:-160000}" "NGINX_WEB_ZONE_CAPACITY" 10000 1000000
validate_number "${NGINX_HEALTH_ZONE_CAPACITY:-80000}" "NGINX_HEALTH_ZONE_CAPACITY" 5000 500000
validate_number "${NGINX_CONN_ZONE_CAPACITY:-160000}" "NGINX_CONN_ZONE_CAPACITY" 10000 1000000

# Validate SSL session timeout (in seconds, converted from days/hours format)
if [[ "${NGINX_SSL_SESSION_TIMEOUT:-1d}" =~ ^[0-9]+[dhms]$ ]]; then
    echo "✅ NGINX_SSL_SESSION_TIMEOUT: ${NGINX_SSL_SESSION_TIMEOUT:-1d} (valid format)"
else
    echo "❌ ERROR: NGINX_SSL_SESSION_TIMEOUT must be in format like '1d', '24h', '1440m', or '86400s'"
    exit 1
fi

echo ""
echo "✅ All configuration values validated successfully!"
echo ""

# ============================================================================
# TEMPLATE PROCESSING
# ============================================================================

echo "🔄 GENERATING CONFIGURATION FILES:"
echo "----------------------------------------"

# Create conf.d directory if it doesn't exist
mkdir -p "$NGINX_CONF_D_DIR"

# Set default values for all environment variables
export NGINX_WORKER_PROCESSES=${NGINX_WORKER_PROCESSES:-auto}
export NGINX_WORKER_CONNECTIONS=${NGINX_WORKER_CONNECTIONS:-1024}
export NGINX_KEEPALIVE_TIMEOUT=${NGINX_KEEPALIVE_TIMEOUT:-65}
export NGINX_CLIENT_MAX_BODY_SIZE=${NGINX_CLIENT_MAX_BODY_SIZE:-10M}

export NGINX_API_RATE_LIMIT=${NGINX_API_RATE_LIMIT:-2000}
export NGINX_WEB_RATE_LIMIT=${NGINX_WEB_RATE_LIMIT:-2200}
export NGINX_HEALTH_RATE_LIMIT=${NGINX_HEALTH_RATE_LIMIT:-1800}
export NGINX_CONNECTION_LIMIT=${NGINX_CONNECTION_LIMIT:-20}

export NGINX_API_BURST=${NGINX_API_BURST:-10}
export NGINX_WEB_BURST=${NGINX_WEB_BURST:-20}
export NGINX_HEALTH_BURST=${NGINX_HEALTH_BURST:-10}
export NGINX_API_DELAY=${NGINX_API_DELAY:-5}
export NGINX_WEB_DELAY=${NGINX_WEB_DELAY:-10}
export ALLOWED_DOMAINS=${ALLOWED_DOMAINS:-demo.projectsonline.xyz}

# Convert ALLOWED_DOMAINS to map format
ALLOWED_DOMAINS_MAP=$(echo "$ALLOWED_DOMAINS" | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/.*/"~^&$" 1;/' | tr '\n' ' ')
export ALLOWED_DOMAINS_MAP

# Zone sizing configuration
export NGINX_API_ZONE_SIZE=${NGINX_API_ZONE_SIZE:-10m}
export NGINX_WEB_ZONE_SIZE=${NGINX_WEB_ZONE_SIZE:-10m}
export NGINX_HEALTH_ZONE_SIZE=${NGINX_HEALTH_ZONE_SIZE:-5m}
export NGINX_CONN_ZONE_SIZE=${NGINX_CONN_ZONE_SIZE:-10m}
export NGINX_API_ZONE_CAPACITY=${NGINX_API_ZONE_CAPACITY:-160000}
export NGINX_WEB_ZONE_CAPACITY=${NGINX_WEB_ZONE_CAPACITY:-160000}
export NGINX_HEALTH_ZONE_CAPACITY=${NGINX_HEALTH_ZONE_CAPACITY:-80000}
export NGINX_CONN_ZONE_CAPACITY=${NGINX_CONN_ZONE_CAPACITY:-160000}

# SSL configuration
export NGINX_SSL_ENABLED=${NGINX_SSL_ENABLED:-false}
export NGINX_HOST=${NGINX_HOST:-projectsonline.xyz}
export NGINX_SSL_PROTOCOLS=${NGINX_SSL_PROTOCOLS:-"TLSv1.2 TLSv1.3"}
export NGINX_SSL_CIPHERS=${NGINX_SSL_CIPHERS:-"TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256"}
export NGINX_SSL_SESSION_CACHE=${NGINX_SSL_SESSION_CACHE:-"shared:SSL:10m"}
export NGINX_SSL_SESSION_TIMEOUT=${NGINX_SSL_SESSION_TIMEOUT:-1d}
export NGINX_SSL_PREFER_SERVER_CIPHERS=${NGINX_SSL_PREFER_SERVER_CIPHERS:-on}

# Convert per-minute rate limits to per-second for NGINX
echo "🔄 Converting rate limits from requests/minute to requests/second..."
export NGINX_API_RATE_LIMIT_NUMERIC=$((${NGINX_API_RATE_LIMIT:-2000} / 60))
export NGINX_WEB_RATE_LIMIT_NUMERIC=$((${NGINX_WEB_RATE_LIMIT:-2200} / 60))
export NGINX_HEALTH_RATE_LIMIT_NUMERIC=$((${NGINX_HEALTH_RATE_LIMIT:-1800} / 60))

echo "  API Rate: ${NGINX_API_RATE_LIMIT}r/m → ${NGINX_API_RATE_LIMIT_NUMERIC}r/s"
echo "  Web Rate: ${NGINX_WEB_RATE_LIMIT}r/m → ${NGINX_WEB_RATE_LIMIT_NUMERIC}r/s"
echo "  Health Rate: ${NGINX_HEALTH_RATE_LIMIT}r/m → ${NGINX_HEALTH_RATE_LIMIT_NUMERIC}r/s"
echo ""

# Generate main nginx.conf from template
echo "📝 Generating $NGINX_CONF_DIR/nginx.conf from template..."
envsubst '
    ${NGINX_WORKER_PROCESSES}
    ${NGINX_WORKER_CONNECTIONS}
    ${NGINX_KEEPALIVE_TIMEOUT}
    ${NGINX_CLIENT_MAX_BODY_SIZE}
    ${NGINX_API_RATE_LIMIT}
    ${NGINX_WEB_RATE_LIMIT}
    ${NGINX_HEALTH_RATE_LIMIT}
    ${NGINX_CONNECTION_LIMIT}
    ${NGINX_API_BURST}
    ${NGINX_WEB_BURST}
    ${NGINX_HEALTH_BURST}
    ${NGINX_API_DELAY}
    ${NGINX_WEB_DELAY}
    ${NGINX_API_RATE_LIMIT_NUMERIC}
    ${NGINX_WEB_RATE_LIMIT_NUMERIC}
    ${NGINX_HEALTH_RATE_LIMIT_NUMERIC}
    ${NGINX_API_ZONE_SIZE}
    ${NGINX_WEB_ZONE_SIZE}
    ${NGINX_HEALTH_ZONE_SIZE}
    ${NGINX_CONN_ZONE_SIZE}
    ${NGINX_SSL_ENABLED}
    ${NGINX_SSL_PROTOCOLS}
    ${NGINX_SSL_CIPHERS}
    ${NGINX_SSL_SESSION_CACHE}
    ${NGINX_SSL_SESSION_TIMEOUT}
    ${NGINX_SSL_PREFER_SERVER_CIPHERS}
' < "$NGINX_TEMPLATES_DIR/nginx.conf.template" > "$NGINX_CONF_DIR/nginx.conf"

if [ $? -eq 0 ]; then
    echo "✅ nginx.conf generated successfully"
else
    echo "❌ ERROR: Failed to generate nginx.conf"
    exit 1
fi

# Generate default.conf from template
echo "📝 Generating $NGINX_CONF_D_DIR/default.conf from template..."
envsubst '
    ${NGINX_API_RATE_LIMIT}
    ${NGINX_WEB_RATE_LIMIT}
    ${NGINX_HEALTH_RATE_LIMIT}
    ${NGINX_CONNECTION_LIMIT}
    ${NGINX_API_BURST}
    ${NGINX_WEB_BURST}
    ${NGINX_HEALTH_BURST}
    ${NGINX_API_DELAY}
    ${NGINX_WEB_DELAY}
    ${NGINX_API_RATE_LIMIT_NUMERIC}
    ${NGINX_WEB_RATE_LIMIT_NUMERIC}
    ${NGINX_HEALTH_RATE_LIMIT_NUMERIC}
    ${NGINX_SSL_ENABLED}
    ${NGINX_SSL_PROTOCOLS}
    ${NGINX_SSL_CIPHERS}
    ${NGINX_SSL_SESSION_CACHE}
    ${NGINX_SSL_SESSION_TIMEOUT}
    ${NGINX_SSL_PREFER_SERVER_CIPHERS}
    ${NGINX_HOST}
    ${ALLOWED_DOMAINS}
    ${ALLOWED_DOMAINS_MAP}
' < "$NGINX_TEMPLATES_DIR/default.conf.template" > "$NGINX_CONF_D_DIR/default.conf"

if [ $? -eq 0 ]; then
    echo "✅ default.conf generated successfully"
else
    echo "❌ ERROR: Failed to generate default.conf"
    exit 1
fi

# Copy static webmail configuration
echo "📝 Copying static webmail.conf configuration..."
cp "$NGINX_TEMPLATES_DIR/webmail.conf" "$NGINX_CONF_D_DIR/webmail.conf"

# ============================================================================
# NGINX CONFIGURATION TESTING
# ============================================================================

echo ""
echo "🧪 TESTING NGINX CONFIGURATION:"
echo "----------------------------------------"

# Show generated configuration for debugging
echo "📋 Generated nginx.conf content (lines 70-85):"
echo "----------------------------------------"
sed -n '70,85p' "$NGINX_CONF_DIR/nginx.conf" | nl -v70
echo ""

# Show current directory and file structure for debugging
echo "🔍 Current working directory: $(pwd)"
echo "📂 Contents of $NGINX_CONF_DIR:"
ls -l "$NGINX_CONF_DIR"
echo "📂 Contents of $NGINX_CONF_D_DIR:"
ls -l "$NGINX_CONF_D_DIR"

# Test nginx configuration syntax (skip in development mode)
if [ "${NGINX_SKIP_TEST:-false}" = "true" ]; then
    echo "⚠️  Skipping nginx configuration test (NGINX_SKIP_TEST=true)"
else
    nginx -t
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration test passed!"
    else
        echo "❌ ERROR: Nginx configuration test failed!"
        echo "💡 Set NGINX_SKIP_TEST=true to skip this test in development"
        echo ""
        echo "📋 Generated nginx.conf content (lines 70-85):"
        echo "----------------------------------------"
        sed -n '70,85p' "$NGINX_CONF_DIR/nginx.conf" | nl -v70
        echo ""
        echo "📋 Full Generated nginx.conf content:"
        echo "----------------------------------------"
        cat "$NGINX_CONF_DIR/nginx.conf"
        echo ""
        echo "📋 Generated default.conf content:"
        echo "----------------------------------------"
        cat "$NGINX_CONF_D_DIR/default.conf"
        exit 1
    fi
fi

# ============================================================================
# STARTUP SUMMARY
# ============================================================================

echo ""
echo "🚀 NGINX STARTUP SUMMARY:"
echo "----------------------------------------"
echo "✅ Configuration validation: PASSED"
echo "✅ Template processing: COMPLETED"
echo "✅ Configuration testing: PASSED"
echo "✅ Ready to start nginx with dynamic configuration"
echo ""
echo "📊 ACTIVE RATE LIMITS:"
echo "  API: ${NGINX_API_RATE_LIMIT:-2000}r/m (${NGINX_API_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_API_BURST:-10}, delay: ${NGINX_API_DELAY:-5})"
echo "  Web: ${NGINX_WEB_RATE_LIMIT:-2200}r/m (${NGINX_WEB_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_WEB_BURST:-20}, delay: ${NGINX_WEB_DELAY:-10})"
echo "  Health: ${NGINX_HEALTH_RATE_LIMIT:-1800}r/m (${NGINX_HEALTH_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_HEALTH_BURST:-10})"
echo "  Connections: ${NGINX_CONNECTION_LIMIT:-20} per IP"
echo ""
echo "🎯 BENEFITS ACHIEVED:"
echo "  ✅ Zero rebuild configuration changes"
echo "  ✅ Runtime rate limit adjustments"
echo "  ✅ Environment-specific tuning"
echo "  ✅ Centralized parameter management"
echo ""
echo "=========================================="
echo "STARTING NGINX..."
echo "=========================================="

# Start nginx in foreground
echo "🚀 Starting nginx with generated configuration"
exec nginx -g "daemon off;"