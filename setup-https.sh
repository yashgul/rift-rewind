#!/bin/bash

###############################################################################
# Rift Rewind - HTTPS Setup Script with Let's Encrypt
# This script will:
# 1. Install Certbot for Let's Encrypt
# 2. Obtain SSL certificates for your domain
# 3. Configure automatic renewal via cron job
# 4. Update nginx to use HTTPS
###############################################################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Configuration
DOMAIN="riftrewind.ishaan812.com"
EMAIL="your-email@example.com"  # Change this to your email

echo "=================================================="
print_info "Rift Rewind - HTTPS Setup with Let's Encrypt"
echo "=================================================="
echo ""

# Check if running with sudo privileges
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run with sudo privileges"
   echo "Usage: sudo ./setup-https.sh"
   exit 1
fi

print_warning "⚠️  IMPORTANT: Before running this script:"
echo "  1. Point your domain DNS A record to this server's IP"
echo "  2. Ensure ports 80 and 443 are open in your security group"
echo "  3. Update the EMAIL variable in this script"
echo ""
read -p "Have you completed the above steps? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_warning "Please complete the setup requirements first, then run this script again."
    exit 0
fi

# Step 1: Install Certbot
print_info "Step 1/5: Installing Certbot..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS=$(uname -s)
fi

if [[ "$OS" == "amzn" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "centos" ]]; then
    # Amazon Linux 2 / RHEL / CentOS
    yum install -y certbot
    print_success "Certbot installed via yum"
elif [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
    # Ubuntu / Debian
    apt-get update
    apt-get install -y certbot
    print_success "Certbot installed via apt"
else
    print_error "Unsupported OS. Please install certbot manually."
    exit 1
fi

# Step 2: Stop nginx container temporarily to free port 80
print_info "Step 2/5: Stopping containers temporarily..."
cd "$(dirname "$0")"
docker-compose down
print_success "Containers stopped"

# Step 3: Obtain SSL certificate
print_info "Step 3/5: Obtaining SSL certificate from Let's Encrypt..."
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

certbot certonly --standalone \
    --preferred-challenges http \
    --agree-tos \
    --no-eff-email \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    --non-interactive

if [ $? -eq 0 ]; then
    print_success "SSL certificate obtained successfully!"
    
    # Display certificate location
    CERT_PATH="/etc/letsencrypt/live/$DOMAIN"
    print_info "Certificates are stored at: $CERT_PATH"
    echo "  - Certificate: $CERT_PATH/fullchain.pem"
    echo "  - Private Key: $CERT_PATH/privkey.pem"
else
    print_error "Failed to obtain SSL certificate"
    print_info "Please check:"
    echo "  1. Domain DNS is correctly pointed to this server"
    echo "  2. Port 80 is accessible from the internet"
    echo "  3. No other service is using port 80"
    exit 1
fi

# Step 4: Update docker-compose to mount certificates
print_info "Step 4/5: Creating SSL-enabled configuration..."

# Create nginx SSL configuration
cat > nginx-ssl.conf << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    server_name riftrewind.ishaan812.com;
    
    # Allow Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all other HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name riftrewind.ishaan812.com;
    
    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/riftrewind.ishaan812.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/riftrewind.ishaan812.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (optional but recommended)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Frontend routes - try files first, then fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:9000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long-running requests
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webm|mp3)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Backup original nginx config
if [ -f "frontend/nginx.conf" ]; then
    cp frontend/nginx.conf frontend/nginx.conf.backup
    print_success "Backed up original nginx.conf"
fi

# Copy SSL config
cp nginx-ssl.conf frontend/nginx.conf
print_success "Updated nginx configuration for SSL"

# Create docker-compose override for SSL
cat > docker-compose.ssl.yml << 'EOF'
version: '3.8'

services:
  frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
EOF

print_success "Created docker-compose SSL configuration"

# Step 5: Setup auto-renewal cron job
print_info "Step 5/5: Setting up automatic certificate renewal..."

# Create renewal script
cat > /usr/local/bin/renew-ssl-riftrewind.sh << 'RENEWAL_SCRIPT'
#!/bin/bash

# Rift Rewind - SSL Certificate Renewal Script
COMPOSE_DIR="/path/to/rift-rewind"  # Update this path

echo "[$(date)] Starting SSL certificate renewal..."

# Try to renew certificate
certbot renew --quiet --deploy-hook "docker-compose -f $COMPOSE_DIR/docker-compose.yml -f $COMPOSE_DIR/docker-compose.ssl.yml restart frontend"

if [ $? -eq 0 ]; then
    echo "[$(date)] Certificate renewal completed successfully"
else
    echo "[$(date)] Certificate renewal failed or not needed"
fi
RENEWAL_SCRIPT

# Make renewal script executable
chmod +x /usr/local/bin/renew-ssl-riftrewind.sh

# Update the path in renewal script
CURRENT_DIR=$(pwd)
sed -i "s|/path/to/rift-rewind|$CURRENT_DIR|g" /usr/local/bin/renew-ssl-riftrewind.sh

# Add cron job (runs twice daily as recommended by Let's Encrypt)
CRON_JOB="0 0,12 * * * /usr/local/bin/renew-ssl-riftrewind.sh >> /var/log/ssl-renewal-riftrewind.log 2>&1"

# Check if cron job already exists
(crontab -l 2>/dev/null | grep -v "renew-ssl-riftrewind") | crontab -
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

print_success "Cron job installed - certificates will auto-renew"
print_info "Renewal schedule: Twice daily at 00:00 and 12:00"
print_info "Renewal logs: /var/log/ssl-renewal-riftrewind.log"

# Restart containers with SSL
print_info "Restarting containers with SSL enabled..."
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d --build

# Wait for services to start
sleep 10

# Check if services are running
if docker ps | grep -q "rift-rewind"; then
    print_success "Services started successfully with SSL!"
else
    print_error "Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "=================================================="
print_success "🎉 HTTPS Setup Complete!"
echo "=================================================="
echo ""
print_success "Your application is now accessible at:"
echo ""
echo -e "${GREEN}   🔒 https://riftrewind.ishaan812.com${NC}"
echo ""
echo "=================================================="
print_info "Certificate Information:"
echo "  - Domain: $DOMAIN"
echo "  - Valid for: 90 days"
echo "  - Auto-renewal: Enabled (twice daily)"
echo "  - Certificate path: /etc/letsencrypt/live/$DOMAIN/"
echo ""
print_info "Useful Commands:"
echo "  View certificate status:  certbot certificates"
echo "  Force renewal:            certbot renew --force-renewal"
echo "  View renewal logs:        tail -f /var/log/ssl-renewal-riftrewind.log"
echo "  Restart with SSL:         docker-compose -f docker-compose.yml -f docker-compose.ssl.yml restart"
echo ""
echo "=================================================="
print_warning "⚠️  Security Reminders:"
echo "  1. HTTP traffic is now automatically redirected to HTTPS"
echo "  2. Ensure port 443 is open in your EC2 security group"
echo "  3. Certificates will auto-renew - no manual action needed"
echo "  4. Keep your server and Docker images updated"
echo ""
print_success "Enjoy your secure Rift Rewind application! 🎮🔒"

