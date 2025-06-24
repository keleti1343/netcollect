# Fortinet API Implementation Plan

This document outlines the implementation plan for a FastAPI-based REST API that provides CRUD operations for all tables in the Fortinet database. The API will be structured following modern API design principles and best practices for scalability, maintainability, and security.

## 1. Project Structure

The project will follow this directory structure:

```
fortinet-api/
├── app/
│   ├── __init__.py
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # Database connection and session management
│   ├── schemas/                 # Pydantic models for request/response validation
│   │   ├── __init__.py
│   │   ├── firewall.py
│   │   ├── vdom.py
│   │   ├── interface.py
│   │   ├── route.py
│   │   └── vip.py
│   ├── models/                  # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── firewall.py
│   │   ├── vdom.py
│   │   ├── interface.py
│   │   ├── route.py
│   │   └── vip.py
│   ├── crud/                    # CRUD operations for each table
│   │   ├── __init__.py
│   │   ├── firewall.py
│   │   ├── vdom.py
│   │   ├── interface.py
│   │   ├── route.py
│   │   └── vip.py
│   └── routers/                 # API endpoints for each table
│       ├── __init__.py
│       ├── firewall.py
│       ├── vdom.py
│       ├── interface.py
│       ├── route.py
│       └── vip.py
├── requirements.txt             # Dependencies
├── .env                         # Environment variables for local development
└── README.md                    # Project documentation
```

## 2. Dependencies

The following dependencies will be required:

```
fastapi>=0.95.0
uvicorn>=0.21.1
sqlalchemy>=2.0.0
pydantic>=2.0.0
psycopg2-binary>=2.9.5
python-dotenv>=1.0.0
```

## 3. Database Connection

The database connection will be managed using SQLAlchemy. The database.py file will provide:

- Connection to PostgreSQL database using credentials from .env file
- Session management for database operations
- Base class for ORM models

## 4. Models and Schemas

For each table in the database, we will create:

1. **SQLAlchemy ORM Models**: Represent the database tables
2. **Pydantic Schemas**: For request/response validation with the following types:
   - Base: Common attributes
   - Create: For creating new records (without ID)
   - Update: For updating records (all fields optional)
   - Response: For API responses (with ID)

## 5. CRUD Operations

For each table, we will implement standard CRUD operations:

- Create: Add a new record
- Read: Get a single record by ID or multiple records with optional filtering
- Update: Modify an existing record
- Delete: Remove a record

The operations will handle relationships between tables appropriately.

## 6. API Endpoints

The API will follow RESTful principles with the following endpoints for each table:

### Firewalls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/firewalls | List all firewalls with optional filtering |
| GET | /api/firewalls/{firewall_id} | Get a specific firewall by ID |
| POST | /api/firewalls | Create a new firewall |
| PUT | /api/firewalls/{firewall_id} | Update an existing firewall |
| DELETE | /api/firewalls/{firewall_id} | Delete a firewall |

### VDOMs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vdoms | List all VDOMs with optional filtering |
| GET | /api/vdoms/{vdom_id} | Get a specific VDOM by ID |
| GET | /api/firewalls/{firewall_id}/vdoms | Get all VDOMs for a firewall |
| POST | /api/vdoms | Create a new VDOM |
| PUT | /api/vdoms/{vdom_id} | Update an existing VDOM |
| DELETE | /api/vdoms/{vdom_id} | Delete a VDOM |

### Interfaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/interfaces | List all interfaces with optional filtering |
| GET | /api/interfaces/{interface_id} | Get a specific interface by ID |
| GET | /api/firewalls/{firewall_id}/interfaces | Get all interfaces for a firewall |
| GET | /api/vdoms/{vdom_id}/interfaces | Get all interfaces for a VDOM |
| POST | /api/interfaces | Create a new interface |
| PUT | /api/interfaces/{interface_id} | Update an existing interface |
| DELETE | /api/interfaces/{interface_id} | Delete an interface |

### Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/routes | List all routes with optional filtering |
| GET | /api/routes/{route_id} | Get a specific route by ID |
| GET | /api/vdoms/{vdom_id}/routes | Get all routes for a VDOM |
| POST | /api/routes | Create a new route |
| PUT | /api/routes/{route_id} | Update an existing route |
| DELETE | /api/routes/{route_id} | Delete a route |

### VIPs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vips | List all VIPs with optional filtering |
| GET | /api/vips/{vip_id} | Get a specific VIP by ID |
| GET | /api/vdoms/{vdom_id}/vips | Get all VIPs for a VDOM |
| POST | /api/vips | Create a new VIP |
| PUT | /api/vips/{vip_id} | Update an existing VIP |
| DELETE | /api/vips/{vip_id} | Delete a VIP |

