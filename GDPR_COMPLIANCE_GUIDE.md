# GDPR Compliance Guide for WBSO Application System

## Overview
This guide ensures GDPR compliance for our WBSO application system that uses Anthropic's Claude API for AI assistance.

## 🏛️ **Legal Framework**

### Data Controllers & Processors
- **Your Company**: Data Controller (determines purposes/means of processing)
- **Anthropic Ireland Limited**: Data Processor (processes data on your behalf)
- **EU Representative**: Anthropic Ireland Limited, 6th Floor, South Bank House, Barrow Street, Dublin 4, D04 TR29

### Data Processing Agreement (DPA)
✅ **Status**: Required - Contact Anthropic for enterprise DPA
📧 **Contact**: enterprise@anthropic.com
📄 **Purpose**: Establish controller-processor relationship per Article 28 GDPR

## 🔒 **Data Protection Measures**

### 1. Technical Safeguards
- **Encryption**: TLS 1.3 for data in transit
- **Access Controls**: Limited Anthropic staff access for business purposes only
- **Data Location**: EU/US with Standard Contractual Clauses (SCCs)
- **Retention**: Automatic deletion per Anthropic's retention policy

### 2. Legal Safeguards
- **SCCs**: Standard Contractual Clauses for US data transfers
- **Adequacy Decisions**: Used where applicable (UK, Switzerland)
- **GDPR Articles**: Compliant with Articles 44-49 (international transfers)

## 📋 **Data Subject Rights Implementation**

### User Rights Under GDPR
```markdown
| Right | Implementation | Contact |
|-------|---------------|---------|
| **Access (Art. 15)** | Via user dashboard + Anthropic request | privacy@wbsosimpel.nl |
| **Rectification (Art. 16)** | Edit conversations + data correction | privacy@wbsosimpel.nl |
| **Erasure (Art. 17)** | Delete conversations + Anthropic deletion | privacy@wbsosimpel.nl |
| **Portability (Art. 20)** | Export chat data in JSON format | privacy@wbsosimpel.nl |
| **Object (Art. 21)** | Disable AI processing, use form only | privacy@wbsosimpel.nl |
| **Restrict (Art. 18)** | Temporarily suspend AI processing | privacy@wbsosimpel.nl |
```

## 🎯 **Lawful Basis for Processing**

### AI Chat Processing
- **Article 6(1)(b) GDPR**: Contract performance (WBSO application service)
- **Purpose**: Generate WBSO R&D tax benefit applications
- **Necessity Test**: AI assistance is integral to the service offering

### Analytics & Improvement
- **Article 6(1)(f) GDPR**: Legitimate interest
- **Balancing Test**: Service improvement vs. user privacy (anonymized data only)

## 📝 **Privacy Notice Requirements**

### Required Disclosures (Articles 13/14 GDPR)
✅ **Controller Identity**: Your company details
✅ **DPO Contact**: privacy@wbsosimpel.nl (if applicable)
✅ **Processing Purposes**: WBSO application generation
✅ **Legal Basis**: Contract performance + legitimate interest
✅ **Recipients**: Anthropic Ireland Limited (EU processor)
✅ **International Transfers**: US with SCCs
✅ **Retention Period**: [Define your retention policy]
✅ **Data Subject Rights**: All GDPR rights listed above
✅ **Complaint Rights**: Dutch DPA (Autoriteit Persoonsgegevens)

## 🌍 **International Data Transfers**

### Anthropic's Transfer Safeguards
- **Primary**: Standard Contractual Clauses (2021/914/EU)
- **Backup**: Adequacy decisions where available
- **Monitoring**: Ongoing assessment of US data protection levels
- **Contact**: dpo@anthropic.com for transfer documentation

### Your Obligations
1. **Impact Assessment**: Document necessity of US transfers
2. **Alternative Analysis**: Confirm no EU-only alternatives meet needs
3. **Additional Safeguards**: Monitor effectiveness of SCCs
4. **User Information**: Transparent disclosure of transfer risks

## 🔍 **Data Processing Inventory**

