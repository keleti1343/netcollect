# Database to API Mapping

This document provides a detailed mapping between the PostgreSQL database tables and the corresponding FastAPI endpoints and schemas. This reference helps developers understand how database entities are represented in the API.

## Overview

Each database table is represented by:
1. SQLAlchemy ORM model (internal representation)
2. Pydantic schemas (API data validation)
3. API endpoints (HTTP interface)

## Mapping Tables

### Firewalls Table

**Database Table**: `firewalls`

| Database Column | Data Type | SQLAlchemy Model | Pydantic Schema | API Path Parameter |
|-----------------|-----------|------------------|-----------------|-------------------|
| firewall_id | SERIAL | Firewall.firewall_id | FirewallResponse.firewall_id | /api/firewalls/{firewall_id} |
| fw_name | TEXT | Firewall.fw_name | FirewallBase.fw_name | - |
| fw_ip | TEXT | Firewall.fw_ip | FirewallBase.fw_ip | - |
| fmg_ip | TEXT | Firewall.fmg_ip | FirewallBase.fmg_ip | - |
| faz_ip | TEXT | Firewall.faz_ip | FirewallBase.faz_ip | - |
| site | TEXT | Firewall.site | FirewallBase.site | Query parameter |
| last_updated | TIMESTAMP | Firewall.last_updated | FirewallResponse.last_updated | - |

**API Endpoints**:
- `GET /api/firewalls/` - List all firewalls
- `GET /api/firewalls/{firewall_id}` - Get a specific firewall
- `POST /api/firewalls/` - Create a new firewall
- `PUT /api/firewalls/{firewall_id}` - Update a firewall
- `DELETE /api/firewalls/{firewall_id}` - Delete a firewall

**Query Parameters**:
- `site` - Filter firewalls by site
- `skip` - Pagination offset
- `limit` - Pagination limit

### VDOMs Table

**Database Table**: `vdoms`

| Database Column | Data Type | SQLAlchemy Model | Pydantic Schema | API Path Parameter |
|-----------------|-----------|------------------|-----------------|-------------------|
| vdom_id | SERIAL | VDOM.vdom_id | VDOMResponse.vdom_id | /api/vdoms/{vdom_id} |
| firewall_id | INTEGER | VDOM.firewall_id | VDOMBase.firewall_id | - |
| vdom_name | TEXT | VDOM.vdom_name | VDOMBase.vdom_name | - |
| vdom_index | INTEGER | VDOM.vdom_index | VDOMBase.vdom_index | - |
| last_updated | TIMESTAMP | VDOM.last_updated | VDOMResponse.last_updated | - |

**API Endpoints**:
- `GET /api/vdoms/` - List all VDOMs
- `GET /api/vdoms/{vdom_id}` - Get a specific VDOM
- `GET /api/firewalls/{firewall_id}/vdoms` - Get all VDOMs for a firewall
- `POST /api/vdoms/` - Create a new VDOM
- `PUT /api/vdoms/{vdom_id}` - Update a VDOM
- `DELETE /api/vdoms/{vdom_id}` - Delete a VDOM

**Query Parameters**:
- `firewall_id` - Filter VDOMs by firewall ID
- `skip` - Pagination offset
- `limit` - Pagination limit

### Interfaces Table

**Database Table**: `interfaces`

| Database Column | Data Type | SQLAlchemy Model | Pydantic Schema | API Path Parameter |
|-----------------|-----------|------------------|-----------------|-------------------|
| interface_id | SERIAL | Interface.interface_id | InterfaceResponse.interface_id | /api/interfaces/{interface_id} |
| firewall_id | INTEGER | Interface.firewall_id | InterfaceBase.firewall_id | - |
| vdom_id | INTEGER | Interface.vdom_id | InterfaceBase.vdom_id | - |
| interface_name | TEXT | Interface.interface_name | InterfaceBase.interface_name | - |
| ip_address | TEXT | Interface.ip_address | InterfaceBase.ip_address | - |
| mask | TEXT | Interface.mask | InterfaceBase.mask | - |
| type | TEXT | Interface.type | InterfaceBase.type | Query parameter |
| vlan_id | INTEGER | Interface.vlan_id | InterfaceBase.vlan_id | - |
| description | TEXT | Interface.description | InterfaceBase.description | - |
| status | TEXT | Interface.status | InterfaceBase.status | - |
| physical_interface_name | TEXT | Interface.physical_interface_name | InterfaceBase.physical_interface_name | - |
| last_updated | TIMESTAMP | Interface.last_updated | InterfaceResponse.last_updated | - |