## 7. Implementation Details

Below are detailed implementation guidelines for each component of the API.

### 7.1 Database Connection (database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "55322")

SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 7.2 SQLAlchemy Models

#### models/firewall.py

```python
from sqlalchemy import Column, Integer, String, DateTime, sql
from app.database import Base

class Firewall(Base):
    __tablename__ = "firewalls"

    firewall_id = Column(Integer, primary_key=True, index=True)
    fw_name = Column(String, unique=True, nullable=False)
    fw_ip = Column(String, unique=True, nullable=False)
    fmg_ip = Column(String, nullable=True)
    faz_ip = Column(String, nullable=True)
    site = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())
```

#### models/vdom.py

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class VDOM(Base):
    __tablename__ = "vdoms"

    vdom_id = Column(Integer, primary_key=True, index=True)
    firewall_id = Column(Integer, ForeignKey("firewalls.firewall_id", ondelete="CASCADE"), nullable=False)
    vdom_name = Column(String, nullable=False)
    vdom_index = Column(Integer, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())

    # Define unique constraint
    __table_args__ = (
        UniqueConstraint('firewall_id', 'vdom_name', name='uq_firewall_vdom'),
    )
    
    # Relationships
    firewall = relationship("Firewall", back_populates="vdoms")
    interfaces = relationship("Interface", back_populates="vdom", cascade="all, delete-orphan")
    routes = relationship("Route", back_populates="vdom", cascade="all, delete-orphan")
    vips = relationship("VIP", back_populates="vdom", cascade="all, delete-orphan")
```

#### models/interface.py

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class Interface(Base):
    __tablename__ = "interfaces"

    interface_id = Column(Integer, primary_key=True, index=True)
    firewall_id = Column(Integer, ForeignKey("firewalls.firewall_id", ondelete="CASCADE"), nullable=False)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=True)
    interface_name = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    mask = Column(String, nullable=True)
    type = Column(String, nullable=False)
    vlan_id = Column(Integer, nullable=True)
    description = Column(String, nullable=True)
    status = Column(String, nullable=True)
    physical_interface_name = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())

    # Define unique constraint
    __table_args__ = (
        UniqueConstraint('firewall_id', 'vdom_id', 'interface_name', name='uq_firewall_vdom_interface'),
    )
    
    # Relationships
    firewall = relationship("Firewall", back_populates="interfaces")
    vdom = relationship("VDOM", back_populates="interfaces")
```

#### models/route.py

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql
from sqlalchemy.orm import relationship
from app.database import Base

class Route(Base):
    __tablename__ = "routes"

    route_id = Column(Integer, primary_key=True, index=True)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=False)
    destination_network = Column(String, nullable=False)
    mask_length = Column(Integer, nullable=False)
    route_type = Column(String, nullable=False)
    gateway = Column(String, nullable=True)
    exit_interface_name = Column(String, nullable=False)
    exit_interface_details = Column(String, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())
    
    # Relationships
    vdom = relationship("VDOM", back_populates="routes")
```

#### models/vip.py

```python
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, sql
from sqlalchemy.orm import relationship
from app.database import Base

class VIP(Base):
    __tablename__ = "vips"

    vip_id = Column(Integer, primary_key=True, index=True)
    vdom_id = Column(Integer, ForeignKey("vdoms.vdom_id", ondelete="CASCADE"), nullable=False)
    external_ip = Column(String, nullable=False)
    external_port = Column(Integer, nullable=True)
    mapped_ip = Column(String, nullable=False)
    mapped_port = Column(Integer, nullable=True)
    vip_type = Column(String, nullable=True)
    external_interface = Column(String, nullable=True)
    mask = Column(Integer, nullable=True)
    last_updated = Column(DateTime, server_default=sql.func.now(), onupdate=sql.func.now())
    
    # Relationships
    vdom = relationship("VDOM", back_populates="vips")
```

#### models/__init__.py

```python
from app.models.firewall import Firewall
from app.models.vdom import VDOM
from app.models.interface import Interface
from app.models.route import Route
from app.models.vip import VIP

