# Fortinet API

A FastAPI-based REST API for managing Fortinet device configuration data. This API provides CRUD operations for Fortinet firewalls, VDOMs, interfaces, routes, and VIPs.

## Documentation

Detailed implementation documentation is available in the `plan` directory:

- [Implementation Plan](plan/implementation_plan.md): Comprehensive guide with detailed code examples for implementing the API
- [Quick Start Guide](plan/quick_start_guide.md): Step-by-step instructions for setting up and implementing the project
- [API Usage Examples](plan/api_usage_examples.md): Examples of how to interact with the API using curl
- [Database to API Mapping](plan/database_to_api_mapping.md): Mapping between database tables and API endpoints/schemas

## Features

- **Comprehensive CRUD Operations**: Create, read, update, and delete operations for all entities
- **RESTful Design**: API follows REST principles for consistent and intuitive usage
- **Type Validation**: Strong type validation using Pydantic models
- **Relationship Management**: Proper handling of relationships between entities
- **Interactive Documentation**: Auto-generated Swagger UI and ReDoc documentation

## Data Model

The API manages the following entities:

- **Firewalls**: Physical or virtual Fortinet firewall devices
- **VDOMs**: Virtual Domains within firewalls
- **Interfaces**: Network interfaces on firewalls
- **Routes**: Network routes defined in VDOMs
- **VIPs**: Virtual IP configurations for NAT and port forwarding

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the API:
   ```bash
   uvicorn app.main:app --reload --port 8800
   ```

3. Access the API documentation:
   - Swagger UI: http://localhost:8800/docs
      - ReDoc: http://localhost:8800/redoc

## API Endpoints

The API provides the following endpoint groups:

- `/api/firewalls`: Manage firewall devices
- `/api/vdoms`: Manage Virtual Domains
- `/api/interfaces`: Manage network interfaces
- `/api/routes`: Manage routing tables
- `/api/vips`: Manage Virtual IPs

See the [API Usage Examples](plan/api_usage_examples.md) for detailed examples of how to use these endpoints.

## Database Connection

The API connects to a PostgreSQL database using environment variables:

- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_HOST`: Database host
- `DB_PORT`: Database port

These can be configured in the `.env` file.

## Development

For development guidelines and implementation details, refer to the [Implementation Plan](plan/implementation_plan.md).