### AI Chat Data Processing
```yaml
Data Category: AI Conversation Data
Legal Basis: Contract Performance (Art. 6(1)(b))
Purpose: WBSO Application Generation
Recipients: Anthropic Ireland Limited
Retention: 30 days after application completion
International Transfers: US (Standard Contractual Clauses)
Special Categories: None (unless user inputs personal health data)
```

### User Account Data
```yaml
Data Category: Authentication & Profile Data
Legal Basis: Contract Performance (Art. 6(1)(b))
Purpose: Service Provision & User Management
Recipients: Firebase (Google Cloud EU)
Retention: Account deletion + 30 days
International Transfers: EU-only (adequacy decision)
Special Categories: None
```

## 📋 **Implementation Checklist**

### ✅ **Completed**
- [x] GDPR consent interface implemented
- [x] Consent storage with 30-day refresh
- [x] Transparent AI processing disclosure
- [x] User right to refuse AI processing
- [x] Fallback to traditional form

### 🔄 **Required Actions**

#### Immediate (This Week)
- [ ] **Sign Anthropic DPA** - Contact enterprise@anthropic.com
- [ ] **Update Privacy Policy** - Include Anthropic processing disclosure
- [ ] **DPO Appointment** - If processing >250 people or special categories
- [ ] **Data Protection Impact Assessment** - For high-risk AI processing

#### Medium Term (This Month)
- [ ] **Staff Training** - GDPR compliance for customer service
- [ ] **Incident Response Plan** - Data breach notification procedures
- [ ] **Vendor Assessment** - Review all third-party processors
- [ ] **Retention Schedule** - Define data deletion timelines

#### Ongoing
- [ ] **Regular Reviews** - Quarterly GDPR compliance checks
- [ ] **User Request Handling** - Process data subject rights requests
- [ ] **Transfer Monitoring** - Assess SCC effectiveness
- [ ] **Documentation Updates** - Keep compliance records current

## 🚨 **Risk Assessment**

### High Priority Risks
1. **US Government Access**: Potential FISA/NSA surveillance of Anthropic data
   - **Mitigation**: SCCs + minimization + encryption
   
2. **Consent Validity**: AI processing consent may be challenged
   - **Mitigation**: Clear purpose limitation + easy withdrawal
   
3. **Data Minimization**: Users may input excessive personal data
   - **Mitigation**: Input guidance + automated detection

### Medium Priority Risks
1. **Third-Party Changes**: Anthropic policy/location changes
   - **Mitigation**: Contract clauses + monitoring
   
2. **Breach Notification**: 72-hour GDPR requirement
   - **Mitigation**: Incident response plan + staff training

## 📞 **Contact Information**

### Your GDPR Contacts
- **Data Protection Officer**: privacy@wbsosimpel.nl
- **General Privacy**: privacy@wbsosimpel.nl
- **Data Subject Requests**: privacy@wbsosimpel.nl

### Anthropic GDPR Contacts
- **EU Data Controller**: Anthropic Ireland Limited
- **Data Protection Officer**: dpo@anthropic.com
- **Privacy General**: privacy@anthropic.com

### Regulatory Authorities
- **Netherlands**: Autoriteit Persoonsgegevens (AP)
- **EU Complaints**: https://edpb.europa.eu/about-edpb/contact_en
- **Irish DPA**: https://www.dataprotection.ie/ (Anthropic's lead authority)

## 📚 **Additional Resources**

### Documentation Links
- **Anthropic Privacy Policy**: https://www.anthropic.com/legal/privacy
- **Anthropic Model Training Notice**: https://www.anthropic.com/legal/model-training-notice
- **EU SCC Templates**: https://ec.europa.eu/info/law/law-topic/data-protection/international-dimension-data-protection/standard-contractual-clauses-scc_en
- **GDPR Text**: https://gdpr.eu/

### Best Practices
1. **Privacy by Design**: Build privacy into all new features
2. **Minimization**: Collect only necessary data for WBSO applications
3. **Transparency**: Clear communication about AI processing
4. **User Control**: Easy consent withdrawal and data deletion
5. **Regular Reviews**: Quarterly compliance assessments

---

**Last Updated**: [Current Date]
**Review Date**: [Quarterly]
**Document Owner**: Data Protection Officer 