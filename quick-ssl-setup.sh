#!/bin/bash

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start backend only first
echo "Starting backend..."
docker-compose up -d backend

# Wait for backend
sleep 5

# Get SSL certificate using standalone certbot
echo "Getting SSL certificate..."
sudo docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --agree-tos \
  --email ishaan.shah@gmail.com \
  -d riftwrapped.ishaan812.com

# Update nginx to use SSL config
echo "Updating nginx configuration..."
cp frontend/nginx-ssl.conf frontend/nginx.conf

# Start everything with SSL
echo "Starting all services with SSL..."
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d --build

echo ""
echo "✅ Done! Visit https://riftwrapped.ishaan812.com"
