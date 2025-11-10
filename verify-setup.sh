#!/bin/bash

###############################################################################
# Rift Wrapped - Setup Verification Script
# Verifies that all required files for Docker deployment are present
###############################################################################

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

echo "=================================================="
echo "    Rift Wrapped - Setup Verification"
echo "=================================================="
echo ""

# Check required files
echo "Checking Docker configuration files..."
echo ""

# Root level files
[ -f "docker-compose.yml" ]
print_check $? "docker-compose.yml exists"

[ -f "setup-ec2.sh" ]
print_check $? "setup-ec2.sh exists"

[ -x "setup-ec2.sh" ]
print_check $? "setup-ec2.sh is executable"

[ -f "DEPLOYMENT.md" ]
print_check $? "DEPLOYMENT.md exists"

[ -f "DOCKER-QUICKSTART.md" ]
print_check $? "DOCKER-QUICKSTART.md exists"

echo ""
echo "Checking backend files..."
echo ""

# Backend files
[ -f "backend/Dockerfile" ]
print_check $? "backend/Dockerfile exists"

[ -f "backend/.dockerignore" ]
print_check $? "backend/.dockerignore exists"

[ -f "backend/.env.example" ]
print_check $? "backend/.env.example exists"

[ -f "backend/requirements.txt" ]
print_check $? "backend/requirements.txt exists"

[ -f "backend/main.py" ]
print_check $? "backend/main.py exists"

echo ""
echo "Checking frontend files..."
echo ""

# Frontend files
[ -f "frontend/Dockerfile" ]
print_check $? "frontend/Dockerfile exists"

[ -f "frontend/.dockerignore" ]
print_check $? "frontend/.dockerignore exists"

[ -f "frontend/nginx.conf" ]
print_check $? "frontend/nginx.conf exists"

[ -f "frontend/package.json" ]
print_check $? "frontend/package.json exists"

[ -f "frontend/vite.config.ts" ]
print_check $? "frontend/vite.config.ts exists"

echo ""
echo "=================================================="

# Check if .env exists
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} backend/.env file exists"
    
    # Check if it contains required variables
    if grep -q "RIOT_API_KEY=" backend/.env && \
       grep -q "AWS_ACCESS_KEY_ID=" backend/.env && \
       grep -q "AWS_SECRET_ACCESS_KEY=" backend/.env; then
        echo -e "${GREEN}✓${NC} Environment variables are configured"
    else
        echo -e "${YELLOW}⚠${NC} Some environment variables may be missing"
        echo "  Please ensure backend/.env contains:"
        echo "    - RIOT_API_KEY"
        echo "    - AWS_ACCESS_KEY_ID"
        echo "    - AWS_SECRET_ACCESS_KEY"
    fi
else
    echo -e "${YELLOW}⚠${NC} backend/.env file not found"
    echo "  Create it from the example:"
    echo "  $ cp backend/.env.example backend/.env"
    echo "  $ nano backend/.env  # Add your credentials"
fi

echo ""
echo "=================================================="
echo -e "${BLUE}Next Steps:${NC}"
echo ""

if [ ! -f "backend/.env" ]; then
    echo "1. Create and configure backend/.env with your API keys"
    echo "2. Run: ./setup-ec2.sh (on EC2) or docker-compose up -d (local)"
else
    echo "You're ready to deploy!"
    echo ""
    echo "On EC2 instance:"
    echo "  $ ./setup-ec2.sh"
    echo ""
    echo "For local development:"
    echo "  $ docker-compose up -d"
    echo ""
    echo "For detailed instructions, see:"
    echo "  - DOCKER-QUICKSTART.md"
    echo "  - DEPLOYMENT.md"
fi

echo ""
echo "=================================================="

