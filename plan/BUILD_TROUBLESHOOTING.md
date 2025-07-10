# Build Troubleshooting Guide

This guide helps resolve common build issues with the Fortinet Network Collector containerized deployment.

## Recent Fixes Applied

### 1. Docker Compose Version Warnings ✅
**Issue**: `the attribute 'version' is obsolete, it will be ignored`
**Fix**: Removed `version: '3.8'` from both `docker-compose.yml` and `docker-compose.override.yml`

### 2. Next.js Build Failures ✅
**Issue**: Webpack build errors due to React 19 compatibility
**Fixes Applied**:
- Downgraded React from 19.0.0 to 18.3.1 for better stability
- Updated TypeScript types to match React 18
- Enhanced Dockerfile with better error reporting
- Created development-specific Dockerfile (`Dockerfile.dev`)
- Increased Node.js memory allocation (`--max-old-space-size=4096`)

### 3. Package Lock Synchronization Issues ✅
**Issue**: `npm ci can only install packages when your package.json and package-lock.json are in sync`
**Root Cause**: After changing package.json versions, package-lock.json still contains old dependency versions
**Fix Applied**: Enhanced both Dockerfiles to automatically detect and resolve synchronization issues:
- Checks if `npm ci --dry-run` succeeds before running `npm ci`
- If synchronization fails, automatically regenerates package-lock.json
- Ensures consistent dependency installation across environments

### 4. Docker FROM/AS Casing Warnings ✅
**Issue**: `WARN: FromAsCasing: 'as' and 'FROM' keywords' casing do not match`
**Root Cause**: Inconsistent casing between `FROM` and `AS` keywords in Dockerfiles
**Fix Applied**: Standardized all Dockerfiles to use uppercase `FROM` and `AS` keywords:
- Updated `fortinet-api/Dockerfile` to use `AS` instead of `as`
- All Dockerfiles now consistently use uppercase keywords

## Common Build Issues & Solutions

### 1. Next.js Build Failures

#### Symptoms
```
Build failed because of webpack errors
npm notice New major version of npm available!
failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
```

#### Solutions

**A. Use Development Build (Recommended for Development)**
```bash
# Use development environment which skips production build
./deploy.sh development deploy
```

**B. Clear Build Cache**
```bash
# Remove existing containers and volumes
./deploy.sh development clean

# Rebuild from scratch
./deploy.sh development build
```

**C. Check Dependencies**
```bash
# Navigate to fortinet-web directory
cd fortinet-web

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Try local build
npm run build
```

### 2. Memory Issues During Build

#### Symptoms
```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

#### Solutions
The Dockerfile now includes increased memory allocation:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

If issues persist, increase further:
```bash
# Edit fortinet-web/Dockerfile and change to:
ENV NODE_OPTIONS="--max-old-space-size=8192"
```

### 3. Dependency Compatibility Issues

#### Symptoms
```
Module not found: Can't resolve 'react/jsx-runtime'
Type errors with React components
```

#### Solutions
The package.json has been updated to use React 18:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18",
  "@types/react-dom": "^18"
}
```

### 4. Docker Build Context Issues

#### Symptoms
```
failed to solve: failed to read dockerfile
COPY failed: file not found
```

#### Solutions
```bash
# Ensure you're in the project root directory
cd /home/keleti/network_collector_project

# Check if Dockerfile exists
ls -la fortinet-web/Dockerfile*

# Rebuild with no cache
./deploy.sh development build
```

## Environment-Specific Solutions

### Production Environment
```bash
# Production uses optimized build
./deploy.sh production deploy

# If production build fails, check:
# 1. All environment variables are set in .env
# 2. No development dependencies in production build
# 3. Sufficient memory allocated to Docker
```

### Development Environment
```bash
# Development uses hot-reload, no production build required
./deploy.sh development deploy

# Development-specific features:
# - Uses Dockerfile.dev (no production build)
# - Hot-reload enabled
# - All dependencies installed
# - Relaxed error handling
```

### Debug Environment
```bash
# Debug environment with enhanced logging
./deploy.sh debug deploy

# Debug features:
# - Verbose build output
# - Enhanced error reporting
# - Development dependencies available
```

## Quick Fixes

### 1. Reset Development Environment
```bash
# Complete reset
./deploy.sh development clean
./dev-tools.sh setup
./deploy.sh development deploy
```

### 2. Check Service Status
```bash
# Check what's running
./dev-tools.sh status

# View logs for specific service
./dev-tools.sh logs fortinet-web-1
```

### 3. Manual Build Test
```bash
# Test build locally before Docker
cd fortinet-web
npm install
npm run build
```

## Advanced Troubleshooting

### 1. Enable Verbose Logging
The enhanced Dockerfile includes verbose build logging:
```dockerfile
ENV NEXT_BUILD_VERBOSE=1
```