# Update relationships
Firewall.vdoms = relationship("VDOM", back_populates="firewall", cascade="all, delete-orphan")
Firewall.interfaces = relationship("Interface", back_populates="firewall", cascade="all, delete-orphan")
```

### 7.3 Pydantic Schemas

#### schemas/firewall.py

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base schema with common attributes
class FirewallBase(BaseModel):
    fw_name: str
    fw_ip: str
    fmg_ip: Optional[str] = None
    faz_ip: Optional[str] = None
    site: Optional[str] = None

# Schema for creating a new firewall
class FirewallCreate(FirewallBase):
    pass

# Schema for updating a firewall (all fields optional)
class FirewallUpdate(BaseModel):
    fw_name: Optional[str] = None
    fw_ip: Optional[str] = None
    fmg_ip: Optional[str] = None
    faz_ip: Optional[str] = None
    site: Optional[str] = None

# Schema for firewall responses (includes ID and timestamp)
class FirewallResponse(FirewallBase):
    firewall_id: int
    last_updated: datetime

    class Config:
        orm_mode = True
```

#### schemas/vdom.py

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VDOMBase(BaseModel):
    firewall_id: int
    vdom_name: str
    vdom_index: Optional[int] = None

class VDOMCreate(VDOMBase):
    pass

class VDOMUpdate(BaseModel):
    vdom_name: Optional[str] = None
    vdom_index: Optional[int] = None

class VDOMResponse(VDOMBase):
    vdom_id: int
    last_updated: datetime

    class Config:
        orm_mode = True
```

#### schemas/interface.py

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InterfaceBase(BaseModel):
    firewall_id: int
    vdom_id: Optional[int] = None
    interface_name: str
    ip_address: Optional[str] = None
    mask: Optional[str] = None
    type: str
    vlan_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    physical_interface_name: Optional[str] = None

class InterfaceCreate(InterfaceBase):
    pass

class InterfaceUpdate(BaseModel):
    vdom_id: Optional[int] = None
    interface_name: Optional[str] = None
    ip_address: Optional[str] = None
    mask: Optional[str] = None
    type: Optional[str] = None
    vlan_id: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    physical_interface_name: Optional[str] = None

class InterfaceResponse(InterfaceBase):
    interface_id: int
    last_updated: datetime

    class Config:
        orm_mode = True
```

#### schemas/route.py

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RouteBase(BaseModel):
    vdom_id: int
    destination_network: str
    mask_length: int
    route_type: str
    gateway: Optional[str] = None
    exit_interface_name: str
    exit_interface_details: Optional[str] = None

class RouteCreate(RouteBase):
    pass

class RouteUpdate(BaseModel):
    destination_network: Optional[str] = None
    mask_length: Optional[int] = None
    route_type: Optional[str] = None
    gateway: Optional[str] = None
    exit_interface_name: Optional[str] = None
    exit_interface_details: Optional[str] = None

class RouteResponse(RouteBase):
    route_id: int
    last_updated: datetime

    class Config:
        orm_mode = True
```

#### schemas/vip.py

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VIPBase(BaseModel):
    vdom_id: int
    external_ip: str
    external_port: Optional[int] = None
    mapped_ip: str
    mapped_port: Optional[int] = None
    vip_type: Optional[str] = None
    external_interface: Optional[str] = None
    mask: Optional[int] = None

class VIPCreate(VIPBase):
    pass

class VIPUpdate(BaseModel):
    external_ip: Optional[str] = None
    external_port: Optional[int] = None
    mapped_ip: Optional[str] = None
    mapped_port: Optional[int] = None
    vip_type: Optional[str] = None
    external_interface: Optional[str] = None
    mask: Optional[int] = None

class VIPResponse(VIPBase):
    vip_id: int
    last_updated: datetime

    class Config:
        orm_mode = True
```

### 7.4 CRUD Operations

#### crud/firewall.py

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.firewall import Firewall
from app.schemas.firewall import FirewallCreate, FirewallUpdate

def get_firewall(db: Session, firewall_id: int) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.firewall_id == firewall_id).first()

def get_firewall_by_name(db: Session, fw_name: str) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.fw_name == fw_name).first()

def get_firewall_by_ip(db: Session, fw_ip: str) -> Optional[Firewall]:
    return db.query(Firewall).filter(Firewall.fw_ip == fw_ip).first()

def get_firewalls(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    site: Optional[str] = None
) -> List[Firewall]:
    query = db.query(Firewall)
    if site:
        query = query.filter(Firewall.site == site)
    return query.offset(skip).limit(limit).all()

def create_firewall(db: Session, firewall: FirewallCreate) -> Firewall:
    db_firewall = Firewall(
        fw_name=firewall.fw_name,
        fw_ip=firewall.fw_ip,
        fmg_ip=firewall.fmg_ip,
        faz_ip=firewall.faz_ip,
        site=firewall.site
    )
    db.add(db_firewall)
    db.commit()
    db.refresh(db_firewall)
    return db_firewall

