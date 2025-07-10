-- =====================================================
-- Fortinet Database Schema for Supabase Data Import
-- =====================================================
-- This schema is based on the exported data structure
-- Created: 2025-01-07
-- Purpose: Import real Supabase data into dockerized PostgreSQL

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS "public"."vips" CASCADE;
DROP TABLE IF EXISTS "public"."routes" CASCADE;
DROP TABLE IF EXISTS "public"."interfaces" CASCADE;
DROP TABLE IF EXISTS "public"."vdoms" CASCADE;
DROP TABLE IF EXISTS "public"."firewalls" CASCADE;

-- =====================================================
-- FIREWALLS TABLE (Parent table - no dependencies)
-- =====================================================
CREATE TABLE "public"."firewalls" (
    "firewall_id" INTEGER PRIMARY KEY,
    "fw_name" VARCHAR(255) NOT NULL,
    "fw_ip" INET,
    "fmg_ip" INET,
    "faz_ip" INET,
    "site" VARCHAR(255),
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for firewalls
CREATE INDEX idx_firewalls_fw_name ON "public"."firewalls"("fw_name");
CREATE INDEX idx_firewalls_fw_ip ON "public"."firewalls"("fw_ip");
CREATE INDEX idx_firewalls_site ON "public"."firewalls"("site");

-- =====================================================
-- VDOMS TABLE (Depends on firewalls)
-- =====================================================
CREATE TABLE "public"."vdoms" (
    "vdom_id" INTEGER PRIMARY KEY,
    "firewall_id" INTEGER NOT NULL,
    "vdom_name" VARCHAR(255) NOT NULL,
    "vdom_index" INTEGER,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_vdoms_firewall_id 
        FOREIGN KEY ("firewall_id") 
        REFERENCES "public"."firewalls"("firewall_id") 
        ON DELETE CASCADE
);

-- Create indexes for vdoms
CREATE INDEX idx_vdoms_firewall_id ON "public"."vdoms"("firewall_id");
CREATE INDEX idx_vdoms_vdom_name ON "public"."vdoms"("vdom_name");
CREATE INDEX idx_vdoms_vdom_index ON "public"."vdoms"("vdom_index");

-- =====================================================
-- INTERFACES TABLE (Depends on firewalls and vdoms)
-- =====================================================
CREATE TABLE "public"."interfaces" (
    "interface_id" INTEGER PRIMARY KEY,
    "firewall_id" INTEGER NOT NULL,
    "vdom_id" INTEGER NOT NULL,
    "interface_name" VARCHAR(255) NOT NULL,
    "ip_address" INET,
    "mask" VARCHAR(50),
    "type" VARCHAR(100),
    "vlan_id" INTEGER,
    "description" TEXT,
    "status" VARCHAR(50),
    "physical_interface_name" VARCHAR(255),
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_interfaces_firewall_id 
        FOREIGN KEY ("firewall_id") 
        REFERENCES "public"."firewalls"("firewall_id") 
        ON DELETE CASCADE,
    CONSTRAINT fk_interfaces_vdom_id 
        FOREIGN KEY ("vdom_id") 
        REFERENCES "public"."vdoms"("vdom_id") 
        ON DELETE CASCADE
);

-- Create indexes for interfaces
CREATE INDEX idx_interfaces_firewall_id ON "public"."interfaces"("firewall_id");
CREATE INDEX idx_interfaces_vdom_id ON "public"."interfaces"("vdom_id");
CREATE INDEX idx_interfaces_interface_name ON "public"."interfaces"("interface_name");
CREATE INDEX idx_interfaces_ip_address ON "public"."interfaces"("ip_address");
CREATE INDEX idx_interfaces_type ON "public"."interfaces"("type");
CREATE INDEX idx_interfaces_status ON "public"."interfaces"("status");

-- =====================================================
-- ROUTES TABLE (Depends on vdoms)
-- =====================================================
CREATE TABLE "public"."routes" (
    "route_id" INTEGER PRIMARY KEY,
    "vdom_id" INTEGER NOT NULL,
    "destination_network" INET,
    "mask_length" INTEGER,
    "route_type" VARCHAR(50),
    "gateway" VARCHAR(255),
    "exit_interface_name" VARCHAR(255),
    "exit_interface_details" TEXT,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_routes_vdom_id 
        FOREIGN KEY ("vdom_id") 
        REFERENCES "public"."vdoms"("vdom_id") 
        ON DELETE CASCADE
);

-- Create indexes for routes
CREATE INDEX idx_routes_vdom_id ON "public"."routes"("vdom_id");
CREATE INDEX idx_routes_destination_network ON "public"."routes"("destination_network");
CREATE INDEX idx_routes_route_type ON "public"."routes"("route_type");
CREATE INDEX idx_routes_gateway ON "public"."routes"("gateway");
CREATE INDEX idx_routes_exit_interface_name ON "public"."routes"("exit_interface_name");

-- =====================================================
-- VIPS TABLE (Depends on vdoms)
-- =====================================================
CREATE TABLE "public"."vips" (
    "vip_id" INTEGER PRIMARY KEY,
    "vdom_id" INTEGER NOT NULL,
    "external_ip" INET,
    "external_port" INTEGER,
    "mapped_ip" INET,
    "mapped_port" INTEGER,
    "vip_type" VARCHAR(100),
    "external_interface" VARCHAR(255),
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "mask" VARCHAR(50),
    
    -- Foreign key constraint
    CONSTRAINT fk_vips_vdom_id 
        FOREIGN KEY ("vdom_id") 
        REFERENCES "public"."vdoms"("vdom_id") 
        ON DELETE CASCADE
);

-- Create indexes for vips
CREATE INDEX idx_vips_vdom_id ON "public"."vips"("vdom_id");
CREATE INDEX idx_vips_external_ip ON "public"."vips"("external_ip");
CREATE INDEX idx_vips_mapped_ip ON "public"."vips"("mapped_ip");
CREATE INDEX idx_vips_vip_type ON "public"."vips"("vip_type");
CREATE INDEX idx_vips_external_interface ON "public"."vips"("external_interface");

-- =====================================================
-- ADDITIONAL CONSTRAINTS AND OPTIMIZATIONS
-- =====================================================

-- Add composite indexes for common query patterns
CREATE INDEX idx_interfaces_firewall_vdom ON "public"."interfaces"("firewall_id", "vdom_id");
CREATE INDEX idx_routes_vdom_type ON "public"."routes"("vdom_id", "route_type");
CREATE INDEX idx_vips_vdom_type ON "public"."vips"("vdom_id", "vip_type");

-- Add check constraints for data integrity
ALTER TABLE "public"."routes" ADD CONSTRAINT chk_routes_mask_length 
    CHECK ("mask_length" >= 0 AND "mask_length" <= 32);

ALTER TABLE "public"."vips" ADD CONSTRAINT chk_vips_external_port 
    CHECK ("external_port" > 0 AND "external_port" <= 65535);

ALTER TABLE "public"."vips" ADD CONSTRAINT chk_vips_mapped_port 
    CHECK ("mapped_port" IS NULL OR ("mapped_port" > 0 AND "mapped_port" <= 65535));

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE "public"."firewalls" IS 'Fortinet firewall devices';
COMMENT ON TABLE "public"."vdoms" IS 'Virtual domains within firewalls';
COMMENT ON TABLE "public"."interfaces" IS 'Network interfaces on firewalls';
COMMENT ON TABLE "public"."routes" IS 'Routing table entries';
COMMENT ON TABLE "public"."vips" IS 'Virtual IP configurations';

COMMENT ON COLUMN "public"."firewalls"."firewall_id" IS 'Unique identifier for firewall';
COMMENT ON COLUMN "public"."firewalls"."fw_name" IS 'Firewall hostname/name';
COMMENT ON COLUMN "public"."firewalls"."fw_ip" IS 'Management IP address';
COMMENT ON COLUMN "public"."firewalls"."fmg_ip" IS 'FortiManager IP address';
COMMENT ON COLUMN "public"."firewalls"."faz_ip" IS 'FortiAnalyzer IP address';

COMMENT ON COLUMN "public"."vdoms"."vdom_id" IS 'Unique identifier for VDOM';
COMMENT ON COLUMN "public"."vdoms"."firewall_id" IS 'Reference to parent firewall';
COMMENT ON COLUMN "public"."vdoms"."vdom_name" IS 'VDOM name';
COMMENT ON COLUMN "public"."vdoms"."vdom_index" IS 'VDOM index number';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant permissions to postgres user (adjust as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- =====================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================
\echo 'Schema creation completed successfully!'
\echo 'Tables created: firewalls, vdoms, interfaces, routes, vips'
\echo 'Ready for data import...'