**API Endpoints**:
- `GET /api/interfaces/` - List all interfaces
- `GET /api/interfaces/{interface_id}` - Get a specific interface
- `GET /api/firewalls/{firewall_id}/interfaces` - Get all interfaces for a firewall
- `GET /api/vdoms/{vdom_id}/interfaces` - Get all interfaces for a VDOM
- `POST /api/interfaces/` - Create a new interface
- `PUT /api/interfaces/{interface_id}` - Update an interface
- `DELETE /api/interfaces/{interface_id}` - Delete an interface

**Query Parameters**:
- `firewall_id` - Filter interfaces by firewall ID
- `vdom_id` - Filter interfaces by VDOM ID
- `interface_type` - Filter interfaces by type
- `skip` - Pagination offset
- `limit` - Pagination limit

### Routes Table

**Database Table**: `routes`

| Database Column | Data Type | SQLAlchemy Model | Pydantic Schema | API Path Parameter |
|-----------------|-----------|------------------|-----------------|-------------------|
| route_id | SERIAL | Route.route_id | RouteResponse.route_id | /api/routes/{route_id} |
| vdom_id | INTEGER | Route.vdom_id | RouteBase.vdom_id | - |
| destination_network | TEXT | Route.destination_network | RouteBase.destination_network | - |
| mask_length | INTEGER | Route.mask_length | RouteBase.mask_length | - |
| route_type | TEXT | Route.route_type | RouteBase.route_type | Query parameter |
| gateway | TEXT | Route.gateway | RouteBase.gateway | - |
| exit_interface_name | TEXT | Route.exit_interface_name | RouteBase.exit_interface_name | - |
| exit_interface_details | TEXT | Route.exit_interface_details | RouteBase.exit_interface_details | - |
| last_updated | TIMESTAMP | Route.last_updated | RouteResponse.last_updated | - |

**API Endpoints**:
- `GET /api/routes/` - List all routes
- `GET /api/routes/{route_id}` - Get a specific route
- `GET /api/vdoms/{vdom_id}/routes` - Get all routes for a VDOM
- `POST /api/routes/` - Create a new route
- `PUT /api/routes/{route_id}` - Update a route
- `DELETE /api/routes/{route_id}` - Delete a route

**Query Parameters**:
- `vdom_id` - Filter routes by VDOM ID
- `route_type` - Filter routes by type
- `skip` - Pagination offset
- `limit` - Pagination limit

### VIPs Table

**Database Table**: `vips`

| Database Column | Data Type | SQLAlchemy Model | Pydantic Schema | API Path Parameter |
|-----------------|-----------|------------------|-----------------|-------------------|
| vip_id | SERIAL | VIP.vip_id | VIPResponse.vip_id | /api/vips/{vip_id} |
| vdom_id | INTEGER | VIP.vdom_id | VIPBase.vdom_id | - |
| external_ip | TEXT | VIP.external_ip | VIPBase.external_ip | - |
| external_port | INTEGER | VIP.external_port | VIPBase.external_port | - |
| mapped_ip | TEXT | VIP.mapped_ip | VIPBase.mapped_ip | - |
| mapped_port | INTEGER | VIP.mapped_port | VIPBase.mapped_port | - |
| vip_type | TEXT | VIP.vip_type | VIPBase.vip_type | Query parameter |
| external_interface | TEXT | VIP.external_interface | VIPBase.external_interface | - |
| mask | INTEGER | VIP.mask | VIPBase.mask | - |
| last_updated | TIMESTAMP | VIP.last_updated | VIPResponse.last_updated | - |

