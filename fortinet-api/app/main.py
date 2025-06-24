from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import firewall, vdom, interface, route, vip, search
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
app.include_router(search.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Fortinet API",
        "docs": "/docs",
        "redoc": "/redoc"
    }