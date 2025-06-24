# Fortinet API Usage Examples

This document provides practical examples of how to interact with the Fortinet API endpoints. These examples use `curl` for simplicity, but the same operations can be performed using any HTTP client library.

## Table of Contents
1. [Authentication](#authentication)
2. [Firewall Operations](#firewall-operations)
3. [VDOM Operations](#vdom-operations)
4. [Interface Operations](#interface-operations)
5. [Route Operations](#route-operations)
6. [VIP Operations](#vip-operations)
7. [Common HTTP Status Codes](#common-http-status-codes)

## Authentication

*Note: The examples below assume no authentication. When authentication is implemented, you'll need to include the appropriate authorization headers.*

## Firewall Operations

### List All Firewalls

```bash
curl -X GET "http://localhost:8000/api/firewalls/" -H "accept: application/json"
```

### Filter Firewalls by Site

```bash
curl -X GET "http://localhost:8000/api/firewalls/?site=Main%20Office" -H "accept: application/json"
```

### Get a Specific Firewall

```bash
curl -X GET "http://localhost:8000/api/firewalls/1" -H "accept: application/json"
```

### Create a New Firewall

```bash
curl -X POST "http://localhost:8000/api/firewalls/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "fw_name": "fw-main-office-01",
    "fw_ip": "192.168.1.1",
    "fmg_ip": "192.168.10.10",
    "faz_ip": "192.168.10.20",
    "site": "Main Office"
  }'
```

### Update a Firewall

```bash
curl -X PUT "http://localhost:8000/api/firewalls/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "site": "Headquarters"
  }'
```

### Delete a Firewall

```bash
curl -X DELETE "http://localhost:8000/api/firewalls/1" -H "accept: application/json"
```

## VDOM Operations

### List All VDOMs

```bash
curl -X GET "http://localhost:8000/api/vdoms/" -H "accept: application/json"
```

### Get VDOMs for a Specific Firewall

```bash
curl -X GET "http://localhost:8000/api/firewalls/1/vdoms" -H "accept: application/json"
```

### Get a Specific VDOM

```bash
curl -X GET "http://localhost:8000/api/vdoms/1" -H "accept: application/json"
```

### Create a New VDOM

```bash
curl -X POST "http://localhost:8000/api/vdoms/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "firewall_id": 1,
    "vdom_name": "customer1",
    "vdom_index": 1
  }'
```

### Update a VDOM

```bash
curl -X PUT "http://localhost:8000/api/vdoms/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "vdom_name": "customer1-renamed"
  }'
```

### Delete a VDOM

```bash
curl -X DELETE "http://localhost:8000/api/vdoms/1" -H "accept: application/json"
```

## Interface Operations

### List All Interfaces

```bash
curl -X GET "http://localhost:8000/api/interfaces/" -H "accept: application/json"
```

### Filter Interfaces by Type

```bash
curl -X GET "http://localhost:8000/api/interfaces/?interface_type=vlan" -H "accept: application/json"
```

### Get Interfaces for a Specific Firewall

```bash
curl -X GET "http://localhost:8000/api/firewalls/1/interfaces" -H "accept: application/json"
```

### Get Interfaces for a Specific VDOM

```bash
curl -X GET "http://localhost:8000/api/vdoms/1/interfaces" -H "accept: application/json"
```

### Get a Specific Interface

```bash
curl -X GET "http://localhost:8000/api/interfaces/1" -H "accept: application/json"
```

### Create a New Interface

```bash
curl -X POST "http://localhost:8000/api/interfaces/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "firewall_id": 1,
    "vdom_id": 1,
    "interface_name": "port1",
    "ip_address": "10.1.1.1",
    "mask": "255.255.255.0",
    "type": "physical",
    "status": "up",
    "description": "WAN Interface"
  }'
```

### Update an Interface

```bash
curl -X PUT "http://localhost:8000/api/interfaces/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "ip_address": "10.1.1.2",
    "description": "Updated WAN Interface"
  }'
```

### Delete an Interface

```bash
curl -X DELETE "http://localhost:8000/api/interfaces/1" -H "accept: application/json"
```

## Route Operations

### List All Routes

```bash
curl -X GET "http://localhost:8000/api/routes/" -H "accept: application/json"
```

### Filter Routes by Type

```bash
curl -X GET "http://localhost:8000/api/routes/?route_type=static" -H "accept: application/json"
```

### Get Routes for a Specific VDOM

```bash
curl -X GET "http://localhost:8000/api/vdoms/1/routes" -H "accept: application/json"
```

### Get a Specific Route

```bash
curl -X GET "http://localhost:8000/api/routes/1" -H "accept: application/json"
```

### Create a New Route

```bash
curl -X POST "http://localhost:8000/api/routes/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "vdom_id": 1,
    "destination_network": "0.0.0.0",
    "mask_length": 0,
    "route_type": "static",
    "gateway": "10.1.1.254",
    "exit_interface_name": "port1"
  }'
```

### Update a Route

```bash
curl -X PUT "http://localhost:8000/api/routes/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "10.1.1.253"
  }'
```

### Delete a Route

```bash
curl -X DELETE "http://localhost:8000/api/routes/1" -H "accept: application/json"
```

## VIP Operations

### List All VIPs

```bash
curl -X GET "http://localhost:8000/api/vips/" -H "accept: application/json"
```

### Filter VIPs by Type

```bash
curl -X GET "http://localhost:8000/api/vips/?vip_type=static-nat" -H "accept: application/json"
```

### Get VIPs for a Specific VDOM

```bash
curl -X GET "http://localhost:8000/api/vdoms/1/vips" -H "accept: application/json"
```

### Get a Specific VIP

```bash
curl -X GET "http://localhost:8000/api/vips/1" -H "accept: application/json"
```

### Create a New VIP

```bash
curl -X POST "http://localhost:8000/api/vips/" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "vdom_id": 1,
    "external_ip": "203.0.113.10",
    "external_port": 80,
    "mapped_ip": "192.168.1.10",
    "mapped_port": 80,
    "vip_type": "port-forwarding",
    "external_interface": "port1"
  }'
```

### Update a VIP

```bash
curl -X PUT "http://localhost:8000/api/vips/1" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "mapped_ip": "192.168.1.11"
  }'
```

### Delete a VIP

```bash
curl -X DELETE "http://localhost:8000/api/vips/1" -H "accept: application/json"
```

## Common HTTP Status Codes

| Status Code | Description | Common Scenarios |
|-------------|-------------|------------------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request that created a new resource |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request format or validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., firewall with same name) |
| 500 | Internal Server Error | Server-side error |

## Using the Interactive Documentation

The API provides Swagger UI documentation at `http://localhost:8000/docs` that allows you to:

1. Explore all available endpoints
2. Test API calls directly from the browser
3. View request and response schemas
4. See available query parameters for filtering

Alternative documentation using ReDoc is available at `http://localhost:8000/redoc`.