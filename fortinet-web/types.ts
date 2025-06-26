export interface FirewallResponse {
  firewall_id: number;
  fw_name: string;
  fw_ip: string;
  fmg_ip?: string | null;
  faz_ip?: string | null;
  last_updated: string;
  site?: string; // Added from types/index.ts
  vdoms?: VDOMResponse[] | null; // Optional, if sometimes included
  total_vdoms?: number | null; // Added for VDOMs count
}
export interface VDOMResponse {
  firewall_id: number;
  vdom_name: string;
  vdom_index?: number | null;
  vdom_id: number;
  last_updated: string; // Assuming datetime is serialized as string
  firewall?: FirewallResponse; // Added from types/index.ts
  total_routes?: number | null; // Added for routes count
  total_interfaces?: number | null; // Added for interfaces count
  total_vips?: number | null; // Added for VIPs count
}


export interface InterfaceResponse {
  interface_id: number;
  firewall_id: number; // Added from types/index.ts
  vdom_id?: number | null; // Changed to match backend Optional[int]
  interface_name: string;
  ip_address?: string | null;
  mask?: string | null; // Changed from mask_length to mask
  type?: string | null;
  vlan_id?: number | null;
  description?: string | null;
  status?: string | null;
  physical_interface_name?: string | null;
  last_updated: string;
  vdom?: VDOMResponse | null;
}

export interface RouteResponse {
  route_id: number;
  vdom_id: number;
  destination_network: string;
  mask_length: number;
  route_type: string;
  gateway?: string | null;
  exit_interface_name: string;
  exit_interface_details?: string | null;
  last_updated: string;
  vdom?: VDOMResponse | null; // Crucial for displaying VDOM name
}

export interface VIPResponse {
  vip_id: number;
  vdom_id: number;
  vip_name?: string; // From implementation_plan.md
  external_ip: string;
  external_port?: number | null;
  mapped_ip: string;
  mapped_port?: number | null;
  port_forwarding?: boolean; // From original types.ts
  vip_type?: string; // From implementation_plan.md
  external_interface?: string; // From implementation_plan.md
  mask?: number; // From implementation_plan.md
  protocol?: string | null; // From original types.ts
  last_updated: string;
  vdom?: VDOMResponse | null;
}

export interface SearchIPResult {
  interfaces: InterfaceResponse[];
  routes: RouteResponse[];
  vips: VIPResponse[];
}