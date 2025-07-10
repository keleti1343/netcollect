-- Database schema for Fortinet Network Collector
-- Contains table definitions, constraints, and indexes only (no data)

-- 1. firewalls (no dependencies)

create table public.firewalls (
  firewall_id serial not null,
  fw_name text not null,
  fw_ip text not null,
  fmg_ip text null,
  faz_ip text null,
  site text null,
  last_updated timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint firewalls_pkey primary key (firewall_id),
  constraint uq_fw_name unique (fw_name),
  constraint uq_fw_ip unique (fw_ip)
) TABLESPACE pg_default;

create index IF not exists idx_firewalls_fw_name on public.firewalls using btree (fw_name) TABLESPACE pg_default;

-- 2. vdoms (depends on firewalls)
create table public.vdoms (
  vdom_id serial not null,
  firewall_id integer not null,
  vdom_name text not null,
  vdom_index integer null,
  last_updated timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint vdoms_pkey primary key (vdom_id),
  constraint uq_firewall_vdom unique (firewall_id, vdom_name),
  constraint vdoms_firewall_id_fkey foreign KEY (firewall_id) references firewalls (firewall_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_vdoms_firewall_id on public.vdoms using btree (firewall_id) TABLESPACE pg_default;

-- 3. interfaces (depends on vdoms)
create table public.interfaces (
  interface_id serial not null,
  firewall_id integer not null,
  vdom_id integer null,
  interface_name text not null,
  ip_address text null,
  mask text null,
  type text not null,
  vlan_id integer null,
  description text null,
  status text null,
  physical_interface_name text null,
  last_updated timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint interfaces_pkey primary key (interface_id),
  constraint uq_firewall_vdom_interface unique (firewall_id, vdom_id, interface_name),
  constraint interfaces_firewall_id_fkey foreign KEY (firewall_id) references firewalls (firewall_id) on delete CASCADE,
  constraint interfaces_vdom_id_fkey foreign KEY (vdom_id) references vdoms (vdom_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_interfaces_firewall_id on public.interfaces using btree (firewall_id) TABLESPACE pg_default;
create index IF not exists idx_interfaces_vdom_id on public.interfaces using btree (vdom_id) TABLESPACE pg_default;

-- 4. routes (depends on vdoms)
create table public.routes (
  route_id serial not null,
  vdom_id integer not null,
  destination_network text not null,
  mask_length integer not null,
  route_type text not null,
  gateway text null,
  exit_interface_name text not null,
  exit_interface_details text null,
  last_updated timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint routes_pkey primary key (route_id),
  constraint routes_vdom_id_fkey foreign KEY (vdom_id) references vdoms (vdom_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_routes_vdom_id on public.routes using btree (vdom_id) TABLESPACE pg_default;

-- 5. vips (depends on vdoms)
create table public.vips (
  vip_id serial not null,
  vdom_id integer not null,
  external_ip text not null,
  external_port integer null,
  mapped_ip text not null,
  mapped_port integer null,
  vip_type text null,
  external_interface text null,
  mask integer null,
  last_updated timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint vips_pkey primary key (vip_id),
  constraint vips_vdom_id_fkey foreign KEY (vdom_id) references vdoms (vdom_id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_vips_vdom_id on public.vips using btree (vdom_id) TABLESPACE pg_default;