-- New Database Schema Based on Exported Data Structure
-- Created from analysis of actual exported data files
-- Ignoring existing create_tables.sql completely

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS vips CASCADE;
DROP TABLE IF EXISTS interfaces CASCADE;
DROP TABLE IF EXISTS vdoms CASCADE;
DROP TABLE IF EXISTS firewalls CASCADE;

-- Create firewalls table (parent table)
CREATE TABLE firewalls (
    firewall_id INTEGER PRIMARY KEY,
    fw_name VARCHAR(255) NOT NULL,
    fw_ip INET,
    fmg_ip INET,
    faz_ip INET,
    site VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE
);

-- Create vdoms table (child of firewalls)
CREATE TABLE vdoms (
    vdom_id INTEGER PRIMARY KEY,
    firewall_id INTEGER NOT NULL,
    vdom_name VARCHAR(255) NOT NULL,
    vdom_index INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (firewall_id) REFERENCES firewalls(firewall_id) ON DELETE CASCADE
);

-- Create interfaces table (child of both firewalls and vdoms)
CREATE TABLE interfaces (
    interface_id INTEGER PRIMARY KEY,
    firewall_id INTEGER NOT NULL,
    vdom_id INTEGER,
    interface_name VARCHAR(255) NOT NULL,
    ip_address INET,
    mask INTEGER,
    type VARCHAR(100),
    vlan_id INTEGER,
    description TEXT,
    status VARCHAR(50),
    physical_interface_name VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (firewall_id) REFERENCES firewalls(firewall_id) ON DELETE CASCADE,
    FOREIGN KEY (vdom_id) REFERENCES vdoms(vdom_id) ON DELETE SET NULL
);

-- Create routes table (child of vdoms)
CREATE TABLE routes (
    route_id INTEGER PRIMARY KEY,
    vdom_id INTEGER NOT NULL,
    destination_network INET,
    mask_length INTEGER,
    route_type VARCHAR(50),
    gateway INET,
    exit_interface_name VARCHAR(255),
    exit_interface_details TEXT,
    last_updated TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (vdom_id) REFERENCES vdoms(vdom_id) ON DELETE CASCADE
);