def update_firewall(
    db: Session, 
    firewall_id: int, 
    firewall: FirewallUpdate
) -> Optional[Firewall]:
    db_firewall = get_firewall(db, firewall_id)
    if db_firewall is None:
        return None
    
    update_data = firewall.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_firewall, key, value)
    
    db.commit()
    db.refresh(db_firewall)
    return db_firewall

def delete_firewall(db: Session, firewall_id: int) -> bool:
    db_firewall = get_firewall(db, firewall_id)
    if db_firewall is None:
        return False
    
    db.delete(db_firewall)
    db.commit()
    return True
```

#### crud/vdom.py

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.vdom import VDOM
from app.schemas.vdom import VDOMCreate, VDOMUpdate

def get_vdom(db: Session, vdom_id: int) -> Optional[VDOM]:
    return db.query(VDOM).filter(VDOM.vdom_id == vdom_id).first()

def get_vdoms(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    firewall_id: Optional[int] = None
) -> List[VDOM]:
    query = db.query(VDOM)
    if firewall_id:
        query = query.filter(VDOM.firewall_id == firewall_id)
    return query.offset(skip).limit(limit).all()

def get_vdom_by_name_and_firewall(
    db: Session, 
    vdom_name: str, 
    firewall_id: int
) -> Optional[VDOM]:
    return db.query(VDOM).filter(
        VDOM.vdom_name == vdom_name,
        VDOM.firewall_id == firewall_id
    ).first()

def create_vdom(db: Session, vdom: VDOMCreate) -> VDOM:
    db_vdom = VDOM(
        firewall_id=vdom.firewall_id,
        vdom_name=vdom.vdom_name,
        vdom_index=vdom.vdom_index
    )
    db.add(db_vdom)
    db.commit()
    db.refresh(db_vdom)
    return db_vdom

def update_vdom(
    db: Session, 
    vdom_id: int, 
    vdom: VDOMUpdate
) -> Optional[VDOM]:
    db_vdom = get_vdom(db, vdom_id)
    if db_vdom is None:
        return None
    
    update_data = vdom.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vdom, key, value)
    
    db.commit()
    db.refresh(db_vdom)
    return db_vdom

def delete_vdom(db: Session, vdom_id: int) -> bool:
    db_vdom = get_vdom(db, vdom_id)
    if db_vdom is None:
        return False
    
    db.delete(db_vdom)
    db.commit()
    return True
```

#### crud/interface.py

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.interface import Interface
from app.schemas.interface import InterfaceCreate, InterfaceUpdate

def get_interface(db: Session, interface_id: int) -> Optional[Interface]:
    return db.query(Interface).filter(Interface.interface_id == interface_id).first()

def get_interfaces(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    firewall_id: Optional[int] = None,
    vdom_id: Optional[int] = None,
    interface_type: Optional[str] = None
) -> List[Interface]:
    query = db.query(Interface)
    
    if firewall_id:
        query = query.filter(Interface.firewall_id == firewall_id)
    if vdom_id:
        query = query.filter(Interface.vdom_id == vdom_id)
    if interface_type:
        query = query.filter(Interface.type == interface_type)
        
    return query.offset(skip).limit(limit).all()

def get_interface_by_name(
    db: Session, 
    firewall_id: int, 
    vdom_id: Optional[int],
    interface_name: str
) -> Optional[Interface]:
    query = db.query(Interface).filter(
        Interface.firewall_id == firewall_id,
        Interface.interface_name == interface_name
    )
    
    if vdom_id:
        query = query.filter(Interface.vdom_id == vdom_id)
    else:
        query = query.filter(Interface.vdom_id.is_(None))
        
    return query.first()

def create_interface(db: Session, interface: InterfaceCreate) -> Interface:
    db_interface = Interface(
        firewall_id=interface.firewall_id,
        vdom_id=interface.vdom_id,
        interface_name=interface.interface_name,
        ip_address=interface.ip_address,
        mask=interface.mask,
        type=interface.type,
        vlan_id=interface.vlan_id,
        description=interface.description,
        status=interface.status,
        physical_interface_name=interface.physical_interface_name
    )
    db.add(db_interface)
    db.commit()
    db.refresh(db_interface)
    return db_interface

def update_interface(
    db: Session, 
    interface_id: int, 
    interface: InterfaceUpdate
) -> Optional[Interface]:
    db_interface = get_interface(db, interface_id)
    if db_interface is None:
        return None
    
    update_data = interface.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interface, key, value)
    
    db.commit()
    db.refresh(db_interface)
    return db_interface

def delete_interface(db: Session, interface_id: int) -> bool:
    db_interface = get_interface(db, interface_id)
    if db_interface is None:
        return False
    
    db.delete(db_interface)
    db.commit()
    return True
