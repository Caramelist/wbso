# Firebase Functions Configuration Guide

## 🔒 SECURITY CRITICAL CONFIGURATIONS

### **⚠️ MANDATORY SECRETS** - Must be set before deployment
```bash
# CRITICAL: Set these with strong values
firebase functions:secrets:set ANTHROPIC_API_KEY="your-actual-anthropic-key"
firebase functions:secrets:set LEAD_TOKEN_SECRET="$(openssl rand -base64 32)"  
firebase functions:secrets:set INTERNAL_CALL_SECRET="$(openssl rand -base64 32)"
firebase functions:secrets:set SMTP_PASS="your-strong-smtp-password"
firebase functions:secrets:set SENDGRID_API_KEY="your-sendgrid-api-key"
firebase functions:secrets:set KVK_API_KEY="your-kvk-api-key"
```

### **🛡️ SECURITY ENVIRONMENT VARIABLES** - Recommended values
```bash
# Cost protection limits (ADJUST FOR YOUR BUDGET)
firebase functions:config:set app.max_cost_per_session="5.00"      # $5 per chat session
firebase functions:config:set app.daily_cost_limit="500.00"       # $500 global daily limit  
firebase functions:config:set app.user_daily_cost_limit="10.00"   # $10 per user daily

# Environment configuration
firebase functions:config:set app.environment="production"
firebase functions:config:set app.frontend_url="https://app.wbsosimpel.nl"

# AI Model configuration
firebase functions:config:set anthropic.model="claude-3-5-sonnet-20241022"
```

## 📋 Standard Configuration

### **1. Secrets Management** (Firebase Functions v2)

## ⚠️ IMPORTANT: Migration from functions.config() to Environment Variables

**Firebase Functions v2 no longer supports `functions.config()`**. This document has been updated to show the correct way to configure environment variables for Firebase Functions v2.

## Setting Up Environment Variables for Firebase Functions v2

Firebase Functions v2 uses environment variables and secrets instead of the deprecated `functions.config()`. Here are the methods to configure your environment:

### 🔐 Secrets (for sensitive data like API keys)

Use Firebase CLI to set secrets:

#### 🤖 Anthropic Configuration (REQUIRED)
```bash
# Set the Anthropic API key as a secret (REQUIRED)
firebase functions:secrets:set ANTHROPIC_API_KEY
# You will be prompted to enter your API key securely

# Alternative: Set from a file
echo "your_anthropic_api_key" | firebase functions:secrets:set ANTHROPIC_API_KEY --data-file=-
```

#### 💳 Stripe Configuration (if using payments)
```bash
# Stripe Secret Keys
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

#### 📧 Email Configuration (if using email services)
```bash
# SMTP credentials
firebase functions:secrets:set SMTP_USER
firebase functions:secrets:set SMTP_PASS

# SendGrid API key
firebase functions:secrets:set SENDGRID_API_KEY
```

#### 🏢 KVK API Configuration (if using Dutch Chamber of Commerce API)
```bash
# KVK API key
firebase functions:secrets:set KVK_API_KEY
```

### 🌍 Environment Variables (for non-sensitive configuration)

Set environment variables using the Firebase CLI:

```bash
# AI Model Configuration
firebase functions:config:set anthropic.model="claude-3-5-sonnet-20241022"

# Cost Limiting Configuration
firebase functions:config:set app.max_cost_per_session="5.00"
firebase functions:config:set app.daily_cost_limit="500.00" 
firebase functions:config:set app.user_daily_cost_limit="10.00"

# Environment Settings
firebase functions:config:set app.environment="production"
firebase functions:config:set app.frontend_url="https://app.wbsosimpel.nl"

# SMTP Configuration (non-sensitive)
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.from="noreply@wbsosimpel.nl"
```

**Note**: For Firebase Functions v2, these will be available as `process.env.ANTHROPIC_MODEL`, `process.env.MAX_COST_PER_SESSION`, etc.

### 📋 Required Configuration for WBSO Application

Here's the minimum required setup:

```bash
# 1. Set required secrets
firebase functions:secrets:set ANTHROPIC_API_KEY

# 2. Set basic configuration (optional, has defaults)
firebase functions:config:set anthropic.model="claude-3-5-sonnet-20241022"
firebase functions:config:set app.max_cost_per_session="5.00"
firebase functions:config:set app.daily_cost_limit="500.00"
firebase functions:config:set app.user_daily_cost_limit="10.00"

# 3. Deploy functions
firebase deploy --only functions
```

## Code Usage in Firebase Functions v2

### ✅ Correct Way (v2)

```typescript
import { defineSecret } from 'firebase-functions/params';

