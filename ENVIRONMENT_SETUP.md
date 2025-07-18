# Environment Setup Summary

## 🚀 Quick Start

### Option 1: Automated Setup Script
```bash
# Run the interactive setup script
./setup-env.sh
```

### Option 2: Manual Setup

#### Step 1: Frontend Environment Variables
Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Step 2: Firebase Functions Configuration
```bash
# Essential API keys
firebase functions:config:set openai.api_key="sk-proj-your-openai-key"
firebase functions:config:set kvk.api_key="your-kvk-api-key"
firebase functions:config:set app.environment="development"
firebase functions:config:set app.frontend_url="http://localhost:3000"
```

## 📋 Required Environment Variables

### 🔥 Firebase Configuration (Frontend)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | ✅ | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | ✅ | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | ✅ | `wbso-platform` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | ✅ | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging ID | ✅ | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | ✅ | `1:123:web:abc` |

### ⚡ Firebase Functions Configuration
| Variable | Description | Required | Command |
|----------|-------------|----------|---------|
| `openai.api_key` | OpenAI API Key for AI generation | ✅ | `firebase functions:config:set openai.api_key="sk-..."` |
| `kvk.api_key` | KVK API Key for company data | ✅ | `firebase functions:config:set kvk.api_key="your-key"` |
| `app.environment` | Environment identifier | ✅ | `firebase functions:config:set app.environment="development"` |
| `app.frontend_url` | Frontend URL | ✅ | `firebase functions:config:set app.frontend_url="http://localhost:3000"` |

### 💳 Optional - Payment Processing
| Variable | Description | Required | Command |
|----------|-------------|----------|---------|
| `stripe.secret_key` | Stripe Secret Key | 🔸 | `firebase functions:config:set stripe.secret_key="sk_test_..."` |
| `stripe.webhook_secret` | Stripe Webhook Secret | 🔸 | `firebase functions:config:set stripe.webhook_secret="whsec_..."` |

## 🔑 Getting API Keys

### 1. Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → ⚙️ Project Settings
3. Scroll to "Your apps" → Web app
4. Copy configuration values

### 2. OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Sign in → API Keys
3. Create new secret key
4. Copy key (starts with `sk-proj-` or `sk-`)

### 3. KVK API Key  
1. Go to [KVK Developer Portal](https://developers.kvk.nl)
2. Register account
3. Request API access
4. Get API key from dashboard

### 4. Stripe Keys (Optional)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API keys
3. Copy secret key (starts with `sk_test_` or `sk_live_`)

## 🏃‍♂️ Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install
cd frontend && npm install
cd ../functions && npm install

# Set up environment variables (use setup script or manual)
./setup-env.sh

# Verify Firebase configuration
firebase functions:config:get
```

### 2. Start Development
```bash
# Terminal 1: Start Firebase emulators
firebase emulators:start

# Terminal 2: Start frontend development server
cd frontend && npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Functions**: http://localhost:5001

## 🔍 Verification

### Check Frontend Configuration
1. Start frontend: `cd frontend && npm run dev`
2. Open browser console
3. Look for Firebase initialization messages
4. No configuration errors should appear

### Check Functions Configuration
```bash
# View all configurations
firebase functions:config:get

# Test functions locally
firebase emulators:start --only functions
```

### Test Authentication Flow
1. Go to http://localhost:3000
2. Click "Continue with Google"
3. Complete OAuth flow
4. Should redirect to dashboard

## 🚨 Troubleshooting

### Frontend Issues
- **Firebase config errors**: Check `.env.local` file exists and has correct values
- **CORS errors**: Verify Firebase project domains in console
- **Build errors**: Ensure all required packages are installed

### Functions Issues  
- **OpenAI errors**: Verify API key is set correctly
- **KVK errors**: Check if KVK API is accessible and key is valid
- **CORS errors**: Check `cors.allowed_origins` configuration

### Common Fixes
```bash
# Reset Firebase configuration
firebase functions:config:unset openai
firebase functions:config:set openai.api_key="new-key"

# Clear Next.js cache
cd frontend && rm -rf .next

# Restart emulators
firebase emulators:start --only functions,firestore,auth
```

## 📚 Additional Resources

- [Frontend Environment Variables Guide](frontend/ENV_VARIABLES.md)
- [Complete Functions Configuration](FIREBASE_FUNCTIONS_CONFIG.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## 🔐 Security Notes

- ✅ Never commit `.env.local` or `.runtimeconfig.json` files
- ✅ Use test API keys in development
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations
- ❌ Don't hardcode secrets in source code 