```

#### crud/route.py

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.route import Route
from app.schemas.route import RouteCreate, RouteUpdate

def get_route(db: Session, route_id: int) -> Optional[Route]:
    return db.query(Route).filter(Route.route_id == route_id).first()

def get_routes(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None
) -> List[Route]:
    query = db.query(Route)
    
    if vdom_id:
        query = query.filter(Route.vdom_id == vdom_id)
    if route_type:
        query = query.filter(Route.route_type == route_type)
        
    return query.offset(skip).limit(limit).all()

def create_route(db: Session, route: RouteCreate) -> Route:
    db_route = Route(
        vdom_id=route.vdom_id,
        destination_network=route.destination_network,
        mask_length=route.mask_length,
        route_type=route.route_type,
        gateway=route.gateway,
        exit_interface_name=route.exit_interface_name,
        exit_interface_details=route.exit_interface_details
    )
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

def update_route(
    db: Session, 
    route_id: int, 
    route: RouteUpdate
) -> Optional[Route]:
    db_route = get_route(db, route_id)
    if db_route is None:
        return None
    
    update_data = route.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_route, key, value)
    
    db.commit()
    db.refresh(db_route)
    return db_route

def delete_route(db: Session, route_id: int) -> bool:
    db_route = get_route(db, route_id)
    if db_route is None:
        return False
    
    db.delete(db_route)
    db.commit()
    return True
```

#### crud/vip.py

```python
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.vip import VIP
from app.schemas.vip import VIPCreate, VIPUpdate

def get_vip(db: Session, vip_id: int) -> Optional[VIP]:
    return db.query(VIP).filter(VIP.vip_id == vip_id).first()

def get_vips(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    vdom_id: Optional[int] = None,
    vip_type: Optional[str] = None
) -> List[VIP]:
    query = db.query(VIP)
    
    if vdom_id:
        query = query.filter(VIP.vdom_id == vdom_id)
    if vip_type:
        query = query.filter(VIP.vip_type == vip_type)
        
    return query.offset(skip).limit(limit).all()

def create_vip(db: Session, vip: VIPCreate) -> VIP:
    db_vip = VIP(
        vdom_id=vip.vdom_id,
        external_ip=vip.external_ip,
        external_port=vip.external_port,
        mapped_ip=vip.mapped_ip,
        mapped_port=vip.mapped_port,
        vip_type=vip.vip_type,
        external_interface=vip.external_interface,
        mask=vip.mask
    )
    db.add(db_vip)
    db.commit()
    db.refresh(db_vip)
    return db_vip

def update_vip(
    db: Session, 
    vip_id: int, 
    vip: VIPUpdate
) -> Optional[VIP]:
    db_vip = get_vip(db, vip_id)
    if db_vip is None:
        return None
    
    update_data = vip.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_vip, key, value)
    
    db.commit()
    db.refresh(db_vip)
    return db_vip

def delete_vip(db: Session, vip_id: int) -> bool:
    db_vip = get_vip(db, vip_id)
    if db_vip is None:
        return False
    
    db.delete(db_vip)
    db.commit()
    return True
```

### 7.5 API Routers

#### routers/firewall.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.firewall import FirewallCreate, FirewallUpdate, FirewallResponse
import app.crud.firewall as crud

router = APIRouter(
    prefix="/api/firewalls",
    tags=["firewalls"],
    responses={404: {"description": "Firewall not found"}}
)

