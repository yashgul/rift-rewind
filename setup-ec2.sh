#!/bin/bash

###############################################################################
# Rift Rewind EC2 Deployment Script
# This script will:
# 1. Update the system
# 2. Install Docker and Docker Compose
# 3. Configure environment variables
# 4. Build and deploy the application using Docker Compose
# 5. Display the public IP address for accessing the application
###############################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get the public IP address
get_public_ip() {
    # Try multiple methods to get the public IP
    local ip=""
    
    # Method 1: EC2 metadata service
    ip=$(curl -s --max-time 3 http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "")
    
    # Method 2: External service
    if [ -z "$ip" ]; then
        ip=$(curl -s --max-time 3 ifconfig.me 2>/dev/null || echo "")
    fi
    
    # Method 3: Another external service
    if [ -z "$ip" ]; then
        ip=$(curl -s --max-time 3 icanhazip.com 2>/dev/null || echo "")
    fi
    
    echo "$ip"
}

# Check if script is run as root
if [[ $EUID -eq 0 ]]; then
   print_warning "This script should not be run as root. Run as a regular user with sudo privileges."
fi

print_info "Starting Rift Rewind EC2 Deployment Setup..."
echo "=================================================="

# Step 1: Update system packages
print_info "Step 1/7: Updating system packages..."
sudo yum update -y || sudo apt-get update -y
print_success "System packages updated"

# Step 2: Install Docker
print_info "Step 2/7: Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Detect OS type
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS=$(uname -s)
    fi
    
    if [[ "$OS" == "amzn" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "centos" ]]; then
        # Amazon Linux 2 / RHEL / CentOS
        sudo yum install -y docker
        sudo service docker start
        sudo systemctl enable docker
        sudo usermod -a -G docker $USER
    elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        # Ubuntu / Debian
        sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
        sudo apt-get update -y
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io
        sudo systemctl start docker
        sudo systemctl enable docker
        sudo usermod -a -G docker $USER
    else
        print_error "Unsupported OS. Please install Docker manually."
        exit 1
    fi
    print_success "Docker installed successfully"
else
    print_success "Docker is already installed"
fi

# Verify Docker installation
if ! docker --version &> /dev/null; then
    print_error "Docker installation failed"
    exit 1
fi

# Step 3: Install Docker Compose
print_info "Step 3/7: Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    # Install Docker Compose v2
    DOCKER_COMPOSE_VERSION="v2.24.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for docker compose (v2 style)
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo ln -sf /usr/local/bin/docker-compose /usr/local/lib/docker/cli-plugins/docker-compose
    
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose is already installed"
fi

# Verify Docker Compose installation
if ! docker-compose --version &> /dev/null; then
    print_error "Docker Compose installation failed"
    exit 1
fi

# Step 4: Setup environment variables
print_info "Step 4/7: Setting up environment variables..."

ENV_FILE="./backend/.env"
ENV_EXAMPLE="./backend/.env.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        print_warning "No .env file found. Creating from .env.example..."
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_warning "⚠️  IMPORTANT: Please edit backend/.env and add your API keys:"
        print_warning "    - RIOT_API_KEY"
        print_warning "    - AWS_ACCESS_KEY_ID"
        print_warning "    - AWS_SECRET_ACCESS_KEY"
        echo ""
        read -p "Press Enter after you've updated the .env file with your credentials..."
    else
        print_error ".env.example file not found. Please create backend/.env manually."
        exit 1
    fi
else
    print_success "Environment file found"
fi

# Step 5: Stop any running containers
print_info "Step 5/7: Cleaning up any existing containers..."
if docker ps -a | grep -q "rift-rewind"; then
    print_info "Stopping and removing existing containers..."
    docker-compose down 2>/dev/null || true
    print_success "Cleanup completed"
else
    print_success "No existing containers to clean up"
fi

# Step 6: Build and start the application
print_info "Step 6/7: Building and starting the application..."
print_info "This may take a few minutes on first run..."

# Build the images
print_info "Building Docker images..."
docker-compose build

# Start the services
print_info "Starting services..."
docker-compose up -d

# Wait for services to be healthy
print_info "Waiting for services to be ready..."
sleep 10

# Check if containers are running
if docker ps | grep -q "rift-rewind-backend" && docker ps | grep -q "rift-rewind-frontend"; then
    print_success "All services are running!"
else
    print_error "Some services failed to start. Checking logs..."
    docker-compose logs --tail=50
    exit 1
fi

# Step 7: Display access information
print_info "Step 7/7: Getting access information..."
PUBLIC_IP=$(get_public_ip)

echo ""
echo "=================================================="
print_success "🎉 Deployment Complete!"
echo "=================================================="
echo ""

if [ -n "$PUBLIC_IP" ]; then
    print_success "Your application is now accessible at:"
    echo ""
    echo -e "${GREEN}   🌐 Frontend: http://${PUBLIC_IP}${NC}"
    echo -e "${GREEN}   🔧 Backend API: http://${PUBLIC_IP}/api${NC}"
    echo -e "${GREEN}   📊 Backend Direct: http://${PUBLIC_IP}:9000${NC}"
    echo ""
else
    print_warning "Could not automatically detect public IP."
    print_info "You can find your EC2 instance's public IP in the AWS Console."
fi

echo "=================================================="
print_info "Useful Commands:"
echo ""
echo "  View logs:              docker-compose logs -f"
echo "  View backend logs:      docker-compose logs -f backend"
echo "  View frontend logs:     docker-compose logs -f frontend"
echo "  Stop services:          docker-compose down"
echo "  Restart services:       docker-compose restart"
echo "  Rebuild and restart:    docker-compose up -d --build"
echo "  Check container status: docker-compose ps"
echo ""
echo "=================================================="

# Final security reminder
print_warning "⚠️  Security Reminders:"
echo "  1. Ensure your EC2 security group allows inbound traffic on:"
echo "     - Port 80 (HTTP) for the frontend"
echo "     - Port 9000 (optional) for direct backend access"
echo "  2. Consider setting up HTTPS with Let's Encrypt for production"
echo "  3. Keep your .env file secure and never commit it to git"
echo ""

print_success "Setup complete! Enjoy your Rift Rewind application! 🎮"

