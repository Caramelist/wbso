# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Firebase Analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Environment
NEXT_PUBLIC_ENV=development

# Application Settings
NEXT_PUBLIC_APP_NAME=WBSO Automation Platform
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_CHROME_EXTENSION=true
NEXT_PUBLIC_ENABLE_AI_FEEDBACK=true

# External APIs (for development)
NEXT_PUBLIC_KVK_API_URL=https://api.kvk.nl/api/v1
NEXT_PUBLIC_RVO_PORTAL_URL=https://www.rvo.nl

# Subscription & Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
NEXT_PUBLIC_PRICING_TABLE_ID=prctbl_your_pricing_table
```

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the web app icon
6. Copy the configuration values

## Setup Steps

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase configuration values
3. Adjust feature flags as needed
4. Save the file
5. Restart your development server

## Security Notes

- Never commit `.env.local` files to version control
- Use different configurations for development, staging, and production
- Keep sensitive keys secure and rotate them regularly 