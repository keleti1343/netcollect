/**
 * Centralized Configuration Management for Client-Side
 * 
 * This module provides dynamic configuration values from environment variables
 * for client-side components including rate limiting, UI behavior, and performance settings.
 */

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  // API Rate Limiting (requests per minute)
  API_MAX_REQUESTS: parseInt(process.env.NEXT_PUBLIC_CLIENT_API_RATE_LIMIT || '1800'),
  API_WINDOW_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_API_WINDOW_MS || '60000'), // 1 minute
  API_RETRY_AFTER_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_API_RETRY_MS || '100'),
  
  // Search Rate Limiting (requests per minute)
  SEARCH_MAX_REQUESTS: parseInt(process.env.NEXT_PUBLIC_CLIENT_SEARCH_RATE_LIMIT || '900'),
  SEARCH_WINDOW_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_SEARCH_WINDOW_MS || '60000'), // 1 minute
  SEARCH_RETRY_AFTER_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_SEARCH_RETRY_MS || '150'),
  
  // Bulk Operations Rate Limiting
  BULK_MAX_REQUESTS: parseInt(process.env.NEXT_PUBLIC_CLIENT_BULK_RATE_LIMIT || '300'),
  BULK_WINDOW_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_BULK_WINDOW_MS || '60000'), // 1 minute
  BULK_RETRY_AFTER_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_BULK_RETRY_MS || '500'),
} as const;

// UI Performance Configuration
export const UI_CONFIG = {
  // Table and Data Display
  DEFAULT_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_CLIENT_DEFAULT_PAGE_SIZE || '25'),
  MAX_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_CLIENT_MAX_PAGE_SIZE || '100'),
  
  // Auto-refresh intervals (milliseconds)
  AUTO_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_CLIENT_AUTO_REFRESH_MS || '30000'), // 30 seconds
  VDOM_TOOLTIP_REFRESH: parseInt(process.env.NEXT_PUBLIC_CLIENT_VDOM_REFRESH_MS || '5000'), // 5 seconds
  
  // Debounce and throttling
  SEARCH_DEBOUNCE_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_SEARCH_DEBOUNCE_MS || '300'),
  FILTER_DEBOUNCE_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_FILTER_DEBOUNCE_MS || '500'),
  
  // Loading and timeout settings
  REQUEST_TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_REQUEST_TIMEOUT_MS || '10000'), // 10 seconds
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_CLIENT_RETRY_ATTEMPTS || '3'),
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  // Enable/disable features
  ENABLE_AUTO_REFRESH: process.env.NEXT_PUBLIC_CLIENT_ENABLE_AUTO_REFRESH === 'true',
  ENABLE_BULK_OPERATIONS: process.env.NEXT_PUBLIC_CLIENT_ENABLE_BULK_OPS !== 'false', // Default true
  ENABLE_ADVANCED_FILTERS: process.env.NEXT_PUBLIC_CLIENT_ENABLE_ADVANCED_FILTERS !== 'false', // Default true
  ENABLE_EXPORT_FEATURES: process.env.NEXT_PUBLIC_CLIENT_ENABLE_EXPORT !== 'false', // Default true
  
  // Debug and development
  ENABLE_DEBUG_LOGGING: process.env.NEXT_PUBLIC_CLIENT_DEBUG === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_CLIENT_PERF_MONITOR === 'true',
} as const;

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // Request configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Retry configuration
  MAX_RETRIES: parseInt(process.env.NEXT_PUBLIC_CLIENT_API_MAX_RETRIES || '3'),
  RETRY_DELAY_MS: parseInt(process.env.NEXT_PUBLIC_CLIENT_API_RETRY_DELAY_MS || '1000'),
  BACKOFF_MULTIPLIER: parseFloat(process.env.NEXT_PUBLIC_CLIENT_API_BACKOFF_MULTIPLIER || '2.0'),
} as const;

// Validation functions
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Validate rate limiting values
  if (RATE_LIMIT_CONFIG.API_MAX_REQUESTS <= 0) {
    errors.push('API_MAX_REQUESTS must be greater than 0');
  }
  
  if (RATE_LIMIT_CONFIG.SEARCH_MAX_REQUESTS <= 0) {
    errors.push('SEARCH_MAX_REQUESTS must be greater than 0');
  }
  
  // Validate UI configuration
  if (UI_CONFIG.DEFAULT_PAGE_SIZE <= 0 || UI_CONFIG.DEFAULT_PAGE_SIZE > UI_CONFIG.MAX_PAGE_SIZE) {
    errors.push('DEFAULT_PAGE_SIZE must be between 1 and MAX_PAGE_SIZE');
  }
  
  // Validate API configuration
  if (!API_CONFIG.BASE_URL) {
    errors.push('API_BASE_URL is required');
  }
  
  if (errors.length > 0) {
    console.error('Configuration validation errors:', errors);
    if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }
  
  return errors.length === 0;
};

// Configuration logging (for debugging)
export const logConfiguration = () => {
  if (FEATURE_FLAGS.ENABLE_DEBUG_LOGGING) {
    console.group('🔧 Client Configuration');
    console.log('Rate Limiting:', RATE_LIMIT_CONFIG);
    console.log('UI Settings:', UI_CONFIG);
    console.log('Feature Flags:', FEATURE_FLAGS);
    console.log('API Config:', { ...API_CONFIG, BASE_URL: API_CONFIG.BASE_URL });
    console.groupEnd();
  }
};

// Initialize configuration validation on module load
if (typeof window !== 'undefined') {
  // Only run in browser environment
  validateConfig();
  logConfiguration();
}

// Export all configurations
export default {
  RATE_LIMIT_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  API_CONFIG,
  validateConfig,
  logConfiguration,
};