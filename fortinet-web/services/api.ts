import { FirewallResponse, VDOMResponse, InterfaceResponse, RouteResponse, VIPResponse } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800/api';

export async function getFirewalls(params?: Record<string, string>): Promise<{ items: FirewallResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const url = queryParams ? `${API_BASE_URL}/firewalls/?${queryParams}` : `${API_BASE_URL}/firewalls/`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to fetch firewalls: ${response.status} ${response.statusText}`, errorData);
    throw new Error(`Failed to fetch firewalls: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getVdoms(params?: Record<string, string>): Promise<{ items: VDOMResponse[], total_count: number }> {
  try {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = queryParams ? `${API_BASE_URL}/vdoms/?${queryParams}` : `${API_BASE_URL}/vdoms/`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Failed to fetch vdoms: ${response.status} ${response.statusText}`, errorData);
      return { items: [], total_count: 0 };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching vdoms:', error);
    return { items: [], total_count: 0 };
  }
}

export async function getInterfaces(params?: Record<string, string>): Promise<{ items: InterfaceResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const url = queryParams ? `${API_BASE_URL}/interfaces/?${queryParams}` : `${API_BASE_URL}/interfaces/`;
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to fetch interfaces: ${response.status} ${response.statusText}`, errorData);
    throw new Error(`Failed to fetch interfaces: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getRoutes(params?: Record<string, string>): Promise<{ items: RouteResponse[], total_count: number }> {
  const queryParams = new URLSearchParams(params || {});
  queryParams.set('include_vdom', 'true');
  const url = `${API_BASE_URL}/routes/?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch routes');
  return response.json();
}

export async function getVips(params?: Record<string, string>): Promise<{ items: VIPResponse[], total_count: number }> {
  const queryParams = params ? new URLSearchParams(params).toString() : '';
  const url = queryParams ? `${API_BASE_URL}/vips/?${queryParams}` : `${API_BASE_URL}/vips/`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to fetch vips: ${response.status} ${response.statusText}`, errorData);
    throw new Error(`Failed to fetch vips: ${response.status} ${response.statusText}`);
  }
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

  const url = `${API_BASE_URL}/search/ip?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.text();
    console.error(`Failed to search IPs: ${response.status} ${response.statusText}`, errorData);
    throw new Error(`Failed to search IPs: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
