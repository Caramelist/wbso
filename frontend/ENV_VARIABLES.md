# Frontend Environment Variables

## Required Environment Variables

Create `frontend/.env.local` with the following variables:

### 🔥 Firebase Configuration
```bash
# Get these from Firebase Console > Project Settings > General > Your apps > Web app
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Optional: Firebase Analytics (if enabled)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### ⚙️ Application Settings
```bash
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_NAME=WBSO Automation Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🎛️ Feature Flags
```bash
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHROME_EXTENSION=true
NEXT_PUBLIC_ENABLE_AI_FEEDBACK=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

### 🌐 External APIs
```bash
NEXT_PUBLIC_KVK_API_URL=https://api.kvk.nl/api/v1
NEXT_PUBLIC_RVO_PORTAL_URL=https://www.rvo.nl
```

### 💳 Payments (Stripe)
```bash
# Get from Stripe Dashboard > Developers > API keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...your_stripe_publishable_key
NEXT_PUBLIC_PRICING_TABLE_ID=prctbl_...your_pricing_table_id
```

### 📊 Analytics (Production)
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry Error Tracking (Optional)
NEXT_PUBLIC_SENTRY_DSN=https://...your_sentry_dsn
```

### 📞 Support
```bash
NEXT_PUBLIC_SUPPORT_EMAIL=support@wbso-platform.com
NEXT_PUBLIC_CONTACT_URL=https://wbso-platform.com/contact
```

## How to Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click the gear icon (Project Settings)
4. Scroll down to "Your apps" section
5. Click on the web app icon `</>`
6. Copy the configuration values from the `firebaseConfig` object

## Environment-Specific Values

### Development
```bash
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

### Production
```bash
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_URL=https://wbso-platform.com
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
``` 