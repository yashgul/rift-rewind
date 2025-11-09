# 🎮 Rift Rewind

Your League of Legends year wrapped - an AI-powered gaming recap experience.

## 🌟 Features

- **Player Analytics**: Deep dive into your League of Legends match history
- **AI-Powered Insights**: Get personalized analysis of your gameplay
- **Beautiful Visualizations**: Interactive charts and statistics
- **Player Comparison**: Compare your stats with friends
- **Interactive Timeline**: Explore your most memorable matches
- **Smart Chatbot**: Ask questions about your gameplay statistics

## 🚀 Quick Start

### 🐳 Docker Deployment (Recommended for Production)

Deploy the entire application with one command on AWS EC2:

> **🔒 For HTTPS setup with your domain, see [HTTPS-SETUP.md](./HTTPS-SETUP.md)**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rift-rewind.git
cd rift-rewind

# 2. Setup environment variables
cp backend/.env.example backend/.env
nano backend/.env  # Add your API keys

# 3. Run the setup script
chmod +x setup-ec2.sh
./setup-ec2.sh
```

**See [DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md) for quick reference or [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive documentation.**

### 💻 Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run the backend
python main.py
```

Backend will be available at `http://localhost:9000`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:8080`

## 📋 Requirements

### API Keys & Credentials
- **Riot API Key**: Get from [Riot Developer Portal](https://developer.riotgames.com/)
- **AWS Credentials**: For Bedrock (AI) and DynamoDB (storage)
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - AWS_REGION

### For Local Development
- Python 3.12+
- Node.js 20+
- npm or bun

### For Docker Deployment
- AWS EC2 instance (t2.medium or larger)
- Docker & Docker Compose (auto-installed by setup script)

## 🏗️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Python 3.12**: Latest Python version
- **Boto3**: AWS SDK for Bedrock AI and DynamoDB
- **Uvicorn**: ASGI server

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS
- **Shadcn/ui**: Beautiful UI components
- **GSAP**: Smooth animations

### Infrastructure
- **Docker**: Containerization
- **Nginx**: Web server and reverse proxy
- **AWS Bedrock**: AI-powered insights
- **AWS DynamoDB**: NoSQL database

## 📁 Project Structure

```
rift-rewind/
├── backend/
│   ├── clients/           # API clients (Riot, AWS Bedrock)
│   ├── helpers/           # Utility functions
│   ├── main.py           # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile        # Backend container config
│   └── .env.example      # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts
│   │   └── lib/          # Utilities
│   ├── public/           # Static assets
│   ├── Dockerfile        # Frontend container config
│   └── nginx.conf        # Nginx configuration
├── docker-compose.yml    # Container orchestration
├── setup-ec2.sh         # Automated deployment script
├── DEPLOYMENT.md        # Detailed deployment guide
└── DOCKER-QUICKSTART.md # Quick Docker reference
```

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with:

```bash
# Riot API
RIOT_API_KEY=your_riot_api_key

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1

# Backend
BACKEND_PORT=9000

# DynamoDB
DYNAMODB_TABLE_NAME=rift-rewind-wrapped-data
```

### EC2 Security Group

Open these ports:
- **Port 80** (HTTP) - Frontend access
- **Port 443** (HTTPS) - Secure frontend access (required for SSL)
- **Port 22** (SSH) - Server access
- **Port 9000** (optional) - Direct backend API access

### HTTPS / SSL Setup

To enable HTTPS for your domain:

```bash
# Quick setup (recommended)
sudo ./init-letsencrypt.sh
docker-compose -f docker-compose.yml -f docker-compose.ssl.yml up -d
```

See **[HTTPS-SETUP.md](./HTTPS-SETUP.md)** for complete guide with automatic certificate renewal.

## 📊 API Endpoints

- `GET /` - Health check
- `GET /api/summonerIcon` - Get summoner profile icon
- `GET /api/matchData` - Fetch player match data and generate wrapped
- `GET /api/compareData` - Compare two players
- `POST /api/chatbot/sendMessage` - Chat about your stats

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

## 🔍 Monitoring

```bash
# Check container status
docker-compose ps

# View resource usage
docker stats

# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend
```

## 🚨 Troubleshooting

### Backend won't start
- Check environment variables in `backend/.env`
- Verify API keys are valid
- Check logs: `docker-compose logs backend`

### Frontend shows 502 error
- Ensure backend is running: `docker-compose ps`
- Check backend health: `curl http://localhost:9000`
- Restart: `docker-compose restart`

### Can't access from browser
- Verify EC2 Security Group allows port 80
- Check if services are running: `docker-compose ps`
- Test locally on EC2: `curl http://localhost`

## 📝 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting
```bash
# Backend
black backend/

# Frontend
npm run lint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Riot Games for the League of Legends API
- AWS for Bedrock AI services
- The open-source community

## 📞 Support

For issues and questions:
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review [DOCKER-QUICKSTART.md](./DOCKER-QUICKSTART.md) for Docker commands
- Create an issue on GitHub

---

**Made with ❤️ for League of Legends players**