@router.get("/", response_model=List[FirewallResponse])
def read_firewalls(
    skip: int = 0, 
    limit: int = 100, 
    site: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve firewalls with optional filtering by site.
    """
    firewalls = crud.get_firewalls(db, skip=skip, limit=limit, site=site)
    return firewalls

@router.get("/{firewall_id}", response_model=FirewallResponse)
def read_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """
    Get a specific firewall by ID.
    """
    db_firewall = crud.get_firewall(db, firewall_id=firewall_id)
    if db_firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return db_firewall

@router.post("/", response_model=FirewallResponse, status_code=201)
def create_firewall(firewall: FirewallCreate, db: Session = Depends(get_db)):
    """
    Create a new firewall.
    """
    db_firewall = crud.get_firewall_by_name(db, fw_name=firewall.fw_name)
    if db_firewall:
        raise HTTPException(status_code=400, detail="Firewall name already registered")
    
    db_firewall = crud.get_firewall_by_ip(db, fw_ip=firewall.fw_ip)
    if db_firewall:
        raise HTTPException(status_code=400, detail="Firewall IP already registered")
    
    return crud.create_firewall(db=db, firewall=firewall)

@router.put("/{firewall_id}", response_model=FirewallResponse)
def update_firewall(
    firewall_id: int, 
    firewall: FirewallUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a firewall by ID.
    """
    db_firewall = crud.update_firewall(db, firewall_id=firewall_id, firewall=firewall)
    if db_firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return db_firewall

@router.delete("/{firewall_id}", status_code=204)
def delete_firewall(firewall_id: int, db: Session = Depends(get_db)):
    """
    Delete a firewall by ID.
    """
    success = crud.delete_firewall(db, firewall_id=firewall_id)
    if not success:
        raise HTTPException(status_code=404, detail="Firewall not found")
    return None
```

#### routers/vdom.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.vdom import VDOMCreate, VDOMUpdate, VDOMResponse
import app.crud.vdom as crud
import app.crud.firewall as firewall_crud

router = APIRouter(
    prefix="/api/vdoms",
    tags=["vdoms"],
    responses={404: {"description": "VDOM not found"}}
)

@router.get("/", response_model=List[VDOMResponse])
def read_vdoms(
    skip: int = 0, 
    limit: int = 100, 
    firewall_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve VDOMs with optional filtering by firewall ID.
    """
    vdoms = crud.get_vdoms(db, skip=skip, limit=limit, firewall_id=firewall_id)
    return vdoms

@router.get("/{vdom_id}", response_model=VDOMResponse)
def read_vdom(vdom_id: int, db: Session = Depends(get_db)):
    """
    Get a specific VDOM by ID.
    """
    db_vdom = crud.get_vdom(db, vdom_id=vdom_id)
    if db_vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return db_vdom

@router.get("/firewall/{firewall_id}", response_model=List[VDOMResponse])
def read_vdoms_by_firewall(
    firewall_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all VDOMs for a specific firewall.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    vdoms = crud.get_vdoms(db, firewall_id=firewall_id)
    return vdoms

@router.post("/", response_model=VDOMResponse, status_code=201)
def create_vdom(vdom: VDOMCreate, db: Session = Depends(get_db)):
    """
    Create a new VDOM.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=vdom.firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    # Check for duplicate VDOM name on the same firewall
    existing_vdom = crud.get_vdom_by_name_and_firewall(
        db, 
        vdom_name=vdom.vdom_name, 
        firewall_id=vdom.firewall_id
    )
    if existing_vdom:
        raise HTTPException(
            status_code=400, 
            detail=f"VDOM with name '{vdom.vdom_name}' already exists on this firewall"
        )
    
    return crud.create_vdom(db=db, vdom=vdom)

@router.put("/{vdom_id}", response_model=VDOMResponse)
def update_vdom(
    vdom_id: int, 
    vdom: VDOMUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a VDOM by ID.
    """
    db_vdom = crud.update_vdom(db, vdom_id=vdom_id, vdom=vdom)
    if db_vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return db_vdom

@router.delete("/{vdom_id}", status_code=204)
def delete_vdom(vdom_id: int, db: Session = Depends(get_db)):
    """
    Delete a VDOM by ID.
    """
    success = crud.delete_vdom(db, vdom_id=vdom_id)
    if not success:
        raise HTTPException(status_code=404, detail="VDOM not found")
    return None
```

#### routers/interface.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.interface import InterfaceCreate, InterfaceUpdate, InterfaceResponse
import app.crud.interface as crud
import app.crud.firewall as firewall_crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/interfaces",
    tags=["interfaces"],
    responses={404: {"description": "Interface not found"}}
)