-- Create vips table (child of vdoms)
CREATE TABLE vips (
    vip_id INTEGER PRIMARY KEY,
    vdom_id INTEGER NOT NULL,
    external_ip INET,
    external_port INTEGER,
    mapped_ip INET,
    mapped_port INTEGER,
    vip_type VARCHAR(100),
    external_interface VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE,
    mask INTEGER,
    FOREIGN KEY (vdom_id) REFERENCES vdoms(vdom_id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_firewalls_fw_name ON firewalls(fw_name);
CREATE INDEX idx_firewalls_site ON firewalls(site);
CREATE INDEX idx_firewalls_last_updated ON firewalls(last_updated);

CREATE INDEX idx_vdoms_firewall_id ON vdoms(firewall_id);
CREATE INDEX idx_vdoms_vdom_name ON vdoms(vdom_name);
CREATE INDEX idx_vdoms_last_updated ON vdoms(last_updated);

CREATE INDEX idx_interfaces_firewall_id ON interfaces(firewall_id);
CREATE INDEX idx_interfaces_vdom_id ON interfaces(vdom_id);
CREATE INDEX idx_interfaces_interface_name ON interfaces(interface_name);
CREATE INDEX idx_interfaces_ip_address ON interfaces(ip_address);
CREATE INDEX idx_interfaces_type ON interfaces(type);
CREATE INDEX idx_interfaces_status ON interfaces(status);
CREATE INDEX idx_interfaces_last_updated ON interfaces(last_updated);

CREATE INDEX idx_routes_vdom_id ON routes(vdom_id);
CREATE INDEX idx_routes_destination_network ON routes(destination_network);
CREATE INDEX idx_routes_route_type ON routes(route_type);
CREATE INDEX idx_routes_gateway ON routes(gateway);
CREATE INDEX idx_routes_last_updated ON routes(last_updated);

CREATE INDEX idx_vips_vdom_id ON vips(vdom_id);
CREATE INDEX idx_vips_external_ip ON vips(external_ip);
CREATE INDEX idx_vips_mapped_ip ON vips(mapped_ip);
CREATE INDEX idx_vips_vip_type ON vips(vip_type);
CREATE INDEX idx_vips_last_updated ON vips(last_updated);

-- Add check constraints for data integrity
ALTER TABLE interfaces ADD CONSTRAINT chk_interfaces_mask CHECK (mask >= 0 AND mask <= 32);
ALTER TABLE routes ADD CONSTRAINT chk_routes_mask_length CHECK (mask_length >= 0 AND mask_length <= 32);
ALTER TABLE vips ADD CONSTRAINT chk_vips_mask CHECK (mask IS NULL OR (mask >= 0 AND mask <= 32));
ALTER TABLE vips ADD CONSTRAINT chk_vips_external_port CHECK (external_port IS NULL OR (external_port > 0 AND external_port <= 65535));
ALTER TABLE vips ADD CONSTRAINT chk_vips_mapped_port CHECK (mapped_port IS NULL OR (mapped_port > 0 AND mapped_port <= 65535));

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Add comments for documentation
COMMENT ON TABLE firewalls IS 'Fortinet firewall devices';
COMMENT ON TABLE vdoms IS 'Virtual domains within firewalls';
COMMENT ON TABLE interfaces IS 'Network interfaces on firewalls';
COMMENT ON TABLE routes IS 'Routing table entries';
COMMENT ON TABLE vips IS 'Virtual IP configurations and load balancer entries';

COMMENT ON COLUMN firewalls.firewall_id IS 'Unique identifier for firewall';
COMMENT ON COLUMN firewalls.fw_name IS 'Firewall hostname/name';
COMMENT ON COLUMN firewalls.fw_ip IS 'Management IP address of firewall';
COMMENT ON COLUMN firewalls.fmg_ip IS 'FortiManager IP address';
COMMENT ON COLUMN firewalls.faz_ip IS 'FortiAnalyzer IP address';
COMMENT ON COLUMN firewalls.site IS 'Physical site location';

COMMENT ON COLUMN vdoms.vdom_id IS 'Unique identifier for VDOM';
COMMENT ON COLUMN vdoms.firewall_id IS 'Reference to parent firewall';
COMMENT ON COLUMN vdoms.vdom_name IS 'Name of the virtual domain';
COMMENT ON COLUMN vdoms.vdom_index IS 'VDOM index number';

COMMENT ON COLUMN interfaces.interface_id IS 'Unique identifier for interface';
COMMENT ON COLUMN interfaces.firewall_id IS 'Reference to parent firewall';
COMMENT ON COLUMN interfaces.vdom_id IS 'Reference to VDOM (can be NULL)';
COMMENT ON COLUMN interfaces.interface_name IS 'Interface name (e.g., port1, wan, lan)';
COMMENT ON COLUMN interfaces.ip_address IS 'IP address assigned to interface';
COMMENT ON COLUMN interfaces.mask IS 'Subnet mask length (CIDR notation)';
COMMENT ON COLUMN interfaces.type IS 'Interface type (physical, vlan, tunnel, etc.)';
COMMENT ON COLUMN interfaces.vlan_id IS 'VLAN ID if applicable';
COMMENT ON COLUMN interfaces.description IS 'Interface description/purpose';
COMMENT ON COLUMN interfaces.status IS 'Interface operational status';
COMMENT ON COLUMN interfaces.physical_interface_name IS 'Underlying physical interface';

COMMENT ON COLUMN routes.route_id IS 'Unique identifier for route';
COMMENT ON COLUMN routes.vdom_id IS 'Reference to VDOM containing this route';
COMMENT ON COLUMN routes.destination_network IS 'Destination network/host';
COMMENT ON COLUMN routes.mask_length IS 'Subnet mask length (CIDR notation)';
COMMENT ON COLUMN routes.route_type IS 'Route type (static, connected, BGP, FIB, etc.)';
COMMENT ON COLUMN routes.gateway IS 'Next hop gateway IP address';
COMMENT ON COLUMN routes.exit_interface_name IS 'Outgoing interface name';
COMMENT ON COLUMN routes.exit_interface_details IS 'Additional interface information';

COMMENT ON COLUMN vips.vip_id IS 'Unique identifier for VIP';
COMMENT ON COLUMN vips.vdom_id IS 'Reference to VDOM containing this VIP';
COMMENT ON COLUMN vips.external_ip IS 'External/public IP address';
COMMENT ON COLUMN vips.external_port IS 'External port number';
COMMENT ON COLUMN vips.mapped_ip IS 'Internal/mapped IP address';
COMMENT ON COLUMN vips.mapped_port IS 'Internal/mapped port number';
COMMENT ON COLUMN vips.vip_type IS 'VIP type (vip interface, virtual server, etc.)';
COMMENT ON COLUMN vips.external_interface IS 'External interface or VIP name';
COMMENT ON COLUMN vips.mask IS 'Subnet mask if applicable';

-- Schema creation complete
SELECT 'New schema created successfully based on exported data structure' AS status;