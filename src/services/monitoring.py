"""
Network monitoring service using Snort and Zeek
"""

import asyncio
import logging
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
from dataclasses import dataclass

import aiofiles
from scapy.all import sniff, IP, TCP, UDP
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from ..core.config import settings
from ..models.threat import Threat, ThreatType, ThreatSeverity
from ..core.logging import log_security_event

logger = logging.getLogger(__name__)


@dataclass
class NetworkEvent:
    """Network event data structure"""
    timestamp: datetime
    source_ip: str
    dest_ip: str
    source_port: Optional[int]
    dest_port: Optional[int]
    protocol: str
    event_type: str
    severity: str
    description: str
    raw_data: str


class SnortLogHandler(FileSystemEventHandler):
    """Handle Snort log file changes"""
    
    def __init__(self, monitor: 'NetworkMonitor'):
        self.monitor = monitor
        self.logger = logging.getLogger(__name__ + ".SnortLogHandler")
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        if event.src_path.endswith('.log'):
            asyncio.create_task(self.process_snort_log(event.src_path))
    
    async def process_snort_log(self, log_path: str):
        """Process new Snort log entries"""
        try:
            async with aiofiles.open(log_path, 'r') as f:
                # Read new lines (in production, track file position)
                lines = await f.readlines()
                
                for line in lines[-10:]:  # Process last 10 lines
                    event = self.parse_snort_alert(line.strip())
                    if event:
                        await self.monitor.process_network_event(event)
                        
        except Exception as e:
            self.logger.error(f"Error processing Snort log {log_path}: {e}")
    
    def parse_snort_alert(self, line: str) -> Optional[NetworkEvent]:
        """Parse Snort alert format"""
        # Example Snort alert format:
        # [**] [1:2100498:7] GPL CHAT IRC privmsg command [**]
        # [Classification: Misc activity] [Priority: 3]
        # 01/28-22:26:04.877970 192.168.1.100:1024 -> 192.168.1.1:6667
        
        try:
            # Regex pattern for Snort alerts
            pattern = r'\[(\d+:\d+:\d+)\] (.+?) \[.*?\] \[Priority: (\d+)\] (\d+/\d+-\d+:\d+:\d+\.\d+) (.+?) -> (.+)'
            match = re.match(pattern, line)
            
            if not match:
                return None
            
            sid, description, priority, timestamp_str, source, dest = match.groups()
            
            # Parse source and destination
            source_parts = source.split(':')
            dest_parts = dest.split(':')
            
            source_ip = source_parts[0]
            source_port = int(source_parts[1]) if len(source_parts) > 1 else None
            dest_ip = dest_parts[0]
            dest_port = int(dest_parts[1]) if len(dest_parts) > 1 else None
            
            # Map priority to severity
            severity_map = {1: "critical", 2: "high", 3: "medium", 4: "low"}
            severity = severity_map.get(int(priority), "medium")
            
            return NetworkEvent(
                timestamp=datetime.now(),  # Parse timestamp_str in production
                source_ip=source_ip,
                dest_ip=dest_ip,
                source_port=source_port,
                dest_port=dest_port,
                protocol="tcp",  # Determine from alert
                event_type="snort_alert",
                severity=severity,
                description=description,
                raw_data=line
            )
            
        except Exception as e:
            logger.error(f"Error parsing Snort alert: {e}")
            return None


class ZeekLogHandler(FileSystemEventHandler):
    """Handle Zeek log file changes"""
    
    def __init__(self, monitor: 'NetworkMonitor'):
        self.monitor = monitor
        self.logger = logging.getLogger(__name__ + ".ZeekLogHandler")
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        if event.src_path.endswith('.log'):
            asyncio.create_task(self.process_zeek_log(event.src_path))
    
    async def process_zeek_log(self, log_path: str):
        """Process new Zeek log entries"""
        try:
            log_type = Path(log_path).stem
            
            if log_type == "conn":
                await self.process_conn_log(log_path)
            elif log_type == "dns":
                await self.process_dns_log(log_path)
            elif log_type == "http":
                await self.process_http_log(log_path)
            elif log_type == "ssl":
                await self.process_ssl_log(log_path)
                
        except Exception as e:
            self.logger.error(f"Error processing Zeek log {log_path}: {e}")
    
    async def process_conn_log(self, log_path: str):
        """Process Zeek connection logs"""
        # Implementation for connection log analysis
        pass
    
    async def process_dns_log(self, log_path: str):
        """Process Zeek DNS logs"""
        # Implementation for DNS log analysis
        pass
    
    async def process_http_log(self, log_path: str):
        """Process Zeek HTTP logs"""
        # Implementation for HTTP log analysis
        pass
    
    async def process_ssl_log(self, log_path: str):
        """Process Zeek SSL logs"""
        # Implementation for SSL log analysis
        pass


