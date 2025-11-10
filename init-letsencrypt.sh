#!/bin/bash

###############################################################################
# Rift Wrapped - Let's Encrypt Initialization Script
# This script obtains the initial SSL certificate using Certbot
###############################################################################

if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi

# Configuration
domains=(riftwrapped.ishaan812.com)
rsa_key_size=4096
data_path="./certbot"
email="ishaan.shah@gmail.com" # Adding a valid email is strongly recommended
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "=================================================="
echo "  Let's Encrypt SSL Certificate Setup"
echo "=================================================="
echo ""

echo -e "${YELLOW}⚠️  Important:${NC}"
echo "1. Make sure your domain DNS A record points to this server"
echo "2. Ports 80 and 443 must be open in your security group"
echo "3. Update the 'email' variable in this script"
echo ""
read -p "Ready to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Create directories
if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}[INFO]${NC} Removing old certificate data..."
    rm -rf "$data_path"
  else
    exit 0
  fi
fi

echo -e "${BLUE}[INFO]${NC} Creating certificate directories..."
mkdir -p "$data_path/conf/live/$domains"
mkdir -p "$data_path/www"

# Download recommended TLS parameters
echo -e "${BLUE}[INFO]${NC} Downloading recommended TLS parameters..."
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
echo -e "${GREEN}[SUCCESS]${NC} Downloaded TLS parameters"

# Create dummy certificate for nginx to start
echo -e "${BLUE}[INFO]${NC} Creating dummy certificate for $domains..."
path="/etc/letsencrypt/live/$domains"
docker-compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo -e "${GREEN}[SUCCESS]${NC} Dummy certificate created"

# Replace nginx config with SSL version
echo -e "${BLUE}[INFO]${NC} Updating nginx configuration..."
if [ -f "frontend/nginx.conf" ]; then
    cp frontend/nginx.conf frontend/nginx.conf.http-backup
fi
cp frontend/nginx-ssl.conf frontend/nginx.conf
echo -e "${GREEN}[SUCCESS]${NC} Nginx configuration updated"

# Start nginx
echo -e "${BLUE}[INFO]${NC} Starting nginx..."
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d frontend
echo -e "${GREEN}[SUCCESS]${NC} Nginx started"

# Delete dummy certificate
echo -e "${BLUE}[INFO]${NC} Deleting dummy certificate..."
docker-compose run --rm --entrypoint "\
  rm -rf /etc/letsencrypt/live/$domains && \
  rm -rf /etc/letsencrypt/archive/$domains && \
  rm -rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo -e "${GREEN}[SUCCESS]${NC} Dummy certificate removed"

# Request Let's Encrypt certificate
echo -e "${BLUE}[INFO]${NC} Requesting Let's Encrypt certificate for $domains..."

# Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker-compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}[SUCCESS]${NC} Certificate obtained successfully!"
else
    echo ""
    echo -e "${RED}[ERROR]${NC} Failed to obtain certificate"
    echo "Please check:"
    echo "  1. Your domain DNS points to this server"
    echo "  2. Ports 80 and 443 are accessible"
    echo "  3. No firewall is blocking access"
    exit 1
fi

# Reload nginx
echo -e "${BLUE}[INFO]${NC} Reloading nginx..."
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml exec frontend nginx -s reload

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 HTTPS Setup Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${GREEN}Your site is now accessible at:${NC}"
echo "  https://riftwrapped.ishaan812.com"
echo ""
echo -e "${BLUE}Certificate will auto-renew via the certbot container${NC}"
echo ""
echo "To restart all services with SSL:"
echo "  docker-compose -f docker-compose.yml -f docker-compose.ssl.yml restart"
echo ""
echo "=================================================="

