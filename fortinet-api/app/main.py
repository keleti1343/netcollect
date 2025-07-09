from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import your existing routers here
from app.routers import firewall, vdom, interface, route, vip, search

app = FastAPI(
    title="Fortinet Network Collector API",
    description="API for collecting and managing Fortinet network data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Fortinet API server")
    logger.info(f"Workers configured: {os.environ.get('WORKERS', 1)}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Fortinet API server")

@app.get("/health")
async def health_check():
    """Health check endpoint for load balancer and monitoring"""
    return {"status": "healthy", "service": "fortinet-api"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Fortinet Network Collector API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Include your existing routers here
app.include_router(firewall.router)
app.include_router(vdom.router)
app.include_router(interface.router)
app.include_router(route.router)
app.include_router(vip.router)
app.include_router(search.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("RELOAD", "false").lower() == "true"
    )