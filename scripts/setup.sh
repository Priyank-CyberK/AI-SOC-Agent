#!/bin/bash

# AI SOC Agent Setup Script
set -e

echo "🚀 Setting up AI SOC Agent..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root for security reasons"
   exit 1
fi

# Check system requirements
echo "📋 Checking system requirements..."

# Check OS
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ This system requires Linux (Ubuntu 20.04+ or CentOS 8+)"
    exit 1
fi

# Check memory
MEMORY=$(free -g | awk '/^Mem:/{print $2}')
if [ "$MEMORY" -lt 16 ]; then
    echo "⚠️  Warning: System has ${MEMORY}GB RAM, 16GB+ recommended"
fi

# Check disk space
DISK=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')
if [ "$DISK" -lt 500 ]; then
    echo "⚠️  Warning: Available disk space is ${DISK}GB, 500GB+ recommended"
fi

# Install system dependencies
echo "📦 Installing system dependencies..."

if command -v apt-get &> /dev/null; then
    # Ubuntu/Debian
    sudo apt-get update
    sudo apt-get install -y \
        python3.9 \
        python3.9-dev \
        python3-pip \
        docker.io \
        docker-compose \
        postgresql-client \
        redis-tools \
        libpcap-dev \
        tcpdump \
        wireshark-common \
        build-essential \
        git \
        curl \
        wget \
        net-tools \
        iptables \
        nmap
elif command -v yum &> /dev/null; then
    # CentOS/RHEL
    sudo yum update -y
    sudo yum install -y \
        python39 \
        python39-devel \
        python3-pip \
        docker \
        docker-compose \
        postgresql \
        redis \
        libpcap-devel \
        tcpdump \
        wireshark \
        gcc \
        gcc-c++ \
        git \
        curl \
        wget \
        net-tools \
        iptables \
        nmap
else
    echo "❌ Unsupported package manager. Please install dependencies manually."
    exit 1
fi

# Setup Docker
echo "🐳 Setting up Docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
python3.9 -m pip install --upgrade pip
python3.9 -m pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs models training_data config
mkdir -p logs/snort logs/zeek logs/suricata
mkdir -p snort/config zeek/config logstash/config

# Setup environment file
echo "⚙️  Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Setup Snort configuration
echo "🛡️  Setting up Snort..."
cat > snort/config/snort.conf << 'EOF'
# Snort Configuration for AI SOC Agent
var HOME_NET any
var EXTERNAL_NET any
var HTTP_SERVERS $HOME_NET
var SMTP_SERVERS $HOME_NET
var DNS_SERVERS $HOME_NET

# Output plugins
output alert_fast: /var/log/snort/alert.log
output log_tcpdump: /var/log/snort/snort.log

# Include rules
include $RULE_PATH/local.rules
EOF

# Setup Zeek configuration
echo "🔍 Setting up Zeek..."
cat > zeek/config/local.zeek << 'EOF'
# Zeek Configuration for AI SOC Agent
@load base/frameworks/cluster
@load base/frameworks/logging

# Enable logging
redef Log::default_rotation_interval = 1hr;
redef Log::default_rotation_postprocessor = "gzip";

# Custom logging for AI analysis
event zeek_init() {
    Log::create_stream(AIAnalysis::LOG, [$columns=AIAnalysis::Info]);
}
EOF

# Setup Logstash configuration
echo "📊 Setting up Logstash..."
cat > logstash/config/logstash.conf << 'EOF'
input {
  file {
    path => "/var/log/input/snort/*.log"
    start_position => "beginning"
    tags => ["snort"]
  }
  file {
    path => "/var/log/input/zeek/*.log"
    start_position => "beginning"
    tags => ["zeek"]
  }
}

filter {
  if "snort" in [tags] {
    grok {
      match => { "message" => "%{GREEDYDATA:alert}" }
    }
    mutate {
      add_field => { "source_system" => "snort" }
    }
  }
  
  if "zeek" in [tags] {
    json {
      source => "message"
    }
    mutate {
      add_field => { "source_system" => "zeek" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "soc-logs-%{+YYYY.MM.dd}"
  }
}
EOF

# Initialize database
echo "🗄️  Initializing database..."
docker-compose up -d postgres redis
sleep 10

# Run database migrations
python3.9 -c "
import asyncio
from src.core.database import init_db
asyncio.run(init_db())
print('Database initialized successfully')
"

# Download and setup ML models
echo "🤖 Setting up ML models..."
mkdir -p models/threat_detection models/anomaly_detection models/classification

# Create initial model files (placeholders)
touch models/threat_detection/model.pkl
touch models/anomaly_detection/model.pkl
touch models/classification/model.pkl

# Setup systemd service (optional)
echo "🔧 Setting up systemd service..."
cat > /tmp/ai-soc-agent.service << EOF
[Unit]
Description=AI SOC Agent
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/python3.9 main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo mv /tmp/ai-soc-agent.service /etc/systemd/system/
sudo systemctl daemon-reload

# Set permissions
echo "🔐 Setting permissions..."
chmod +x scripts/*.sh
chmod 600 .env
sudo chown -R $USER:$USER logs models training_data

# Final checks
echo "✅ Running final checks..."

# Check Docker
if ! docker --version &> /dev/null; then
    echo "❌ Docker installation failed"
    exit 1
fi

# Check Python dependencies
if ! python3.9 -c "import fastapi, tensorflow, torch" &> /dev/null; then
    echo "❌ Python dependencies installation failed"
    exit 1
fi

echo "🎉 AI SOC Agent setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Configure your network monitoring points"
echo "3. Setup firewall API credentials"
echo "4. Run: docker-compose up -d"
echo "5. Run: python3.9 main.py"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "- This system can make autonomous network changes"
echo "- Test thoroughly in a lab environment first"
echo "- Ensure proper access controls and monitoring"
echo "- Review all configurations before production deployment"
echo ""
echo "📚 Documentation: https://github.com/your-org/ai-soc-agent/docs"
echo "🐛 Issues: https://github.com/your-org/ai-soc-agent/issues"