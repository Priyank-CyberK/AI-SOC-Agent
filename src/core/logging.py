"""
Logging configuration for AI SOC Agent
"""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any

from pythonjsonlogger import jsonlogger

from .config import settings


def setup_logging() -> None:
    """Setup application logging"""
    
    # Create logs directory
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Logging configuration
    config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s"
            },
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json" if settings.LOG_FORMAT == "json" else "standard",
                "stream": sys.stdout
            },
            "file": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": settings.LOG_LEVEL,
                "formatter": "json",
                "filename": "logs/soc-agent.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5
            },
            "security": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": "logs/security.log",
                "maxBytes": 10485760,
                "backupCount": 10
            },
            "audit": {
                "class": "logging.handlers.RotatingFileHandler",
                "level": "INFO",
                "formatter": "json",
                "filename": "logs/audit.log",
                "maxBytes": 10485760,
                "backupCount": 20
            }
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console", "file"],
                "level": settings.LOG_LEVEL,
                "propagate": False
            },
            "security": {
                "handlers": ["console", "security"],
                "level": "INFO",
                "propagate": False
            },
            "audit": {
                "handlers": ["console", "audit"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            }
        }
    }
    
    logging.config.dictConfig(config)


# Specialized loggers
security_logger = logging.getLogger("security")
audit_logger = logging.getLogger("audit")


def log_security_event(event_type: str, details: Dict[str, Any]) -> None:
    """Log security events"""
    security_logger.info(
        "Security event",
        extra={
            "event_type": event_type,
            "details": details
        }
    )


def log_audit_event(action: str, user: str, details: Dict[str, Any]) -> None:
    """Log audit events"""
    audit_logger.info(
        "Audit event",
        extra={
            "action": action,
            "user": user,
            "details": details
        }
    )