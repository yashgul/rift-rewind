# 🚀 Docker Quick Start Guide

## One-Command Deployment on EC2

After cloning the repository on your EC2 instance, just run:

```bash
./setup-ec2.sh
```

That's it! The script will:
- ✅ Install Docker & Docker Compose
- ✅ Build your containers
- ✅ Start all services
- ✅ Display your public IP for access

## Before Running

1. **Setup environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   nano backend/.env  # Add your API keys
   ```

2. **Required credentials in `.env`:**
   - `RIOT_API_KEY` - Get from [Riot Developer Portal](https://developer.riotgames.com/)
   - `AWS_ACCESS_KEY_ID` - Your AWS access key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

## Local Development with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Access Points

After deployment:
- **Frontend**: `http://YOUR_EC2_IP/`
- **Backend API**: `http://YOUR_EC2_IP/api`
- **Backend Direct**: `http://YOUR_EC2_IP:9000`

## EC2 Security Group

Ensure these ports are open:
- **Port 80** (HTTP) - Required for frontend
- **Port 22** (SSH) - For server access

## Common Commands

```bash
# Rebuild after code changes
docker-compose up -d --build

# View all containers
docker-compose ps

# Restart a service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Need More Details?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive documentation.

---

**Happy Rewinding**

