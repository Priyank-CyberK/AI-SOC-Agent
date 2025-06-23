"""
Threat detection models
"""

from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum

from ..core.database import Base


class ThreatType(str, enum.Enum):
    MALWARE = "malware"
    DDOS = "ddos"
    INTRUSION = "intrusion"
    DATA_BREACH = "data_breach"
    PORT_SCAN = "port_scan"
    ANOMALY = "anomaly"
    PHISHING = "phishing"
    BOTNET = "botnet"
    APT = "apt"


class ThreatSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ThreatStatus(str, enum.Enum):
    DETECTED = "detected"
    ANALYZING = "analyzing"
    CONFIRMED = "confirmed"
    FALSE_POSITIVE = "false_positive"
    MITIGATED = "mitigated"
    RESOLVED = "resolved"


class Threat(Base):
    """Threat detection record"""
    __tablename__ = "threats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Threat classification
    threat_type = Column(Enum(ThreatType), nullable=False)
    severity = Column(Enum(ThreatSeverity), nullable=False)
    status = Column(Enum(ThreatStatus), default=ThreatStatus.DETECTED, nullable=False)
    
    # Network information
    source_ip = Column(String(45), nullable=False)  # IPv4/IPv6
    destination_ip = Column(String(45), nullable=False)
    source_port = Column(Integer)
    destination_port = Column(Integer)
    protocol = Column(String(10))
    
    # Threat details
    description = Column(Text, nullable=False)
    indicators = Column(JSON)  # IOCs, signatures, etc.
    raw_data = Column(Text)  # Original log/packet data
    
    # AI analysis
    ai_confidence = Column(Float, nullable=False)
    ml_model_version = Column(String(50))
    analysis_details = Column(JSON)
    
    # Response tracking
    response_actions = Column(JSON)
    response_status = Column(String(50))
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Threat(id={self.id}, type={self.threat_type}, severity={self.severity})>"


class ThreatIntelligence(Base):
    """Threat intelligence data"""
    __tablename__ = "threat_intelligence"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # IOC information
    ioc_type = Column(String(50), nullable=False)  # ip, domain, hash, etc.
    ioc_value = Column(String(500), nullable=False)
    
    # Threat context
    threat_type = Column(Enum(ThreatType))
    severity = Column(Enum(ThreatSeverity))
    description = Column(Text)
    
    # Source information
    source = Column(String(100), nullable=False)  # MISP, commercial feed, etc.
    confidence = Column(Float)
    first_seen = Column(DateTime)
    last_seen = Column(DateTime)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<ThreatIntelligence(ioc_type={self.ioc_type}, value={self.ioc_value})>"