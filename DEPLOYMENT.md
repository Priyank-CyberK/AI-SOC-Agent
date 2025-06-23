# AI SOC Agent - Production Deployment Guide

## Prerequisites

### Hardware Requirements
- **Minimum**: 16GB RAM, 4 CPU cores, 500GB storage
- **Recommended**: 32GB RAM, 8 CPU cores, 1TB SSD storage
- **Network**: Dedicated network interface for monitoring

### Software Requirements
- Ubuntu 20.04+ or CentOS 8+
- Docker & Docker Compose
- Python 3.9+
- Network access to monitored infrastructure

## Security Considerations

### ⚠️ CRITICAL SECURITY WARNINGS

1. **Network Segmentation**: Deploy in isolated security network
2. **Access Control**: Implement strict RBAC and API authentication
3. **Audit Logging**: Enable comprehensive audit trails
4. **Fail-Safe Mode**: Configure safe defaults for unknown threats
5. **Human Oversight**: Require approval for critical actions

### Network Security
```bash
# Create dedicated network interface
sudo ip link add name soc0 type bridge
sudo ip addr add 192.168.100.1/24 dev soc0
sudo ip link set soc0 up

# Configure iptables for monitoring
sudo iptables -A INPUT -i soc0 -j ACCEPT
sudo iptables -A FORWARD -i soc0 -j ACCEPT
```

## Installation Steps

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y docker.io docker-compose python3.9 python3-pip

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/your-org/ai-soc-agent
cd ai-soc-agent

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Configure environment
cp .env.example .env
nano .env  # Edit configuration
```

### 3. Network Monitoring Setup

#### Snort Configuration
```bash
# Install Snort
sudo apt install snort -y

# Configure Snort
sudo nano /etc/snort/snort.conf

# Key configurations:
# var HOME_NET 192.168.1.0/24
# var EXTERNAL_NET !$HOME_NET
# output alert_fast: /var/log/snort/alert.log
```

#### Zeek Configuration
```bash
# Install Zeek
sudo apt install zeek -y

# Configure Zeek
sudo nano /opt/zeek/etc/node.cfg

# Add monitoring interface:
# [zeek]
# type=standalone
# host=localhost
# interface=eth0
```

### 4. Database Setup
```bash
# Start database services
docker-compose up -d postgres redis elasticsearch

# Initialize database
python3.9 -c "
import asyncio
from src.core.database import init_db
asyncio.run(init_db())
"
```

### 5. ML Model Setup
```bash
# Create model directories
mkdir -p models/{threat_detection,anomaly_detection,classification}

# Download pre-trained models (if available)
# Or train initial models with your data
python3.9 scripts/train_initial_models.py
```

## Configuration

### Environment Variables
```bash
# Critical settings in .env
OPENAI_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@localhost:5432/soc_db
FIREWALL_HOST=192.168.1.1
AUTO_RESPONSE_ENABLED=false  # Start with manual approval
```

### Firewall Integration

#### pfSense Setup
```bash
# Enable API access in pfSense
# System > Advanced > Admin Access
# Enable "Secure Shell" and "Web GUI"

# Create API user with limited privileges
# System > User Manager > Add User
# Assign only necessary firewall permissions
```

#### API Configuration
```python
# In .env file
FIREWALL_TYPE=pfsense
FIREWALL_HOST=192.168.1.1
FIREWALL_USERNAME=api_user
FIREWALL_PASSWORD=secure_password
```

## Deployment

### Development Deployment
```bash
# Start all services
docker-compose up -d

# Start AI SOC Agent
python3.9 main.py
```

### Production Deployment

#### Using Docker Compose
```bash
# Production compose file
docker-compose -f docker-compose.prod.yml up -d
```

#### Using Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

#### Using Systemd
```bash
# Enable systemd service
sudo systemctl enable ai-soc-agent
sudo systemctl start ai-soc-agent
sudo systemctl status ai-soc-agent
```

## Monitoring & Maintenance

### Health Checks
```bash
# Check service health
curl http://localhost:8000/health

# Check logs
tail -f logs/soc-agent.log
tail -f logs/security.log
tail -f logs/audit.log
```

### Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs

# Monitor Docker containers
docker stats
docker logs ai-soc-agent
```

### Database Maintenance
```bash
# Backup database
pg_dump soc_db > backup_$(date +%Y%m%d).sql

# Clean old logs (automated)
python3.9 scripts/cleanup_logs.py --days 30
```

## Scaling

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  ai-soc-agent:
    deploy:
      replicas: 3
  
  postgres:
    deploy:
      replicas: 1  # Use read replicas for scaling
```

### Load Balancing
```nginx
# nginx.conf
upstream soc_agents {
    server localhost:8000;
    server localhost:8001;
    server localhost:8002;
}

server {
    listen 80;
    location / {
        proxy_pass http://soc_agents;
    }
}
```

## Troubleshooting

### Common Issues

#### High Memory Usage
```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Optimize ML model loading
# Reduce MAX_CONCURRENT_ANALYSIS in .env
```

#### Network Monitoring Issues
```bash
# Check network interfaces
ip addr show
tcpdump -i eth0 -c 10

# Verify Snort/Zeek processes
ps aux | grep snort
ps aux | grep zeek
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
psql -h localhost -U soc_user -d soc_db

# Check connection limits
SELECT * FROM pg_stat_activity;
```

### Log Analysis
```bash
# Search for errors
grep -i error logs/soc-agent.log
grep -i "threat detected" logs/security.log

# Monitor real-time logs
tail -f logs/*.log | grep -i "critical\|error\|threat"
```

## Security Hardening

### System Hardening
```bash
# Disable unnecessary services
sudo systemctl disable apache2
sudo systemctl disable nginx

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 8000/tcp
sudo ufw deny 5432/tcp  # Restrict database access
```

### Application Security
```bash
# Set secure file permissions
chmod 600 .env
chmod 700 logs/
chmod 755 scripts/

# Regular security updates
sudo apt update && sudo apt upgrade -y
docker-compose pull
```

### Audit Configuration
```bash
# Enable system auditing
sudo apt install auditd
sudo systemctl enable auditd

# Configure audit rules
echo "-w /opt/ai-soc-agent -p wa -k soc_changes" >> /etc/audit/rules.d/soc.rules
```

## Backup & Recovery

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump soc_db > backups/db_$DATE.sql

# Configuration backup
tar -czf backups/config_$DATE.tar.gz .env config/ models/

# Log backup
tar -czf backups/logs_$DATE.tar.gz logs/
```

### Recovery Procedures
```bash
# Database recovery
psql soc_db < backups/db_20240101_120000.sql

# Configuration recovery
tar -xzf backups/config_20240101_120000.tar.gz

# Restart services
docker-compose restart
```

## Compliance & Auditing

### Audit Trail
- All decisions logged to `logs/audit.log`
- Database changes tracked with timestamps
- API access logged with user identification
- Network changes logged with justification

### Compliance Reports
```bash
# Generate compliance report
python3.9 scripts/generate_compliance_report.py --start-date 2024-01-01 --end-date 2024-01-31
```

### Data Retention
```bash
# Configure log retention (90 days)
echo "0 2 * * * find /opt/ai-soc-agent/logs -name '*.log' -mtime +90 -delete" | crontab -
```

---

## Support & Documentation

- **Documentation**: [docs/](docs/)
- **API Reference**: http://localhost:8000/docs
- **Issues**: https://github.com/your-org/ai-soc-agent/issues
- **Security**: security@your-org.com

**⚠️ Remember**: This system can make autonomous changes to your network infrastructure. Always test thoroughly and maintain human oversight for critical operations.