@router.get("/", response_model=List[InterfaceResponse])
def read_interfaces(
    skip: int = 0, 
    limit: int = 100, 
    firewall_id: Optional[int] = None,
    vdom_id: Optional[int] = None,
    interface_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve interfaces with optional filtering.
    """
    interfaces = crud.get_interfaces(
        db, skip=skip, limit=limit, 
        firewall_id=firewall_id, vdom_id=vdom_id,
        interface_type=interface_type
    )
    return interfaces

@router.get("/{interface_id}", response_model=InterfaceResponse)
def read_interface(interface_id: int, db: Session = Depends(get_db)):
    """
    Get a specific interface by ID.
    """
    db_interface = crud.get_interface(db, interface_id=interface_id)
    if db_interface is None:
        raise HTTPException(status_code=404, detail="Interface not found")
    return db_interface

@router.get("/firewall/{firewall_id}", response_model=List[InterfaceResponse])
def read_interfaces_by_firewall(
    firewall_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all interfaces for a specific firewall.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    interfaces = crud.get_interfaces(db, firewall_id=firewall_id)
    return interfaces

@router.get("/vdom/{vdom_id}", response_model=List[InterfaceResponse])
def read_interfaces_by_vdom(
    vdom_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all interfaces for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    interfaces = crud.get_interfaces(db, vdom_id=vdom_id)
    return interfaces

@router.post("/", response_model=InterfaceResponse, status_code=201)
def create_interface(interface: InterfaceCreate, db: Session = Depends(get_db)):
    """
    Create a new interface.
    """
    # Verify firewall exists
    firewall = firewall_crud.get_firewall(db, firewall_id=interface.firewall_id)
    if firewall is None:
        raise HTTPException(status_code=404, detail="Firewall not found")
    
    # Verify VDOM exists if provided
    if interface.vdom_id:
        vdom = vdom_crud.get_vdom(db, vdom_id=interface.vdom_id)
        if vdom is None:
            raise HTTPException(status_code=404, detail="VDOM not found")
        
        # Verify VDOM belongs to the specified firewall
        if vdom.firewall_id != interface.firewall_id:
            raise HTTPException(
                status_code=400, 
                detail="VDOM does not belong to the specified firewall"
            )
    
    # Check for duplicate interface name
    existing_interface = crud.get_interface_by_name(
        db, 
        firewall_id=interface.firewall_id,
        vdom_id=interface.vdom_id,
        interface_name=interface.interface_name
    )
    if existing_interface:
        raise HTTPException(
            status_code=400, 
            detail=f"Interface with name '{interface.interface_name}' already exists in this context"
        )
    
    return crud.create_interface(db=db, interface=interface)

@router.put("/{interface_id}", response_model=InterfaceResponse)
def update_interface(
    interface_id: int, 
    interface: InterfaceUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an interface by ID.
    """
    # Verify interface exists
    db_interface = crud.get_interface(db, interface_id=interface_id)
    if db_interface is None:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    # If VDOM ID is provided, verify it exists
    if interface.vdom_id:
        vdom = vdom_crud.get_vdom(db, vdom_id=interface.vdom_id)
        if vdom is None:
            raise HTTPException(status_code=404, detail="VDOM not found")
        
        # Verify VDOM belongs to the correct firewall
        if vdom.firewall_id != db_interface.firewall_id:
            raise HTTPException(
                status_code=400, 
                detail="VDOM does not belong to the interface's firewall"
            )
    
    # If interface name is changed, check for duplicates
    if interface.interface_name and interface.interface_name != db_interface.interface_name:
        existing_interface = crud.get_interface_by_name(
            db, 
            firewall_id=db_interface.firewall_id,
            vdom_id=interface.vdom_id if interface.vdom_id is not None else db_interface.vdom_id,
            interface_name=interface.interface_name
        )
        if existing_interface:
            raise HTTPException(
                status_code=400, 
                detail=f"Interface with name '{interface.interface_name}' already exists in this context"
            )
    
    updated_interface = crud.update_interface(db, interface_id=interface_id, interface=interface)
    return updated_interface

@router.delete("/{interface_id}", status_code=204)
def delete_interface(interface_id: int, db: Session = Depends(get_db)):
    """
    Delete an interface by ID.
    """
    success = crud.delete_interface(db, interface_id=interface_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interface not found")
    return None
```

#### routers/route.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.route import RouteCreate, RouteUpdate, RouteResponse
import app.crud.route as crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/routes",
    tags=["routes"],
    responses={404: {"description": "Route not found"}}
)

@router.get("/", response_model=List[RouteResponse])
def read_routes(
    skip: int = 0, 
    limit: int = 100, 
    vdom_id: Optional[int] = None,
    route_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve routes with optional filtering.
    """
    routes = crud.get_routes(
        db, skip=skip, limit=limit, 
        vdom_id=vdom_id, route_type=route_type
    )
    return routes

@router.get("/{route_id}", response_model=RouteResponse)
def read_route(route_id: int, db: Session = Depends(get_db)):
    """
    Get a specific route by ID.
    """
    db_route = crud.get_route(db, route_id=route_id)
    if db_route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return db_route

@router.get("/vdom/{vdom_id}", response_model=List[RouteResponse])
def read_routes_by_vdom(
    vdom_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all routes for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    routes = crud.get_routes(db, vdom_id=vdom_id)
    return routes

@router.post("/", response_model=RouteResponse, status_code=201)
def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """
    Create a new route.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=route.vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    return crud.create_route(db=db, route=route)

@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int, 
    route: RouteUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a route by ID.
    """
    db_route = crud.update_route(db, route_id=route_id, route=route)
    if db_route is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return db_route

@router.delete("/{route_id}", status_code=204)
def delete_route(route_id: int, db: Session = Depends(get_db)):
    """
    Delete a route by ID.
    """
    success = crud.delete_route(db, route_id=route_id)
    if not success:
        raise HTTPException(status_code=404, detail="Route not found")
    return None
```

#### routers/vip.py

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.vip import VIPCreate, VIPUpdate, VIPResponse
import app.crud.vip as crud
import app.crud.vdom as vdom_crud

router = APIRouter(
    prefix="/api/vips",
    tags=["vips"],
    responses={404: {"description": "VIP not found"}}
)

@router.get("/", response_model=List[VIPResponse])
def read_vips(
    skip: int = 0, 
    limit: int = 100, 
    vdom_id: Optional[int] = None,
    vip_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve VIPs with optional filtering.
    """
    vips = crud.get_vips(
        db, skip=skip, limit=limit, 
        vdom_id=vdom_id, vip_type=vip_type
    )
    return vips

@router.get("/{vip_id}", response_model=VIPResponse)
def read_vip(vip_id: int, db: Session = Depends(get_db)):
    """
    Get a specific VIP by ID.
    """
    db_vip = crud.get_vip(db, vip_id=vip_id)
    if db_vip is None:
        raise HTTPException(status_code=404, detail="VIP not found")
    return db_vip

@router.get("/vdom/{vdom_id}", response_model=List[VIPResponse])
def read_vips_by_vdom(
    vdom_id: int, 
    db: Session = Depends(get_db)
):
    """
    Get all VIPs for a specific VDOM.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    vips = crud.get_vips(db, vdom_id=vdom_id)
    return vips

@router.post("/", response_model=VIPResponse, status_code=201)
def create_vip(vip: VIPCreate, db: Session = Depends(get_db)):
    """
    Create a new VIP.
    """
    # Verify VDOM exists
    vdom = vdom_crud.get_vdom(db, vdom_id=vip.vdom_id)
    if vdom is None:
        raise HTTPException(status_code=404, detail="VDOM not found")
    
    return crud.create_vip(db=db, vip=vip)

@router.put("/{vip_id}", response_model=VIPResponse)
def update_vip(
    vip_id: int, 
    vip: VIPUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a VIP by ID.
    """
    db_vip = crud.update_vip(db, vip_id=vip_id, vip=vip)
    if db_vip is None:
        raise HTTPException(status_code=404, detail="VIP not found")
    return db_vip

@router.delete("/{vip_id}", status_code=204)
def delete_vip(vip_id: int, db: Session = Depends(get_db)):
    """
    Delete a VIP by ID.
    """
    success = crud.delete_vip(db, vip_id=vip_id)
    if not success:
        raise HTTPException(status_code=404, detail="VIP not found")
    return None
```

### 7.6 Main Application

#### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import firewall, vdom, interface, route, vip
from app.database import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fortinet API",
    description="API for managing Fortinet device configuration data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(firewall.router)
app.include_router(vdom.router)
app.include_router(interface.router)
app.include_router(route.router)
app.include_router(vip.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Fortinet API",
        "docs": "/docs",
        "redoc": "/redoc"
    }
```

## 8. Setup and Running the API

### 8.1 Installation

1. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Copy the `.env` file to the fortinet-api directory:
   ```bash
   cp .env fortinet-api/.env
   ```

### 8.2 Running the API

Start the API server using Uvicorn:

```bash
cd fortinet-api
uvicorn app.main:app --reload
```

The API will be available at:
- API: http://localhost:8000
- Interactive documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## 9. Testing

Test the API endpoints using the Swagger UI at `/docs` or with tools like curl or Postman.

Example curl commands:

### 9.1 Create a Firewall

```bash
curl -X 'POST' \
  'http://localhost:8000/api/firewalls/' \
  -H 'Content-Type: application/json' \
  -d '{
    "fw_name": "test-firewall",
    "fw_ip": "192.168.1.1",
    "site": "Main Office"
  }'
```

### 9.2 List Firewalls

```bash
curl -X 'GET' 'http://localhost:8000/api/firewalls/'
```

## 10. Conclusion

This implementation plan provides a complete FastAPI-based REST API for managing Fortinet device data. The API follows best practices for a modern REST API, including:

- Clean separation of concerns (database, models, schemas, CRUD operations, and API endpoints)
- Type validation with Pydantic
- Data persistence with SQLAlchemy ORM
- RESTful API design
- Comprehensive documentation
- Proper error handling

The engineer implementing this solution should follow the provided code samples and structure, adapting as needed to meet specific requirements.