// Define secrets at the top level
const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

// Use in function definitions
export const myFunction = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  // Access secret value
  const apiKey = anthropicApiKey.value();
  
  // Access environment variables
  const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
  const maxCost = parseFloat(process.env.MAX_COST_PER_SESSION || '5.00');
  
  // Use in your code...
});
```

### ❌ Deprecated Way (v1 - DO NOT USE)

```typescript
import { config } from 'firebase-functions'; // ❌ Deprecated

export const myFunction = onRequest(async (req, res) => {
  const functionsConfig = config(); // ❌ Not available in v2
  const apiKey = functionsConfig.anthropic?.api_key; // ❌ Will fail
});
```

## Local Development

For local development with Firebase emulators:

### 1. Create `functions/.env` file:
```env
ANTHROPIC_API_KEY=your_local_anthropic_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
MAX_COST_PER_SESSION=5.00
DAILY_COST_LIMIT=500.00
USER_DAILY_COST_LIMIT=10.00
```

### 2. For legacy config compatibility, create `functions/.runtimeconfig.json`:
```json
{
  "anthropic": {
    "model": "claude-3-5-sonnet-20241022"
  },
  "app": {
    "max_cost_per_session": "5.00",
    "daily_cost_limit": "500.00",
    "user_daily_cost_limit": "10.00",
    "environment": "development"
  }
}
```

**⚠️ Important**: Never commit `.env` or `.runtimeconfig.json` to version control!

## Managing Secrets

### View secrets:
```bash
firebase functions:secrets:access ANTHROPIC_API_KEY
```

### Update a secret:
```bash
firebase functions:secrets:set ANTHROPIC_API_KEY --force
```

### Delete a secret:
```bash
firebase functions:secrets:delete ANTHROPIC_API_KEY
```

### List all secrets:
```bash
firebase functions:secrets:list
```

## Environment Variables vs Secrets

| Type | Use For | Method | Access in Code |
|------|---------|--------|----------------|
| **Secrets** | API keys, passwords, tokens | `firebase functions:secrets:set` | `secretName.value()` |
| **Environment Variables** | Non-sensitive config, URLs, limits | `firebase functions:config:set` | `process.env.VAR_NAME` |

## Deployment

After setting up your configuration:

```bash
# Deploy all functions with new configuration
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:startWBSOChat
```

## Verification

Test your configuration with the health check endpoint:

```bash
curl -X GET "https://wbsochathealth-z44g5hzbna-ew.a.run.app"
```

Expected response:
```json
{
  "success": true,
  "message": "WBSO Chat API is healthy",
  "timestamp": "2025-07-24T21:07:16.236Z",
  "version": "1.0.0",
  "security": "enabled"
}
```

## Troubleshooting

### Common Issues:

1. **"functions.config() is no longer available"**
   - ✅ Solution: Migrate to secrets and environment variables as shown above

2. **"ANTHROPIC_API_KEY secret not configured"**
   - ✅ Solution: Set the secret using `firebase functions:secrets:set ANTHROPIC_API_KEY`

3. **Functions can't access secrets**
   - ✅ Solution: Ensure secrets are included in function definition: `{ secrets: [secretName] }`

4. **Environment variables undefined**
   - ✅ Solution: Set using `firebase functions:config:set` and access via `process.env`

## Getting API Keys

### 🤖 Anthropic API Key (REQUIRED)
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign up/Login → API Keys
3. Create new API key
4. Copy the key (starts with `sk-ant-`)

### 💳 Stripe Keys (if using payments)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Developers → API keys
3. Copy Secret key (starts with `sk_test_` or `sk_live_`)

### 📧 SendGrid Key (if using email)
1. Go to [SendGrid](https://sendgrid.com)
2. Settings → API Keys
3. Create API key with Mail Send permissions

### 🏢 KVK API Key (if using Dutch business data)
1. Go to [KVK API Portal](https://developers.kvk.nl)
2. Register and request API access
3. Get your API key from dashboard

## Production vs Development

### Development
```bash
firebase use development-project-id
# Set development secrets and config
```

### Production
```bash
firebase use production-project-id
# Set production secrets and config with live API keys
```

## Security Best Practices

1. **Use secrets for all sensitive data** (API keys, passwords)
2. **Use environment variables for non-sensitive configuration**
3. **Never commit secrets to version control**
4. **Rotate secrets regularly**
5. **Use different secrets for different environments**
6. **Grant minimal necessary permissions to service accounts** 