--
-- PostgreSQL database dump
--

-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: firewalls; Type: TABLE DATA; Schema: public; Owner: -
--

SET SESSION AUTHORIZATION DEFAULT;

ALTER TABLE public.firewalls DISABLE TRIGGER ALL;

INSERT INTO public.firewalls (firewall_id, fw_name, fw_ip, fmg_ip, faz_ip, site, last_updated) VALUES (1, 'FW-HQ-01', '192.168.1.1', '192.168.1.10', '192.168.1.11', 'Headquarters', '2025-07-06 19:19:29.089095');
INSERT INTO public.firewalls (firewall_id, fw_name, fw_ip, fmg_ip, faz_ip, site, last_updated) VALUES (2, 'FW-BRANCH-01', '192.168.2.1', '192.168.1.10', '192.168.1.11', 'Branch Office', '2025-07-06 19:19:29.089095');
INSERT INTO public.firewalls (firewall_id, fw_name, fw_ip, fmg_ip, faz_ip, site, last_updated) VALUES (3, 'FW-DMZ-01', '192.168.3.1', '192.168.1.10', '192.168.1.11', 'DMZ', '2025-07-06 19:19:29.089095');


ALTER TABLE public.firewalls ENABLE TRIGGER ALL;

--
-- Data for Name: vdoms; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.vdoms DISABLE TRIGGER ALL;

INSERT INTO public.vdoms (vdom_id, firewall_id, vdom_name, vdom_index, last_updated) VALUES (1, 1, 'root', NULL, '2025-07-06 19:19:29.09505');
INSERT INTO public.vdoms (vdom_id, firewall_id, vdom_name, vdom_index, last_updated) VALUES (2, 1, 'dmz', NULL, '2025-07-06 19:19:29.09505');
INSERT INTO public.vdoms (vdom_id, firewall_id, vdom_name, vdom_index, last_updated) VALUES (3, 2, 'root', NULL, '2025-07-06 19:19:29.09505');
INSERT INTO public.vdoms (vdom_id, firewall_id, vdom_name, vdom_index, last_updated) VALUES (4, 3, 'root', NULL, '2025-07-06 19:19:29.09505');


ALTER TABLE public.vdoms ENABLE TRIGGER ALL;

--
-- Data for Name: interfaces; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.interfaces DISABLE TRIGGER ALL;

INSERT INTO public.interfaces (interface_id, firewall_id, vdom_id, interface_name, ip_address, mask, type, vlan_id, description, status, physical_interface_name, last_updated) VALUES (2, 1, 1, 'port1', '192.168.1.1', NULL, 'physical', NULL, NULL, 'up', NULL, '2025-07-06 19:20:59.948475');
INSERT INTO public.interfaces (interface_id, firewall_id, vdom_id, interface_name, ip_address, mask, type, vlan_id, description, status, physical_interface_name, last_updated) VALUES (3, 1, 1, 'port2', '10.0.1.1', NULL, 'physical', NULL, NULL, 'up', NULL, '2025-07-06 19:20:59.948475');
INSERT INTO public.interfaces (interface_id, firewall_id, vdom_id, interface_name, ip_address, mask, type, vlan_id, description, status, physical_interface_name, last_updated) VALUES (4, 1, 2, 'port3', '172.16.1.1', NULL, 'physical', NULL, NULL, 'up', NULL, '2025-07-06 19:20:59.948475');
INSERT INTO public.interfaces (interface_id, firewall_id, vdom_id, interface_name, ip_address, mask, type, vlan_id, description, status, physical_interface_name, last_updated) VALUES (5, 2, 3, 'port1', '192.168.2.1', NULL, 'physical', NULL, NULL, 'up', NULL, '2025-07-06 19:20:59.948475');
INSERT INTO public.interfaces (interface_id, firewall_id, vdom_id, interface_name, ip_address, mask, type, vlan_id, description, status, physical_interface_name, last_updated) VALUES (6, 3, 4, 'port1', '192.168.3.1', NULL, 'physical', NULL, NULL, 'down', NULL, '2025-07-06 19:20:59.948475');


ALTER TABLE public.interfaces ENABLE TRIGGER ALL;

--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.routes DISABLE TRIGGER ALL;

INSERT INTO public.routes (route_id, vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name, exit_interface_details, last_updated) VALUES (1, 1, '0.0.0.0', 0, 'static', '192.168.1.254', 'port1', NULL, '2025-07-06 19:20:59.953622');
INSERT INTO public.routes (route_id, vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name, exit_interface_details, last_updated) VALUES (2, 1, '10.0.0.0', 8, 'static', '10.0.1.254', 'port2', NULL, '2025-07-06 19:20:59.953622');
INSERT INTO public.routes (route_id, vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name, exit_interface_details, last_updated) VALUES (3, 2, '172.16.0.0', 12, 'static', '172.16.1.254', 'port3', NULL, '2025-07-06 19:20:59.953622');
INSERT INTO public.routes (route_id, vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name, exit_interface_details, last_updated) VALUES (4, 3, '0.0.0.0', 0, 'static', '192.168.2.254', 'port1', NULL, '2025-07-06 19:20:59.953622');
INSERT INTO public.routes (route_id, vdom_id, destination_network, mask_length, route_type, gateway, exit_interface_name, exit_interface_details, last_updated) VALUES (5, 4, '192.168.0.0', 16, 'static', '192.168.3.254', 'port1', NULL, '2025-07-06 19:20:59.953622');


ALTER TABLE public.routes ENABLE TRIGGER ALL;

--
-- Data for Name: vips; Type: TABLE DATA; Schema: public; Owner: -
--

ALTER TABLE public.vips DISABLE TRIGGER ALL;

INSERT INTO public.vips (vip_id, vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type, external_interface, mask, last_updated) VALUES (1, 1, '192.168.1.100', 80, '10.0.1.10', 80, 'static-nat', NULL, NULL, '2025-07-06 19:20:59.956431');
INSERT INTO public.vips (vip_id, vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type, external_interface, mask, last_updated) VALUES (2, 1, '192.168.1.101', 25, '10.0.1.11', 25, 'static-nat', NULL, NULL, '2025-07-06 19:20:59.956431');
INSERT INTO public.vips (vip_id, vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type, external_interface, mask, last_updated) VALUES (3, 2, '172.16.1.100', 443, '172.16.1.10', 443, 'static-nat', NULL, NULL, '2025-07-06 19:20:59.956431');
INSERT INTO public.vips (vip_id, vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type, external_interface, mask, last_updated) VALUES (4, 3, '192.168.2.100', 8080, '192.168.2.10', 80, 'static-nat', NULL, NULL, '2025-07-06 19:20:59.956431');
INSERT INTO public.vips (vip_id, vdom_id, external_ip, external_port, mapped_ip, mapped_port, vip_type, external_interface, mask, last_updated) VALUES (5, 4, '192.168.3.100', 22, '192.168.3.10', 22, 'static-nat', NULL, NULL, '2025-07-06 19:20:59.956431');


ALTER TABLE public.vips ENABLE TRIGGER ALL;

--
-- Name: firewalls_firewall_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.firewalls_firewall_id_seq', 4, true);


--
-- Name: interfaces_interface_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.interfaces_interface_id_seq', 6, true);


--
-- Name: routes_route_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.routes_route_id_seq', 5, true);


--
-- Name: vdoms_vdom_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vdoms_vdom_id_seq', 5, true);


--
-- Name: vips_vip_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vips_vip_id_seq', 5, true);


--
-- PostgreSQL database dump complete
--

