# 🔒 WBSO SECURITY DEPLOYMENT GUIDE

## ⚠️ CRITICAL SECURITY ACTIONS BEFORE PRODUCTION

### 1. 🔐 **SECRET MANAGEMENT** - MANDATORY
```bash
# Set strong secrets (replace with actual strong values)
firebase functions:secrets:set ANTHROPIC_API_KEY="your-actual-anthropic-key"
firebase functions:secrets:set LEAD_TOKEN_SECRET="$(openssl rand -base64 32)"
firebase functions:secrets:set INTERNAL_CALL_SECRET="$(openssl rand -base64 32)"
firebase functions:secrets:set SMTP_PASS="your-smtp-password" 
firebase functions:secrets:set SENDGRID_API_KEY="your-sendgrid-key"
firebase functions:secrets:set KVK_API_KEY="your-kvk-key"
```

### 2. 🚫 **RATE LIMITING UPGRADE** - HIGH PRIORITY
**Current Issue**: Memory-based rate limiting vulnerable to bypass
**Solution Required**: Implement Redis-based distributed rate limiting

```typescript
// TODO: Replace memory-based with Redis
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'wbso_rl',
  points: 15,
  duration: 300
});
```

### 3. 🔒 **ADMIN ROLE SETUP** - MANDATORY
Create admin users for debug endpoint access:
```javascript
// Run in Firebase Console
db.collection('users').doc('YOUR_ADMIN_UID').set({
  role: 'admin',
  email: 'admin@yourcompany.com',
  createdAt: new Date()
});
```

### 4. 💰 **COST MONITORING ALERTS** - CRITICAL
Set up monitoring for:
- Daily costs > $40 (80% of $50 limit) - CONSERVATIVE SAFETY
- Individual user costs > $8 (80% of $10 limit)
- Unusual API call spikes

**Business Context**: 20K Dutch companies apply for WBSO annually (~55/day average).
$50 daily limit = 5 users at maximum daily usage, appropriate for development phase.

### 5. 🌐 **CORS SECURITY** - COMPLETED ✅
- Removed localhost origins from production
- Environment-based origin configuration implemented

## 🛡️ SECURITY MEASURES IMPLEMENTED

### ✅ **Authentication & Authorization**
- ✅ Firebase Auth token verification
- ✅ Session ownership validation
- ✅ Admin-only debug endpoint access
- ✅ JWT token validation with strong secrets

### ✅ **Rate Limiting (Enhanced)**
- ✅ Multiple rate limiting layers
- ✅ Emergency attack prevention
- ✅ Reduced limits for additional security
- ⚠️ **NEEDS UPGRADE**: Redis-based distribution

### ✅ **Input Validation & Sanitization**
- ✅ Enhanced injection pattern detection
- ✅ Session ID format validation
- ✅ Reduced input length limits (5000 chars)
- ✅ Required field type validation

### ✅ **Cost Protection**
- ✅ Transaction-based cost locking
- ✅ Race condition prevention
- ✅ Multiple cost limit layers
- ✅ Real-time cost tracking

### ✅ **Information Security**
- ✅ Sanitized error messages
- ✅ Removed sensitive data from debug endpoint
- ✅ Secure logging without PII
- ✅ GDPR-compliant EU-only deployment

### ✅ **Infrastructure Security**
- ✅ Firebase Functions v2 secrets
- ✅ Proper CORS configuration
- ✅ Function timeouts and memory limits
- ✅ Environment-based configuration

## 🚨 REMAINING SECURITY RISKS

### 1. **HIGH RISK: Distributed Rate Limiting**
**Risk**: Memory-based rate limiting can be bypassed
**Impact**: Cost attacks, system abuse
**Mitigation**: Implement Redis-based rate limiting

### 2. **MEDIUM RISK: Session ID Predictability**
**Risk**: Session IDs might be predictable
**Mitigation**: Verify frontend uses crypto.randomUUID()

### 3. **MEDIUM RISK: Function Timeout Abuse**
**Risk**: 180-second timeouts could be exploited
**Mitigation**: Monitor long-running requests

## 📊 MONITORING & ALERTING

### **Required Monitoring**
1. **Cost Tracking**
   - Real-time cost per user
   - Daily global costs
   - Cost spike detection

2. **Rate Limit Violations**
   - IP-based attacks
   - User-based abuse
   - Geographic anomalies

3. **Error Patterns**
   - Authentication failures
   - Invalid input attempts
   - System errors

4. **Performance Metrics**
   - Function execution times
   - API response times
   - Database query performance

### **Alerting Thresholds**
- Daily cost > $40 (80% of $50 limit)
- User cost > $8 (80% of $10 limit)
- Rate limit violations > 100/hour
- Error rate > 5%
- Response time > 10 seconds

## 🔧 PRODUCTION CHECKLIST

### **Before Deployment**
- [ ] All secrets set with strong values
- [ ] Admin users configured
- [ ] CORS origins verified
- [ ] Rate limits tested
- [ ] Cost monitoring enabled
- [ ] Error handling tested

### **After Deployment**
- [ ] Monitor costs for 24 hours
- [ ] Test rate limiting effectiveness
- [ ] Verify error message sanitization
- [ ] Check admin endpoint access
- [ ] Validate session security

### **Ongoing Security**
- [ ] Weekly cost reviews
- [ ] Monthly security audits
- [ ] Rate limiting effectiveness analysis
- [ ] Update dependencies regularly

## 🚨 EMERGENCY PROCEDURES

### **If Under Attack**
1. **Immediate**: Reduce rate limits to 5 points/minute
2. **Escalate**: Enable IP-based blocking
3. **Monitor**: Watch cost metrics closely
4. **Document**: Log all suspicious activity

### **Cost Spike Response**
1. **Alert**: Immediate notification when >$40/day (80% of limit)
2. **Throttle**: Reduce global limits temporarily to $25/day if needed
3. **Investigate**: Identify source of spike
4. **Block**: Suspend abusive users if needed

### **Security Incident Response**
1. **Isolate**: Disable affected functions
2. **Assess**: Determine impact scope
3. **Notify**: Alert stakeholders
4. **Recover**: Implement fixes and redeploy

## 📞 SUPPORT CONTACTS

- **Security Issues**: [security@yourcompany.com]
- **System Admin**: [admin@yourcompany.com]  
- **Emergency**: [emergency@yourcompany.com]

---

**⚠️ IMPORTANT**: This system handles sensitive business data and incurs real costs. Security is NOT optional. 