**API Endpoints**:
- `GET /api/vips/` - List all VIPs
- `GET /api/vips/{vip_id}` - Get a specific VIP
- `GET /api/vdoms/{vdom_id}/vips` - Get all VIPs for a VDOM
- `POST /api/vips/` - Create a new VIP
- `PUT /api/vips/{vip_id}` - Update a VIP
- `DELETE /api/vips/{vip_id}` - Delete a VIP

**Query Parameters**:
- `vdom_id` - Filter VIPs by VDOM ID
- `vip_type` - Filter VIPs by type
- `skip` - Pagination offset
- `limit` - Pagination limit

## Relationship Mappings

The database relationships are mapped to API endpoints as follows:

### One-to-Many Relationships

1. **Firewall → VDOMs**
   - Database: Foreign key `vdoms.firewall_id` references `firewalls.firewall_id`
   - API: `GET /api/firewalls/{firewall_id}/vdoms`

2. **Firewall → Interfaces**
   - Database: Foreign key `interfaces.firewall_id` references `firewalls.firewall_id`
   - API: `GET /api/firewalls/{firewall_id}/interfaces`

3. **VDOM → Interfaces**
   - Database: Foreign key `interfaces.vdom_id` references `vdoms.vdom_id`
   - API: `GET /api/vdoms/{vdom_id}/interfaces`

4. **VDOM → Routes**
   - Database: Foreign key `routes.vdom_id` references `vdoms.vdom_id`
   - API: `GET /api/vdoms/{vdom_id}/routes`

5. **VDOM → VIPs**
   - Database: Foreign key `vips.vdom_id` references `vdoms.vdom_id`
   - API: `GET /api/vdoms/{vdom_id}/vips`

## Schema Validation Rules

The Pydantic schemas enforce the following validation rules that are not explicitly defined in the database:

1. **Creation Schemas**
   - Required fields must be provided
   - Field types must match (e.g., integers for IDs, strings for names)

2. **Update Schemas**
   - All fields are optional (partial updates)
   - Field types must match if provided

3. **Response Schemas**
   - Include the primary key ID
   - Include the last_updated timestamp

## Common Request/Response Patterns

### List Endpoints

**Request:**
```
GET /api/{resource}/
```

**Response:**
```json
[
  {
    "id": 1,
    "field1": "value1",
    "field2": "value2",
    "last_updated": "2023-01-01T00:00:00"
  },
  {
    "id": 2,
    "field1": "value1",
    "field2": "value2",
    "last_updated": "2023-01-01T00:00:00"
  }
]
```

### Get Single Resource

**Request:**
```
GET /api/{resource}/{id}
```

**Response:**
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "last_updated": "2023-01-01T00:00:00"
}
```

### Create Resource

**Request:**
```
POST /api/{resource}/
{
  "field1": "value1",
  "field2": "value2"
}
```

**Response:**
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  "last_updated": "2023-01-01T00:00:00"
}
```

### Update Resource

**Request:**
```
PUT /api/{resource}/{id}
{
  "field1": "new_value"
}
```

**Response:**
```json
{
  "id": 1,
  "field1": "new_value",
  "field2": "value2",
  "last_updated": "2023-01-01T00:00:00"
}
```

### Delete Resource

**Request:**
```
DELETE /api/{resource}/{id}
```

**Response:**
No content (HTTP 204)

## Implementation Notes

1. **Timestamp Handling**: The `last_updated` field is managed by the database on insert/update and returned in API responses.

2. **ID Generation**: Primary keys are auto-generated by the database and returned in API responses.

3. **Unique Constraints**: Database unique constraints (like on `fw_name` and `fw_ip` in the `firewalls` table) are enforced by the API before attempting database operations.

4. **Cascading Deletes**: When a resource is deleted, all dependent resources are automatically deleted due to the `ON DELETE CASCADE` database constraints. The API respects this behavior.

5. **Nullable Fields**: Fields that are nullable in the database are optional in API creation/update requests.