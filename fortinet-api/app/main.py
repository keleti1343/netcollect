from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from datetime import datetime

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
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for load balancer and monitoring"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "fortinet-api",
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development")
        }
    )

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