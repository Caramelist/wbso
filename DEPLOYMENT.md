# WBSO Platform Deployment Guide

## 🚀 Netlify + Firebase Deployment

This guide will help you deploy the WBSO platform with:
- **Frontend**: Netlify (static hosting)
- **Backend**: Firebase Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth

## 📋 Prerequisites

- ✅ Firebase project set up (`your-project-id`)
- ✅ Environment variables configured
- ✅ Dependencies installed
- ✅ Netlify account
- ✅ Git repository

## 🔥 Step 1: Deploy Firebase Backend

### Deploy Functions and Firestore Rules
```bash
# Build and deploy Firebase backend
firebase deploy

# Or deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only storage
```

### Verify Functions Deployment
```bash
# Check if functions are live
curl https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/api/status
```

## 🌐 Step 2: Deploy Frontend to Netlify

### Option A: Netlify CLI (Recommended)

#### Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Deploy from Terminal
```bash
# Login to Netlify
netlify login

# Build the frontend
cd frontend && npm run build

# Deploy to Netlify
netlify deploy --prod --dir=out

# Or deploy as draft first
netlify deploy --dir=out
```

### Option B: GitHub Integration

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Connect to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Configure build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/out`
   - **Node version**: `18`

### Option C: Manual Deploy

#### 1. Build Locally
```bash
cd frontend && npm run build
```

#### 2. Upload to Netlify
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Drag and drop the `frontend/out` folder

## ⚙️ Step 3: Configure Environment Variables on Netlify

### Via Netlify Dashboard
1. Go to Site Settings → Environment Variables
2. Add these variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Production settings
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
```

### Via Netlify CLI
```bash
# Set environment variables via CLI
netlify env:set NEXT_PUBLIC_FIREBASE_API_KEY "your_api_key"
netlify env:set NEXT_PUBLIC_FIREBASE_PROJECT_ID "YOUR_PROJECT_ID"
# ... add all other variables
```

## 🔐 Step 4: Update Security Settings

### Update CORS in Firebase Functions
Update the CORS origins in `functions/src/index.ts`:
```typescript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-site-name.netlify.app', // Add your Netlify URL
    'https://your-custom-domain.com',     // Add custom domain if any
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### Update Firebase Auth Domains
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Authentication → Settings → Authorized domains
3. Add your Netlify domain: `your-site-name.netlify.app`

## 🎯 Step 5: Test Deployment

### Frontend Tests
- ✅ Site loads at Netlify URL
- ✅ Firebase configuration works
- ✅ Google OAuth login works
- ✅ Dashboard displays correctly

### Backend Tests
```bash
# Test API endpoint
curl https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/api/status

# Test health check
curl https://europe-west1-YOUR_PROJECT_ID.cloudfunctions.net/api/health
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and rebuild
rm -rf frontend/.next frontend/out
cd frontend && npm run build
```

#### 2. CORS Errors
- Verify Netlify domain is added to CORS origins
- Redeploy Firebase Functions after updating CORS

#### 3. Firebase Auth Issues
- Check authorized domains in Firebase console
- Verify environment variables are set correctly

#### 4. API Connection Issues
- Ensure Firebase Functions are deployed
- Check function URLs in netlify.toml

### Debug Commands
```bash
# Check Netlify build logs
netlify logs

# Check Firebase function logs
firebase functions:log

# Test local build
cd frontend && npm run build && npx serve out
```

## 🚀 Production Checklist

### Before Going Live
- [ ] Firebase Functions deployed and tested
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Environment variables set on Netlify
- [ ] CORS updated for production domain
- [ ] Firebase Auth domains configured
- [ ] SSL certificate enabled (automatic on Netlify)
- [ ] Custom domain configured (optional)
- [ ] Analytics configured
- [ ] Error tracking configured (Sentry)

### Performance Optimizations
- [ ] Enable Netlify Analytics
- [ ] Configure CDN caching
- [ ] Enable image optimization
- [ ] Monitor Core Web Vitals

## 📊 Monitoring & Analytics

### Netlify Analytics
- Enable in Site Settings → Analytics
- Monitor traffic, performance, and errors

### Firebase Performance
- Monitor function execution times
- Track database performance
- Monitor authentication metrics

### Custom Monitoring
```bash
# Add performance monitoring to your app
npm install @firebase/performance
```

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push
1. Connect GitHub repository to Netlify
2. Enable auto-deploy on main branch
3. Set up build notifications

### Deploy Hooks
```bash
# Create deploy hook for manual triggers
curl -X POST -d {} https://api.netlify.com/build_hooks/your_hook_id
```

## 💰 Cost Considerations

### Netlify (Frontend)
- **Free Tier**: 100GB bandwidth, 300 build minutes
- **Pro**: $19/month for more bandwidth and features

### Firebase (Backend)
- **Spark Plan (Free)**: Limited function invocations
- **Blaze Plan (Pay-as-you-go)**: Recommended for production

## 🎉 Post-Deployment

### Share Your Deployment
Your WBSO platform will be live at:
- **Primary URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

### Next Steps
1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan for scaling
4. Set up staging environment
5. Document admin procedures 