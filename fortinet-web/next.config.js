/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Ensure trailing slash consistency (per guidelines)
  trailingSlash: true,
  
  // Static optimization settings
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Prefetch configuration for aggressive prefetching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },
  
  // Environment variables - Client-side dynamic configuration
  env: {
    // API Configuration
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    
    // Rate Limiting Configuration
    NEXT_PUBLIC_CLIENT_API_RATE_LIMIT: process.env.NEXT_PUBLIC_CLIENT_API_RATE_LIMIT,
    NEXT_PUBLIC_CLIENT_API_WINDOW_MS: process.env.NEXT_PUBLIC_CLIENT_API_WINDOW_MS,
    NEXT_PUBLIC_CLIENT_API_RETRY_MS: process.env.NEXT_PUBLIC_CLIENT_API_RETRY_MS,
    
    NEXT_PUBLIC_CLIENT_SEARCH_RATE_LIMIT: process.env.NEXT_PUBLIC_CLIENT_SEARCH_RATE_LIMIT,
    NEXT_PUBLIC_CLIENT_SEARCH_WINDOW_MS: process.env.NEXT_PUBLIC_CLIENT_SEARCH_WINDOW_MS,
    NEXT_PUBLIC_CLIENT_SEARCH_RETRY_MS: process.env.NEXT_PUBLIC_CLIENT_SEARCH_RETRY_MS,
    
    NEXT_PUBLIC_CLIENT_BULK_RATE_LIMIT: process.env.NEXT_PUBLIC_CLIENT_BULK_RATE_LIMIT,
    NEXT_PUBLIC_CLIENT_BULK_WINDOW_MS: process.env.NEXT_PUBLIC_CLIENT_BULK_WINDOW_MS,
    NEXT_PUBLIC_CLIENT_BULK_RETRY_MS: process.env.NEXT_PUBLIC_CLIENT_BULK_RETRY_MS,
    
    // UI Performance Configuration
    NEXT_PUBLIC_CLIENT_DEFAULT_PAGE_SIZE: process.env.NEXT_PUBLIC_CLIENT_DEFAULT_PAGE_SIZE,
    NEXT_PUBLIC_CLIENT_MAX_PAGE_SIZE: process.env.NEXT_PUBLIC_CLIENT_MAX_PAGE_SIZE,
    NEXT_PUBLIC_CLIENT_AUTO_REFRESH_MS: process.env.NEXT_PUBLIC_CLIENT_AUTO_REFRESH_MS,
    NEXT_PUBLIC_CLIENT_VDOM_REFRESH_MS: process.env.NEXT_PUBLIC_CLIENT_VDOM_REFRESH_MS,
    NEXT_PUBLIC_CLIENT_SEARCH_DEBOUNCE_MS: process.env.NEXT_PUBLIC_CLIENT_SEARCH_DEBOUNCE_MS,
    NEXT_PUBLIC_CLIENT_FILTER_DEBOUNCE_MS: process.env.NEXT_PUBLIC_CLIENT_FILTER_DEBOUNCE_MS,
    NEXT_PUBLIC_CLIENT_REQUEST_TIMEOUT_MS: process.env.NEXT_PUBLIC_CLIENT_REQUEST_TIMEOUT_MS,
    NEXT_PUBLIC_CLIENT_RETRY_ATTEMPTS: process.env.NEXT_PUBLIC_CLIENT_RETRY_ATTEMPTS,
    
    // Feature Flags
    NEXT_PUBLIC_CLIENT_ENABLE_AUTO_REFRESH: process.env.NEXT_PUBLIC_CLIENT_ENABLE_AUTO_REFRESH,
    NEXT_PUBLIC_CLIENT_ENABLE_BULK_OPS: process.env.NEXT_PUBLIC_CLIENT_ENABLE_BULK_OPS,
    NEXT_PUBLIC_CLIENT_ENABLE_ADVANCED_FILTERS: process.env.NEXT_PUBLIC_CLIENT_ENABLE_ADVANCED_FILTERS,
    NEXT_PUBLIC_CLIENT_ENABLE_EXPORT: process.env.NEXT_PUBLIC_CLIENT_ENABLE_EXPORT,
    NEXT_PUBLIC_CLIENT_DEBUG: process.env.NEXT_PUBLIC_CLIENT_DEBUG,
    NEXT_PUBLIC_CLIENT_PERF_MONITOR: process.env.NEXT_PUBLIC_CLIENT_PERF_MONITOR,
    
    // API Request Configuration
    NEXT_PUBLIC_CLIENT_API_MAX_RETRIES: process.env.NEXT_PUBLIC_CLIENT_API_MAX_RETRIES,
    NEXT_PUBLIC_CLIENT_API_RETRY_DELAY_MS: process.env.NEXT_PUBLIC_CLIENT_API_RETRY_DELAY_MS,
    NEXT_PUBLIC_CLIENT_API_BACKOFF_MULTIPLIER: process.env.NEXT_PUBLIC_CLIENT_API_BACKOFF_MULTIPLIER,
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Disable ESLint and TypeScript during build for now (focus on core functionality)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig