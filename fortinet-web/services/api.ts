import { FirewallResponse, VDOMResponse, InterfaceResponse, RouteResponse, VIPResponse } from '../types';
import { apiRateLimiter, searchRateLimiter } from '@/lib/rate-limiter';

// Handle both client-side and server-side rendering
const getApiBaseUrl = () => {
  // Server-side rendering (inside Docker container)
  if (typeof window === 'undefined') {
    // Always use nginx service name for server-side rendering
    // Both development and production containers can access nginx service
    return 'http://fortinet-nginx/api';
  }
  // Client-side rendering (browser)
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

// Remove cached API_BASE_URL - call getApiBaseUrl() dynamically at request time

// Enhanced fetch wrapper with retry and timeout
async function rateLimitedFetch(
  url: string,
  options: RequestInit = {},
  rateLimiter = apiRateLimiter,
  maxRetries = 3,
  retryDelay = 1000
): Promise<Response> {
  // Wait for rate limit slot
  await rateLimiter.waitForSlot(url);
  
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'Keep-Alive': 'timeout=300, max=1000',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          rateLimiter.reset(url);
          throw new Error(`RATE_LIMIT_EXCEEDED`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

  }

  throw lastError || new Error('Max retries reached');
}

export async function getFirewalls(params?: Record<string, string>): Promise<{ items: FirewallResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  // Critical: Use trailing slash (per guidelines)
  const apiBaseUrl = getApiBaseUrl();
  const url = queryParams ? `${apiBaseUrl}/firewalls/?${queryParams}` : `${apiBaseUrl}/firewalls/`;
  
  const response = await rateLimitedFetch(url);
  return response.json();
}

export async function getVdoms(params?: Record<string, string>): Promise<{ items: VDOMResponse[], total_count: number }> {
  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const apiBaseUrl = getApiBaseUrl();
    const url = queryParams ? `${apiBaseUrl}/vdoms/?${queryParams}` : `${apiBaseUrl}/vdoms/`;
    const response = await rateLimitedFetch(url, { cache: 'no-store' });

    return response.json();
  } catch (error) {
    console.error('Error fetching vdoms:', error);
    return { items: [], total_count: 0 };
  }
}

export async function getInterfaces(params?: Record<string, string>): Promise<{ items: InterfaceResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const apiBaseUrl = getApiBaseUrl();
  const url = queryParams ? `${apiBaseUrl}/interfaces/?${queryParams}` : `${apiBaseUrl}/interfaces/`;
  const response = await rateLimitedFetch(url, { redirect: 'follow' });
  return response.json();
}

export async function getRoutes(params?: Record<string, string>): Promise<{ items: RouteResponse[], total_count: number }> {
  const queryParams = new URLSearchParams(params || {});
  queryParams.set('include_vdom', 'true');
  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/routes/?${queryParams.toString()}`;
  const response = await rateLimitedFetch(url);
  return response.json();
}

export async function getVips(params?: Record<string, string>): Promise<{ items: VIPResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const apiBaseUrl = getApiBaseUrl();
  const url = queryParams ? `${apiBaseUrl}/vips/?${queryParams}` : `${apiBaseUrl}/vips/`;
  const response = await rateLimitedFetch(url);
  return response.json();
}

export async function searchIPs(params: {
  query: string;
  interfaces_skip?: number;
  interfaces_limit?: number;
  routes_skip?: number;
  routes_limit?: number;
  vips_skip?: number;
  vips_limit?: number;
}): Promise<{
  interfaces: { items: InterfaceResponse[]; total_count: number };
  routes: { items: RouteResponse[]; total_count: number };
  vips: { items: VIPResponse[]; total_count: number };
}> {
  const queryParams = new URLSearchParams();
  queryParams.set('query', params.query);
  if (params.interfaces_skip !== undefined) queryParams.set('interfaces.skip', params.interfaces_skip.toString());
  if (params.interfaces_limit !== undefined) queryParams.set('interfaces.limit', params.interfaces_limit.toString());
  if (params.routes_skip !== undefined) queryParams.set('routes.skip', params.routes_skip.toString());
  if (params.routes_limit !== undefined) queryParams.set('routes.limit', params.routes_limit.toString());
  if (params.vips_skip !== undefined) queryParams.set('vips.skip', params.vips_skip.toString());
  if (params.vips_limit !== undefined) queryParams.set('vips.limit', params.vips_limit.toString());

  const apiBaseUrl = getApiBaseUrl();
  const url = `${apiBaseUrl}/search/ip?${queryParams.toString()}`;
  
  try {
    console.log(`Attempting to fetch from URL: ${url}`);
    // Use search rate limiter for IP searches
    const response = await rateLimitedFetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    }, searchRateLimiter);
    
    return response.json();
  } catch (error) {
    console.error('Network error when searching IPs:', error);
    // Return empty results instead of throwing, to avoid crashing the UI
    return {
      interfaces: { items: [], total_count: 0 },
      routes: { items: [], total_count: 0 },
      vips: { items: [], total_count: 0 }
    };
  }
}
