#!/usr/bin/env python3
"""
AI-Powered SOC Agent - Main Application Entry Point
"""

import asyncio
import logging
import signal
import sys
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import settings
from src.core.logging import setup_logging
from src.api.routes import api_router
from src.core.database import init_db
from src.services.monitoring import NetworkMonitor
from src.services.ai_engine import AIEngine
from src.services.response_engine import ResponseEngine
from src.core.websocket import websocket_manager

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AI SOC Agent",
    description="AI-Powered Security Operations Center Agent",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Global services
network_monitor = None
ai_engine = None
response_engine = None


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    global network_monitor, ai_engine, response_engine
    
    logger.info("Starting AI SOC Agent...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized")
        
        # Initialize AI Engine
        ai_engine = AIEngine()
        await ai_engine.initialize()
        logger.info("AI Engine initialized")
        
        # Initialize Response Engine
        response_engine = ResponseEngine()
        await response_engine.initialize()
        logger.info("Response Engine initialized")
        
        # Initialize Network Monitor
        network_monitor = NetworkMonitor(
            ai_engine=ai_engine,
            response_engine=response_engine
        )
        await network_monitor.start()
        logger.info("Network Monitor started")
        
        logger.info("AI SOC Agent startup complete")
        
    except Exception as e:
        logger.error(f"Failed to start AI SOC Agent: {e}")
        sys.exit(1)


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global network_monitor, ai_engine, response_engine
    
    logger.info("Shutting down AI SOC Agent...")
    
    if network_monitor:
        await network_monitor.stop()
        logger.info("Network Monitor stopped")
    
    if response_engine:
        await response_engine.shutdown()
        logger.info("Response Engine stopped")
    
    if ai_engine:
        await ai_engine.shutdown()
        logger.info("AI Engine stopped")
    
    logger.info("AI SOC Agent shutdown complete")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "network_monitor": network_monitor.is_running if network_monitor else False,
            "ai_engine": ai_engine.is_ready if ai_engine else False,
            "response_engine": response_engine.is_ready if response_engine else False,
        }
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI SOC Agent API",
        "version": "1.0.0",
        "docs": "/docs"
    }


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    sys.exit(0)


async def main():
    """Main application entry point"""
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start the server
    config = uvicorn.Config(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower(),
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4
    )
    
    server = uvicorn.Server(config)
    
    try:
        await server.serve()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())