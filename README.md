# WBSO Automation Platform

AI-powered WBSO (Dutch R&D tax credit) automation platform that transforms 2-3 weeks of manual application work into 30 minutes of automated workflow using Firebase as the complete backend infrastructure.

## 🎯 Project Overview

This platform automates the complex WBSO application process by:
- Using AI to generate WBSO-compliant technical descriptions
- Automatically calculating hour estimates and benefits
- Integrating with KVK API for company data
- Providing a Chrome extension for seamless RVO portal form filling
- Offering comprehensive application management and tracking

## 🏗️ Technical Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Firebase (Functions, Firestore, Auth, Storage)
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth with Google OAuth
- **AI Engine**: OpenAI API via Firebase Functions
- **Browser Extension**: Chrome Extension with Firebase integration
- **Hosting**: Netlify + Firebase (backend functions)

## 📊 Project Structure

```
wbso-automation-platform/
├── frontend/                 # Next.js web application
├── functions/               # Firebase Functions (backend)
├── chrome-extension/        # Chrome extension for form filling
├── firestore/              # Database rules and indexes
├── firebase.json           # Firebase configuration
├── .firebaserc            # Firebase project settings
└── package.json           # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))

### Setup

1. **Clone and install dependencies:**
```bash
git clone [repository-url]
cd wbso-automation-platform
npm install
```

2. **Configure Firebase:**
```bash
# Login to Firebase
firebase login

# Initialize Firebase project
firebase use --add [your-firebase-project-id]

# Set environment variables for Functions
firebase functions:config:set openai.key="your-openai-api-key"
firebase functions:config:set kvk.api_key="your-kvk-api-key"
```

3. **Setup environment variables:**
```bash
# Copy environment template
cp frontend/.env.example frontend/.env.local

# Add your Firebase configuration to frontend/.env.local
```

4. **Deploy Firebase rules and functions:**
```bash
npm run deploy:firestore
npm run deploy:functions
```

5. **Start development servers:**
```bash
# Start Firebase emulators
npm run emulators

# In another terminal, start frontend
npm run dev
```

## 🔥 Firebase Services

### Firestore Collections

- **`/users/{uid}`** - User profiles and settings
- **`/companies/{companyId}`** - Company data from KVK
- **`/applications/{applicationId}`** - WBSO applications with AI content
- **`/subscriptions/{subscriptionId}`** - User subscription management
- **`/trainingData/{dataId}`** - AI model improvement data

### Cloud Functions

- **`generateWBSOApplication`** - AI-powered WBSO content generation
- **`fetchKVKData`** - Company data lookup from KVK API
- **`getApplicationForExtension`** - Chrome extension data sync
- **`processSubscription`** - Subscription management

### Authentication

- Google OAuth integration
- Automatic user profile creation
- Role-based access control

## 🤖 AI Integration

The platform uses OpenAI's GPT models for:
- Generating WBSO-compliant technical descriptions
- Calculating realistic hour estimates
- Creating proper R&D project documentation
- Ensuring compliance with RVO guidelines

### Training Data Structure

```typescript
interface WBSOTrainingData {
  projectDescription: string;
  technicalDescription: string;
  hours: number;
  category: 'software' | 'hardware' | 'process' | 'other';
  approved: boolean;
  feedback?: string;
}
```

## 🌐 Chrome Extension

The Chrome extension automatically fills RVO portal forms by:
1. Detecting WBSO forms on the RVO website
2. Fetching application data from Firebase
3. Mapping data to form fields
4. One-click form completion

### Extension Architecture

- **Background Script**: Maintains Firebase auth state
- **Content Script**: Detects and fills RVO forms
- **Popup**: User interface for extension controls

## 💰 Business Model

### Pricing Tiers

- **Free**: €0/month - 1 application per year
- **Pro**: €99/month - Unlimited applications + Chrome extension
- **Enterprise**: €199/month - Multi-company + team features

### Target Market

- 300,000+ Dutch SMEs eligible for WBSO
- Focus on tech companies and R&D-intensive businesses
- Expansion to other EU R&D tax credit programs

## 🔒 Security & Compliance

- Firebase Security Rules for data protection
- GDPR-compliant data handling
- Secure API key management
- Role-based access control
- Audit logging for all operations

## 📈 Development Roadmap

### Phase 1: MVP (Current)
- [ ] Basic application generation
- [ ] Firebase backend setup
- [ ] User authentication
- [ ] Company management

### Phase 2: Chrome Extension
- [ ] RVO form detection
- [ ] Automated form filling
- [ ] Extension authentication

### Phase 3: AI Enhancement
- [ ] Model fine-tuning
- [ ] Feedback loop integration
- [ ] Multi-language support

### Phase 4: Scale & Expand
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] Integration with accounting software

## 🛠️ Development Commands

```bash
# Frontend development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production

# Firebase development
npm run emulators             # Start Firebase emulators
npm run deploy                # Deploy everything
npm run deploy:functions      # Deploy only functions
npm run deploy:firestore      # Deploy only Firestore rules

# Chrome extension
npm run build:extension       # Build extension for development
```

## 📚 Documentation

- [Firebase Setup Guide](./docs/firebase-setup.md)
- [AI Integration Guide](./docs/ai-integration.md)
- [Chrome Extension Development](./docs/chrome-extension.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: support@wbso-platform.com
- Documentation: [docs.wbso-platform.com](https://docs.wbso-platform.com)
- Issues: [GitHub Issues](https://github.com/your-org/wbso-platform/issues)

---

**Built with ❤️ for the Dutch tech community** 