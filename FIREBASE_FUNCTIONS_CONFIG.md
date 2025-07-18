# Firebase Functions Environment Configuration

## Setting Up Environment Variables

Firebase Functions use the Firebase CLI to set environment variables. Run these commands in your terminal:

### 🤖 OpenAI Configuration
```bash
# OpenAI API Key for AI content generation
firebase functions:config:set openai.api_key="sk-proj-...your_openai_api_key"

# Optional: OpenAI Organization ID
firebase functions:config:set openai.organization="org-...your_org_id"

# AI Model Configuration
firebase functions:config:set openai.model="gpt-4"
firebase functions:config:set openai.max_tokens="4000"
firebase functions:config:set openai.temperature="0.7"
```

### 🏢 KVK API Configuration
```bash
# KVK (Dutch Chamber of Commerce) API
firebase functions:config:set kvk.api_key="your_kvk_api_key"
firebase functions:config:set kvk.base_url="https://api.kvk.nl/api/v1"

# KVK Test API (for development)
firebase functions:config:set kvk.test_api_key="your_test_kvk_api_key"
firebase functions:config:set kvk.test_base_url="https://api.kvk.nl/test/api/v1"
```

### 💳 Stripe Configuration
```bash
# Stripe Secret Keys
firebase functions:config:set stripe.secret_key="sk_test_...your_stripe_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_...your_webhook_secret"

# Stripe Product IDs
firebase functions:config:set stripe.price_free="price_...free_plan_id"
firebase functions:config:set stripe.price_pro="price_...pro_plan_id"
firebase functions:config:set stripe.price_enterprise="price_...enterprise_plan_id"
```

### 📧 Email Configuration (SendGrid/Nodemailer)
```bash
# SendGrid
firebase functions:config:set sendgrid.api_key="SG.your_sendgrid_api_key"
firebase functions:config:set sendgrid.from_email="noreply@wbso-platform.com"
firebase functions:config:set sendgrid.from_name="WBSO Platform"

# Or SMTP configuration
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.user="your_email@gmail.com"
firebase functions:config:set smtp.password="your_app_password"
```

### 🔐 Security Configuration
```bash
# JWT Secret for additional security
firebase functions:config:set security.jwt_secret="your_super_secret_jwt_key"

# Rate limiting configuration
firebase functions:config:set rate_limit.window_ms="900000"
firebase functions:config:set rate_limit.max_requests="100"

# CORS allowed origins
firebase functions:config:set cors.allowed_origins="http://localhost:3000,https://wbso-platform.com"
```

### 📊 Analytics & Monitoring
```bash
# Sentry for error tracking
firebase functions:config:set sentry.dsn="https://...your_sentry_dsn"

# Google Analytics (server-side)
firebase functions:config:set analytics.ga_measurement_id="G-XXXXXXXXXX"
firebase functions:config:set analytics.ga_api_secret="your_measurement_protocol_secret"
```

### 🌍 Environment-Specific Settings
```bash
# Environment identifier
firebase functions:config:set app.environment="development"
firebase functions:config:set app.debug="true"
firebase functions:config:set app.log_level="debug"

# App URLs
firebase functions:config:set app.frontend_url="http://localhost:3000"
firebase functions:config:set app.admin_email="admin@wbso-platform.com"
```

### 🔄 RVO Integration
```bash
# RVO Portal configuration (for form automation)
firebase functions:config:set rvo.portal_url="https://www.rvo.nl"
firebase functions:config:set rvo.api_endpoint="https://api.rvo.nl"

# Form field mappings
firebase functions:config:set rvo.form_timeout="30000"
firebase functions:config:set rvo.max_retries="3"
```

## Commands to Run

### 1. Basic Setup (Required)
```bash
# Essential configurations
firebase functions:config:set openai.api_key="your_openai_key"
firebase functions:config:set kvk.api_key="your_kvk_key"
firebase functions:config:set stripe.secret_key="your_stripe_key"
firebase functions:config:set app.environment="development"
firebase functions:config:set app.frontend_url="http://localhost:3000"
```

### 2. View Current Configuration
```bash
# See all set configurations
firebase functions:config:get

# See specific configuration
firebase functions:config:get openai
```

### 3. Delete Configuration (if needed)
```bash
# Delete specific key
firebase functions:config:unset openai.api_key

# Delete entire section
firebase functions:config:unset openai
```

### 4. Deploy Configuration
```bash
# Deploy functions with new configuration
firebase deploy --only functions
```

## Local Development

For local development with emulators, create `functions/.runtimeconfig.json`:

```json
{
  "openai": {
    "api_key": "sk-proj-...your_local_openai_key"
  },
  "kvk": {
    "api_key": "your_local_kvk_key"
  },
  "stripe": {
    "secret_key": "sk_test_...your_local_stripe_key"
  },
  "app": {
    "environment": "development",
    "frontend_url": "http://localhost:3000"
  }
}
```

**Note**: Never commit `.runtimeconfig.json` to version control!

## Getting API Keys

### 🤖 OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up/Login → API Keys
3. Create new secret key
4. Copy the key (starts with `sk-proj-` or `sk-`)

### 🏢 KVK API Key
1. Go to [KVK API Portal](https://developers.kvk.nl)
2. Register for an account
3. Request API access
4. Get your API key from dashboard

### 💳 Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API keys
3. Copy Secret key (starts with `sk_test_` or `sk_live_`)
4. Set up webhook endpoint for subscription events

### 📧 SendGrid Key
1. Go to [SendGrid](https://sendgrid.com)
2. Settings → API Keys
3. Create API key with Mail Send permissions

## Environment Verification

Add this function to verify your environment setup:

```bash
# Deploy a test function to verify configuration
firebase functions:config:set test.verification="setup_complete"
firebase deploy --only functions:verifyEnvironment
```

## Production vs Development

### Development
```bash
firebase use development-project-id
# Set development configurations
```

### Production
```bash
firebase use production-project-id
# Set production configurations with live API keys
``` 