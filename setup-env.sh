#!/bin/bash

# WBSO Platform - Environment Setup Script
# Run this script to quickly set up your environment variables

echo "🔥 WBSO Platform - Environment Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed.${NC}"
    echo "Please install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI found${NC}"
echo ""

# Frontend Environment Variables
echo -e "${BLUE}📱 Setting up Frontend Environment Variables${NC}"
echo "=============================================="

if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}Creating frontend/.env.local file...${NC}"
    
    # Prompt for Firebase config
    echo ""
    echo "Please enter your Firebase configuration:"
    echo "(Get these from Firebase Console > Project Settings > Your apps > Web app)"
    echo ""
    
    read -p "Firebase API Key: " FIREBASE_API_KEY
    read -p "Firebase Auth Domain: " FIREBASE_AUTH_DOMAIN
    read -p "Firebase Project ID: " FIREBASE_PROJECT_ID
    read -p "Firebase Storage Bucket: " FIREBASE_STORAGE_BUCKET
    read -p "Firebase Messaging Sender ID: " FIREBASE_MESSAGING_SENDER_ID
    read -p "Firebase App ID: " FIREBASE_APP_ID
    
    # Create .env.local file
    cat > frontend/.env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=$FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=$FIREBASE_APP_ID

# Application Settings
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_NAME=WBSO Automation Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHROME_EXTENSION=true
NEXT_PUBLIC_ENABLE_AI_FEEDBACK=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true

# External APIs
NEXT_PUBLIC_KVK_API_URL=https://api.kvk.nl/api/v1
NEXT_PUBLIC_RVO_PORTAL_URL=https://www.rvo.nl
EOF

    echo -e "${GREEN}✅ Frontend environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists, skipping...${NC}"
fi

echo ""

# Firebase Functions Environment Variables
echo -e "${BLUE}⚡ Setting up Firebase Functions Environment Variables${NC}"
echo "===================================================="

echo ""
echo "Now setting up Firebase Functions configuration..."
echo "You'll need API keys from various services."
echo ""

# OpenAI Setup
read -p "Do you have an OpenAI API key? (y/n): " HAS_OPENAI
if [ "$HAS_OPENAI" = "y" ] || [ "$HAS_OPENAI" = "Y" ]; then
    read -p "Enter your OpenAI API key: " OPENAI_KEY
    firebase functions:config:set openai.api_key="$OPENAI_KEY"
    firebase functions:config:set openai.model="gpt-4"
    firebase functions:config:set openai.max_tokens="4000"
    firebase functions:config:set openai.temperature="0.7"
    echo -e "${GREEN}✅ OpenAI configuration set${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping OpenAI setup. Get a key from https://platform.openai.com${NC}"
fi

echo ""

# KVK Setup
read -p "Do you have a KVK API key? (y/n): " HAS_KVK
if [ "$HAS_KVK" = "y" ] || [ "$HAS_KVK" = "Y" ]; then
    read -p "Enter your KVK API key: " KVK_KEY
    firebase functions:config:set kvk.api_key="$KVK_KEY"
    firebase functions:config:set kvk.base_url="https://api.kvk.nl/api/v1"
    echo -e "${GREEN}✅ KVK configuration set${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping KVK setup. Get a key from https://developers.kvk.nl${NC}"
fi

echo ""

# Basic App Configuration
echo "Setting up basic app configuration..."
firebase functions:config:set app.environment="development"
firebase functions:config:set app.frontend_url="http://localhost:3000"
firebase functions:config:set app.debug="true"
firebase functions:config:set app.log_level="debug"

echo -e "${GREEN}✅ Basic app configuration set${NC}"

echo ""

# Create local runtime config for emulators
echo "Creating local runtime configuration for emulators..."

RUNTIME_CONFIG="{
  \"app\": {
    \"environment\": \"development\",
    \"frontend_url\": \"http://localhost:3000\",
    \"debug\": \"true\"
  }"

if [ "$HAS_OPENAI" = "y" ] || [ "$HAS_OPENAI" = "Y" ]; then
    RUNTIME_CONFIG="${RUNTIME_CONFIG%?},
  \"openai\": {
    \"api_key\": \"$OPENAI_KEY\"
  }"
fi

if [ "$HAS_KVK" = "y" ] || [ "$HAS_KVK" = "Y" ]; then
    RUNTIME_CONFIG="${RUNTIME_CONFIG%?},
  \"kvk\": {
    \"api_key\": \"$KVK_KEY\"
  }"
fi

RUNTIME_CONFIG="$RUNTIME_CONFIG
}"

echo "$RUNTIME_CONFIG" > functions/.runtimeconfig.json

echo -e "${GREEN}✅ Local runtime configuration created${NC}"

echo ""
echo -e "${GREEN}🎉 Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Install frontend dependencies: cd frontend && npm install"
echo "3. Install functions dependencies: cd functions && npm install"
echo "4. Start the development server: npm run dev"
echo "5. Start Firebase emulators: firebase emulators:start"
echo ""
echo "Optional setup:"
echo "- Get Stripe keys for payment processing"
echo "- Set up SendGrid for email notifications"
echo "- Configure Sentry for error tracking"
echo ""
echo "See FIREBASE_FUNCTIONS_CONFIG.md for complete configuration guide." 