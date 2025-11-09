# Rift Rewind - Docker Deployment Guide

This guide will help you deploy Rift Rewind on an Amazon EC2 instance using Docker and Docker Compose.

## 📋 Prerequisites

### AWS EC2 Instance
- **Instance Type**: t2.medium or larger (minimum 2GB RAM recommended)
- **OS**: Amazon Linux 2, Ubuntu 20.04+, or RHEL 8+
- **Storage**: At least 20GB
- **Security Group**: Ensure the following ports are open:
  - Port 80 (HTTP) - for frontend access
  - Port 9000 (optional) - for direct backend API access
  - Port 22 (SSH) - for instance access

### Required Credentials
You'll need the following credentials ready:
- **Riot API Key**: Get from [Riot Developer Portal](https://developer.riotgames.com/)
- **AWS Credentials**: For Bedrock and DynamoDB access
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_REGION

## 🚀 Quick Deployment

### Step 1: Clone the Repository
```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Clone the repository
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind
```

### Step 2: Configure Environment Variables
```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit the .env file with your credentials
nano backend/.env  # or use vim, vi, etc.
```

Add your actual credentials:
```bash
RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=us-east-1
BACKEND_PORT=9000
DYNAMODB_TABLE_NAME=rift-rewind-wrapped-data
```

### Step 3: Run the Setup Script
```bash
# Make the setup script executable
chmod +x setup-ec2.sh

# Run the setup script
./setup-ec2.sh
```

The script will:
1. ✅ Update system packages
2. ✅ Install Docker
3. ✅ Install Docker Compose
4. ✅ Set up environment variables
5. ✅ Build Docker images
6. ✅ Start all services
7. ✅ Display your public IP address

### Step 4: Access Your Application
After the script completes, you'll see output like:
```
🌐 Frontend: http://YOUR_EC2_IP
🔧 Backend API: http://YOUR_EC2_IP/api
📊 Backend Direct: http://YOUR_EC2_IP:9000
```

Visit the frontend URL in your browser to use the application!

## 🏗️ Architecture

The deployment consists of three main components:

```
┌─────────────────────────────────────────┐
│         EC2 Instance (Port 80)          │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │     Nginx (Frontend Container)    │  │
│  │  - Serves React static files      │  │
│  │  - Proxies /api to backend        │  │
│  └─────────────┬─────────────────────┘  │
│                │                         │
│                │ HTTP Proxy              │
│                ▼                         │
│  ┌───────────────────────────────────┐  │
│  │   FastAPI (Backend Container)     │  │
│  │  - Port 9000                      │  │
│  │  - Handles API requests           │  │
│  │  - Connects to Riot API & AWS     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## 🐳 Docker Structure

### Backend Dockerfile
- Base Image: `python:3.12-slim`
- Installs Python dependencies from `requirements.txt`
- Exposes port 9000
- Runs FastAPI with uvicorn

### Frontend Dockerfile
- Build Stage: `node:20-alpine` - Builds React app with Vite
- Production Stage: `nginx:alpine` - Serves built static files
- Includes nginx configuration for SPA routing and API proxying
- Exposes port 80

### Docker Compose
- Creates a bridge network for inter-container communication
- Backend service runs on port 9000
- Frontend service runs on port 80 and proxies API requests to backend
- Health checks ensure services are running properly

## 🔧 Manual Deployment (Without Script)

If you prefer to deploy manually or need more control:

### 1. Install Docker
```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo systemctl enable docker
sudo usermod -a -G docker $USER

# For Ubuntu
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER
```

### 2. Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. Setup Environment
```bash
cd rift-rewind
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

### 4. Build and Start
```bash
docker-compose build
docker-compose up -d
```

### 5. Verify Deployment
```bash
docker-compose ps
docker-compose logs -f
```

## 📝 Useful Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

### Stop Services
```bash
docker-compose down
```

### Rebuild and Restart
```bash
# After code changes
docker-compose down
docker-compose build
docker-compose up -d
```

### Check Container Status
```bash
docker-compose ps
```

### Execute Commands in Container
```bash
# Access backend container shell
docker-compose exec backend bash

# Access frontend container shell
docker-compose exec frontend sh
```

## 🔄 Updating the Application

### Update Code
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose build
docker-compose up -d
```

### Update Dependencies

**Backend:**
```bash
# Update requirements.txt
# Then rebuild
docker-compose build backend
docker-compose up -d
```

**Frontend:**
```bash
# Update package.json
# Then rebuild
docker-compose build frontend
docker-compose up -d
```

## 🔒 Security Considerations

### 1. Environment Variables
- ⚠️ **NEVER** commit `.env` files to git
- Keep API keys and AWS credentials secure
- Rotate credentials regularly

### 2. Firewall Rules
```bash
# Only allow necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. HTTPS Setup (Recommended for Production)
Consider using Let's Encrypt for free SSL certificates:
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com
```

### 4. AWS IAM
- Use IAM roles with least privilege
- Consider using EC2 instance roles instead of hardcoded credentials
- Enable AWS CloudTrail for audit logging

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Missing or invalid environment variables
# - Invalid API keys
# - AWS credentials not set
```

### Frontend Shows 502 Bad Gateway
```bash
# Check if backend is running
docker-compose ps

# Check backend health
curl http://localhost:9000

# Restart services
docker-compose restart
```

### Port Already in Use
```bash
# Find process using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
```

### Can't Access from Browser
1. Check EC2 Security Group allows inbound traffic on port 80
2. Verify instance is running: `docker-compose ps`
3. Check logs: `docker-compose logs`
4. Test locally on EC2: `curl http://localhost`

### Docker Build Fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose build --no-cache
```

## 📊 Monitoring

### Check Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks
```bash
# Backend health
curl http://localhost:9000

# Frontend health
curl http://localhost
```

## 🌐 Domain Setup (Optional)

### Using a Custom Domain
1. Point your domain's A record to your EC2 public IP
2. Update nginx configuration to use your domain
3. Set up SSL with Let's Encrypt

### Update Nginx Config
```bash
# Edit frontend/nginx.conf
server_name yourdomain.com;
```

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables are set correctly
3. Ensure EC2 security group rules are configured
4. Check AWS service quotas and limits

## 🎯 Performance Optimization

### For Production Deployment:
1. Use a larger EC2 instance (t2.large or better)
2. Enable CloudFront CDN for faster content delivery
3. Set up RDS or ElastiCache for better database performance
4. Use AWS Application Load Balancer for high availability
5. Implement auto-scaling for handling traffic spikes
6. Enable CloudWatch monitoring and alarms

---

**Happy Gaming! 🎮**