### 2. Check Build Output
```bash
# View detailed build logs
docker-compose -f docker-compose.yml -f docker-compose.override.yml logs fortinet-web-1
```

### 3. Interactive Debugging
```bash
# Start container without build
docker-compose -f docker-compose.yml -f docker-compose.override.yml run --rm fortinet-web-1 sh

# Inside container, run:
npm install
npm run build
```

## Prevention

### 1. Regular Maintenance
```bash
# Weekly cleanup
./deploy.sh development clean
docker system prune -f

# Update dependencies (carefully)
cd fortinet-web
npm update
```

### 2. Environment Consistency
- Always use the deploy script for consistent environments
- Don't mix manual Docker commands with deploy script
- Keep environment files (.env.dev, .env.debug) updated

### 3. Monitoring
```bash
# Regular status checks
./dev-tools.sh status

# Monitor logs
./deploy.sh development logs
```

## Next.js Configuration Issues

### Problem: Invalid next.config.js Options
```
Invalid next.config.js options detected:
- Unrecognized key(s) in object: 'outputFileTracingRoot' at "experimental"
- Unrecognized key(s) in object: 'telemetry'
```

### Root Cause
Next.js 15 removed or changed several configuration options that were valid in previous versions.

### Solution
Updated `fortinet-web/next.config.js` to remove deprecated options:

**Before:**
```javascript
const nextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
  telemetry: false,
  // ... rest of config
}
```

**After:**
```javascript
const nextConfig = {
  output: 'standalone',
  // Removed experimental.outputFileTracingRoot (no longer valid)
  // Removed telemetry option (configured differently in Next.js 15)
  // ... rest of config
}
```

### Notes
- `outputFileTracingRoot` is no longer a valid experimental option in Next.js 15
- `telemetry` configuration has been moved or changed in Next.js 15
- The `output: 'standalone'` option remains valid and necessary for Docker deployment

## API Connectivity Issues

### Problem: Failed to fetch / TypeError: Failed to fetch
```
TypeError: Failed to fetch
    at getFirewalls (http://localhost:3000/_next/static/chunks/_abbba285._.js:911:28)
```

### Root Cause
The frontend was trying to access the API using absolute URLs that don't work in the browser context. When accessing the app through `http://localhost` (nginx proxy), the browser-side JavaScript needs to use relative URLs or browser-accessible URLs.

**Key Issue**: Client-side fetch requests run in the browser, not in the Docker container, so Docker service names like `http://nginx/api` are not resolvable by the browser.

### Solution
Updated the API URL configuration to use relative URLs:

**Before:**
```yaml
# docker-compose.override.yml
environment:
  - NEXT_PUBLIC_API_URL=http://nginx/api  # ❌ Browser can't resolve 'nginx'
```

**After:**
```yaml
# docker-compose.override.yml
environment:
  - NEXT_PUBLIC_API_URL=/api  # ✅ Relative URL works in browser
```

**Also updated:**
- `.env.dev`: Changed `NEXT_PUBLIC_API_URL=http://nginx/api` to `/api`
- `fortinet-web/services/api.ts`: Updated fallback URL from `http://nginx/api` to `/api`

### How the Architecture Works
1. **Browser → nginx**: User accesses `http://localhost`
2. **nginx → Next.js**: nginx proxies web requests to Next.js containers
3. **Browser → nginx → API**: API calls use `/api` which nginx proxies to FastAPI backend
4. **Load balancing**: nginx handles load balancing for both web and API services

### Key Concepts
- **Server-side**: Docker service names work (nginx, fortinet-api-1, etc.)
- **Client-side**: Only browser-accessible URLs work (relative URLs, localhost, domain names)
- **nginx proxy**: Routes `/api/*` to FastAPI backend automatically

### Verification
After the fix, the frontend can successfully:
1. Make API calls using relative URLs (`/api/firewalls/`)
2. Have nginx automatically proxy these to the FastAPI backend
3. Load firewall data and other API endpoints without network errors

## Getting Help

If issues persist:

1. **Check logs**: `./dev-tools.sh logs [service-name]`
2. **Verify environment**: `./dev-tools.sh status`
3. **Clean rebuild**: `./deploy.sh development clean && ./deploy.sh development deploy`
4. **Manual testing**: Test build locally in `fortinet-web/` directory

## Recent Changes Summary

- ✅ Fixed Docker Compose version warnings
- ✅ Downgraded React 19 → React 18 for stability
- ✅ Enhanced Dockerfile with better error reporting
- ✅ Created development-specific Dockerfile
- ✅ Increased Node.js memory allocation
- ✅ Added verbose build logging
- ✅ Updated development compose configuration
- ✅ Fixed Next.js 15 configuration compatibility issues
- ✅ Fixed API connectivity using Docker network service names

The deployment should now work reliably for both production and development environments with full API connectivity and no configuration warnings.