class NetworkMonitor:
    """Main network monitoring service"""
    
    def __init__(self, ai_engine, response_engine):
        self.ai_engine = ai_engine
        self.response_engine = response_engine
        self.logger = logging.getLogger(__name__ + ".NetworkMonitor")
        self.is_running = False
        
        # File observers
        self.snort_observer = None
        self.zeek_observer = None
        
        # Event queue
        self.event_queue = asyncio.Queue()
        
        # Statistics
        self.stats = {
            "events_processed": 0,
            "threats_detected": 0,
            "false_positives": 0,
            "start_time": None
        }
    
    async def start(self):
        """Start network monitoring"""
        self.logger.info("Starting network monitoring...")
        
        try:
            # Setup file watchers
            await self.setup_file_watchers()
            
            # Start packet capture
            await self.start_packet_capture()
            
            # Start event processing
            asyncio.create_task(self.process_events())
            
            self.is_running = True
            self.stats["start_time"] = datetime.now()
            
            log_security_event("monitoring_started", {
                "snort_path": settings.SNORT_LOG_PATH,
                "zeek_path": settings.ZEEK_LOG_PATH,
                "interface": settings.PCAP_INTERFACE
            })
            
            self.logger.info("Network monitoring started successfully")
            
        except Exception as e:
            self.logger.error(f"Failed to start network monitoring: {e}")
            raise
    
    async def stop(self):
        """Stop network monitoring"""
        self.logger.info("Stopping network monitoring...")
        
        self.is_running = False
        
        # Stop file observers
        if self.snort_observer:
            self.snort_observer.stop()
            self.snort_observer.join()
        
        if self.zeek_observer:
            self.zeek_observer.stop()
            self.zeek_observer.join()
        
        log_security_event("monitoring_stopped", self.stats)
        self.logger.info("Network monitoring stopped")
    
    async def setup_file_watchers(self):
        """Setup file system watchers for log files"""
        # Setup Snort log watcher
        snort_path = Path(settings.SNORT_LOG_PATH)
        if snort_path.exists():
            self.snort_observer = Observer()
            self.snort_observer.schedule(
                SnortLogHandler(self),
                str(snort_path),
                recursive=True
            )
            self.snort_observer.start()
            self.logger.info(f"Watching Snort logs at {snort_path}")
        
        # Setup Zeek log watcher
        zeek_path = Path(settings.ZEEK_LOG_PATH)
        if zeek_path.exists():
            self.zeek_observer = Observer()
            self.zeek_observer.schedule(
                ZeekLogHandler(self),
                str(zeek_path),
                recursive=True
            )
            self.zeek_observer.start()
            self.logger.info(f"Watching Zeek logs at {zeek_path}")
    
    async def start_packet_capture(self):
        """Start real-time packet capture"""
        # In production, this would use a separate thread/process
        # for packet capture to avoid blocking the main event loop
        pass
    
    async def process_events(self):
        """Process network events from the queue"""
        while self.is_running:
            try:
                # Get event from queue with timeout
                event = await asyncio.wait_for(
                    self.event_queue.get(),
                    timeout=1.0
                )
                
                await self.analyze_event(event)
                self.stats["events_processed"] += 1
                
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                self.logger.error(f"Error processing event: {e}")
    
    async def process_network_event(self, event: NetworkEvent):
        """Add network event to processing queue"""
        await self.event_queue.put(event)
    
    async def analyze_event(self, event: NetworkEvent):
        """Analyze network event for threats"""
        try:
            # Send to AI engine for analysis
            threat_analysis = await self.ai_engine.analyze_network_event(event)
            
            if threat_analysis.is_threat:
                # Create threat record
                threat = await self.create_threat_record(event, threat_analysis)
                
                # Send to response engine
                await self.response_engine.handle_threat(threat)
                
                self.stats["threats_detected"] += 1
                
                log_security_event("threat_detected", {
                    "threat_id": str(threat.id),
                    "type": threat.threat_type,
                    "severity": threat.severity,
                    "source_ip": threat.source_ip,
                    "confidence": threat.ai_confidence
                })
            
        except Exception as e:
            self.logger.error(f"Error analyzing event: {e}")
    
    async def create_threat_record(self, event: NetworkEvent, analysis) -> Threat:
        """Create threat record in database"""
        # This would interact with the database to create a threat record
        # Implementation depends on your database setup
        pass
    
    def get_stats(self) -> Dict[str, Any]:
        """Get monitoring statistics"""
        return {
            **self.stats,
            "is_running": self.is_running,
            "uptime": (datetime.now() - self.stats["start_time"]).total_seconds() 
                     if self.stats["start_time"] else 0
        }