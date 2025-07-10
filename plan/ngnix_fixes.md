# NGINX Entrypoint.sh Implementation Guide

This guide provides step-by-step instructions for fixing two critical issues in the NGINX entrypoint.sh script.

## Current Issues

### 1. Rate Limit Conversion Missing
- You validate per-minute rates but never convert them to per-second values for NGINX
- NGINX requires rate limits in requests/second (r/s), not requests/minute (r/m)
- Without conversion, limits would be 60x higher than intended

### 2. Incomplete Variable Substitution
- Current `envsubst` commands don't explicitly list variables
- This causes two potential problems:
  - Accidental substitution of unwanted variables
  - Missing variables that should be substituted

## Implementation Steps

### Step 1: Add Rate Limit Conversion
Insert the following code after line 146 (after setting default values):

```bash
# Convert per-minute rate limits to per-second for NGINX
echo "🔄 Converting rate limits from requests/minute to requests/second..."
export NGINX_API_RATE_LIMIT_NUMERIC=$((${NGINX_API_RATE_LIMIT:-2000} / 60))
export NGINX_WEB_RATE_LIMIT_NUMERIC=$((${NGINX_WEB_RATE_LIMIT:-2200} / 60))
export NGINX_HEALTH_RATE_LIMIT_NUMERIC=$((${NGINX_HEALTH_RATE_LIMIT:-1800} / 60))

echo "  API Rate: ${NGINX_API_RATE_LIMIT}r/m → ${NGINX_API_RATE_LIMIT_NUMERIC}r/s"
echo "  Web Rate: ${NGINX_WEB_RATE_LIMIT}r/m → ${NGINX_WEB_RATE_LIMIT_NUMERIC}r/s"
echo "  Health Rate: ${NGINX_HEALTH_RATE_LIMIT}r/m → ${NGINX_HEALTH_RATE_LIMIT_NUMERIC}r/s"
echo ""
```

### Step 2: Fix nginx.conf Generation
Replace line 149 with this explicit variable substitution:

```bash
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
' < /etc/nginx/nginx.conf.template > "$TEMP_NGINX_DIR/nginx.conf"
```

### Step 3: Fix default.conf Generation
Replace line 160 with this explicit variable substitution:

```bash
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
' < /etc/nginx/conf.d/default.conf.template > "$TEMP_CONF_DIR/default.conf"
```

### Step 4: Update Startup Summary
Enhance the startup summary section (around line 222-226) to include the new r/s values:

```bash
echo "📊 ACTIVE RATE LIMITS:"
echo "  API: ${NGINX_API_RATE_LIMIT:-2000}r/m (${NGINX_API_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_API_BURST:-10}, delay: ${NGINX_API_DELAY:-5})"
echo "  Web: ${NGINX_WEB_RATE_LIMIT:-2200}r/m (${NGINX_WEB_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_WEB_BURST:-20}, delay: ${NGINX_WEB_DELAY:-10})"
echo "  Health: ${NGINX_HEALTH_RATE_LIMIT:-1800}r/m (${NGINX_HEALTH_RATE_LIMIT_NUMERIC}r/s, burst: ${NGINX_HEALTH_BURST:-10})"
echo "  Connections: ${NGINX_CONNECTION_LIMIT:-20} per IP"
```

## NGINX Template Updates

After updating the entrypoint.sh script, you'll need to ensure your NGINX templates use the new `*_NUMERIC` variables.

### nginx.conf.template Example
Update your rate limiting configurations to use the new per-second variables:

```nginx
# Before
limit_req_zone $binary_remote_addr zone=api:10m rate=${NGINX_API_RATE_LIMIT}r/m;

# After
limit_req_zone $binary_remote_addr zone=api:10m rate=${NGINX_API_RATE_LIMIT_NUMERIC}r/s;
```

Make similar updates for web and health rate limits.

## Testing and Verification

After implementing these changes:

1. Verify that both original and converted rate limits appear in logs
2. Check generated NGINX configuration files to ensure limits use r/s values
3. Test with different rate limit values to confirm proper conversion
4. Validate that NGINX configuration test passes
5. Ensure no unexpected variable substitutions occur

## Benefits of These Changes

1. **Correct Rate Limiting**
   - Ensures NGINX applies the intended rate limits
   - Prevents potential DoS vulnerabilities from incorrect limits

2. **Improved Variable Substitution**
   - Prevents accidental substitution of unintended variables
   - Makes dependencies between templates and environment explicit
   - Easier to troubleshoot template issues

3. **Better Visibility**
   - Log output now shows both r/m and r/s values
   - Makes it clear to operators what actual limits are applied