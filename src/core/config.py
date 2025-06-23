"""
Configuration management for AI SOC Agent
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, validator


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "AI SOC Agent"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "postgresql://soc_user:soc_pass@localhost:5432/soc_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Elasticsearch
    ELASTICSEARCH_URL: str = "http://localhost:9200"
    ELASTICSEARCH_INDEX: str = "soc-logs"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4"
    
    # Network Monitoring
    SNORT_LOG_PATH: str = "/var/log/snort"
    ZEEK_LOG_PATH: str = "/var/log/zeek"
    PCAP_INTERFACE: str = "eth0"
    
    # ML Models
    MODEL_PATH: str = "./models"
    TRAINING_DATA_PATH: str = "./training_data"
    
    # Threat Intelligence
    MISP_URL: Optional[str] = None
    MISP_KEY: Optional[str] = None
    
    # Firewall Integration
    FIREWALL_TYPE: str = "pfsense"  # pfsense, opnsense, iptables
    FIREWALL_HOST: Optional[str] = None
    FIREWALL_USERNAME: Optional[str] = None
    FIREWALL_PASSWORD: Optional[str] = None
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # Monitoring
    PROMETHEUS_PORT: int = 9090
    METRICS_ENABLED: bool = True
    
    # AI Engine
    AI_CONFIDENCE_THRESHOLD: float = 0.7
    AUTO_RESPONSE_ENABLED: bool = False
    MAX_CONCURRENT_ANALYSIS: int = 10
    
    # Response Engine
    RESPONSE_TIMEOUT: int = 30
    MAX_RETRIES: int = 3
    
    @validator("OPENAI_API_KEY")
    def validate_openai_key(cls, v):
        if not v:
            raise ValueError("OPENAI_API_KEY is required")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()