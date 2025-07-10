-- Sample data for testing export/import functionality
-- Insert data in proper order to respect foreign key constraints

-- Insert firewalls first (no dependencies)
INSERT INTO firewalls (fw_name, fw_ip, fmg_ip, faz_ip, site) VALUES
('FW-HQ-01', '192.168.1.1', '192.168.1.10', '192.168.1.11', 'Headquarters'),
('FW-BRANCH-01', '192.168.2.1', '192.168.1.10', '192.168.1.11', 'Branch Office'),
('FW-DMZ-01', '192.168.3.1', '192.168.1.10', '192.168.1.11', 'DMZ');

-- Insert VDOMs (depends on firewalls)
INSERT INTO vdoms (firewall_id, vdom_name) VALUES
(1, 'root'),
(1, 'dmz'),
(2, 'root'),
(3, 'root');

-- Insert interfaces (depends on firewalls and VDOMs)
INSERT INTO interfaces (firewall_id, vdom_id, interface_name, ip_address, type, status) VALUES
(1, 1, 'port1', '192.168.1.1', 'physical', 'up'),
(1, 1, 'port2', '10.0.1.1', 'physical', 'up'),
(1, 2, 'port3', '172.16.1.1', 'physical', 'up'),
(2, 3, 'port1', '192.168.2.1', 'physical', 'up'),
(3, 4, 'port1', '192.168.3.1', 'physical', 'down');

-- Insert routes (depends on VDOMs)
INSERT INTO routes (vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name) VALUES
(1, '0.0.0.0', 0, 'static', '192.168.1.254', 'port1'),
(1, '10.0.0.0', 8, 'static', '10.0.1.254', 'port2'),
(2, '172.16.0.0', 12, 'static', '172.16.1.254', 'port3'),
(3, '0.0.0.0', 0, 'static', '192.168.2.254', 'port1'),
(4, '192.168.0.0', 16, 'static', '192.168.3.254', 'port1');

-- Insert VIPs (depends on VDOMs)
INSERT INTO vips (vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type) VALUES
(1, '192.168.1.100', 80, '10.0.1.10', 80, 'static-nat'),
(1, '192.168.1.101', 25, '10.0.1.11', 25, 'static-nat'),
(2, '172.16.1.100', 443, '172.16.1.10', 443, 'static-nat'),
(3, '192.168.2.100', 8080, '192.168.2.10', 80, 'static-nat'),
(4, '192.168.3.100', 22, '192.168.3.10', 22, 'static-nat');