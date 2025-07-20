# GDPR Compliance Guide - Lead Management & Conversion

## Legal Basis for Processing

### 1. Marketing Site Lead Capture
**Legal Basis:** Consent (Art. 6(1)(a) GDPR)

```javascript
// Explicit consent collection
const consentForm = {
    emailConsent: {
        label: "Ik ga akkoord met het ontvangen van e-mails over WBSO-diensten",
        required: true,
        purpose: "E-mail marketing en follow-up communicatie"
    },
    
    dataProcessing: {
        label: "Ik ga akkoord met de verwerking van mijn gegevens voor WBSO-berekening",
        required: true,
        purpose: "Uitvoeren van WBSO-berekening en resultaten verstrekken"
    },
    
    dataSharing: {
        label: "Mijn gegevens mogen worden gedeeld tussen marketing site en applicatie",
        required: false,
        purpose: "Naadloze overgang naar WBSO-applicatie service"
    }
};
```

### 2. Lead Nurturing & Recontact
**Legal Basis:** Legitimate Interest (Art. 6(1)(f) GDPR) + Consent

```javascript
const legitimateInterestAssessment = {
    purpose: "Follow-up op WBSO-berekening en aanbieden van gerelateerde diensten",
    necessity: "Noodzakelijk voor bedrijfsvoering en klantenservice",
    balancingTest: {
        ourInterest: "Commercieel belang in conversie van leads naar klanten",
        dataSubjectImpact: "Minimale impact - alleen e-mail contact over gerelateerde diensten",
        expectation: "Gebruiker verwacht follow-up na het aanvragen van WBSO-berekening",
        mitigation: "Eenvoudige opt-out mogelijkheid in elke e-mail"
    }
};
```

## Data Processing Principles

### 1. Purpose Limitation
```javascript
const dataPurposes = {
    primary: [
        "WBSO-berekening uitvoeren",
        "Resultaten verstrekken aan gebruiker",
        "Klantenservice en support"
    ],
    
    secondary: [
        "Marketing communicatie (met consent)",
        "Service verbetering en analytics",
        "Fraud preventie en security"
    ],
    
    prohibited: [
        "Verkoop aan derden",
        "Ongerelated marketing",
        "Profiling zonder consent"
    ]
};
```

### 2. Data Minimization
```javascript
// Only collect what's necessary
const minimumDataSet = {
    required: {
        email: "Voor resultaten en communicatie",
        kvkNumber: "Voor bedrijfsverificatie",
        projectType: "Voor accurate berekening"
    },
    
    optional: {
        phone: "Voor snellere service (alleen met consent)",
        revenue: "Voor betere berekening (kan worden geschat)",
        companySize: "Voor service personalisatie"
    },
    
    prohibited: {
        personalDetails: "Niet nodig voor WBSO-berekening",
        financialDetails: "Buiten scope van service",
        sensitiveData: "Nooit verzamelen"
    }
};
```

### 3. Storage Limitation
```javascript
const dataRetentionPolicy = {
    activeLeads: {
        duration: "2 jaar vanaf laatste interactie",
        rationale: "Normale sales cyclus voor B2B diensten",
        action: "Automatische verwijdering na 2 jaar"
    },
    
    convertedUsers: {
        duration: "Behouden zolang account actief is",
        rationale: "Nodig voor service levering",
        action: "Verwijderen 1 jaar na account sluiting"
    },
    
    unsubscribed: {
        duration: "Email blijft in suppression list",
        rationale: "Voorkomen van ongewenste contact",
        action: "Email gehashed bewaren voor suppression"
    }
};
```

## Implementation: GDPR-Compliant Consent Management

### 1. Consent Collection Interface
```javascript
// Marketing site consent form
const ConsentForm = () => {
    return (
        <div className="gdpr-consent-section">
            <h3>Gebruik van uw gegevens</h3>
            
            <div className="consent-explanation">
                <p>We gebruiken uw gegevens voor:</p>
                <ul>
                    <li>✅ Het uitvoeren van uw WBSO-berekening</li>
                    <li>✅ Het versturen van uw resultaten</li>
                    <li>📧 Follow-up e-mails over onze WBSO-diensten (optioneel)</li>
                </ul>
            </div>
            
            <div className="consent-checkboxes">
                <label>
                    <input 
                        type="checkbox" 
                        name="processing_consent" 
                        required 
                    />
                    Ik ga akkoord met de verwerking van mijn gegevens voor WBSO-berekening
                </label>
                
                <label>
                    <input 
                        type="checkbox" 
                        name="marketing_consent" 
                    />
                    Ik wil e-mails ontvangen over WBSO-diensten en gerelateerde aanbiedingen
                </label>
                
                <label>
                    <input 
                        type="checkbox" 
                        name="data_sharing_consent" 
                    />
                    Mijn gegevens mogen worden gedeeld met de WBSO-applicatie voor naadloze service
                </label>
            </div>
            
            <div className="privacy-links">
                <a href="/privacy-policy">Privacybeleid</a> | 
                <a href="/data-processing">Gegevensverwerkingsovereenkomst</a>
            </div>
        </div>
    );
};
```

### 2. Consent Storage & Tracking
```sql
-- Enhanced consent tracking
CREATE TABLE consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Consent details
    consent_type VARCHAR(50) NOT NULL, -- 'marketing', 'processing', 'data_sharing'
    consent_given BOOLEAN NOT NULL,
    consent_method VARCHAR(50), -- 'checkbox', 'email_click', 'phone_verbal'
    
    -- Evidence
    ip_address INET,
    user_agent TEXT,
    form_version VARCHAR(20),
    consent_text TEXT, -- Exact wording shown to user
    
    -- Withdrawal tracking
    withdrawn_at TIMESTAMP,
    withdrawal_method VARCHAR(50)
);
```

### 3. Data Subject Rights Implementation
```javascript
// GDPR Rights Management API
class GDPRRightsManager {
    // Right of Access (Art. 15)
    async exportPersonalData(email) {
        const lead = await this.findLeadByEmail(email);
        if (!lead) return null;
        
        return {
            personalData: {
                email: lead.email,
                createdAt: lead.created_at,
                lastInteraction: lead.updated_at
            },
            wbsoData: await this.getWBSOCheckData(lead.id),
            interactions: await this.getInteractionHistory(lead.id),
            consents: await this.getConsentHistory(lead.id)
        };
    }
    
    // Right to Rectification (Art. 16)
    async updatePersonalData(email, updates) {
        const lead = await this.findLeadByEmail(email);
        await this.updateLead(lead.id, updates);
        await this.logDataChange(lead.id, 'rectification', updates);
    }
    
    // Right to Erasure (Art. 17)
    async deletePersonalData(email, reason) {
        const lead = await this.findLeadByEmail(email);
        
        // Check if we can delete (e.g., no legal obligations)
        const canDelete = await this.checkDeletionEligibility(lead.id);
        
        if (canDelete) {
            await this.anonymizeLeadData(lead.id);
            await this.logDataDeletion(lead.id, reason);
        }
        
        return canDelete;
    }
    
    // Right to Object (Art. 21)
    async processObjection(email, objectionType) {
        const lead = await this.findLeadByEmail(email);
        
        if (objectionType === 'marketing') {
            await this.withdrawConsent(lead.id, 'marketing');
            await this.addToSuppressionList(email);
        }
        
        await this.logObjection(lead.id, objectionType);
    }
}
```

## Email Marketing Compliance

### 1. Unsubscribe Mechanism
```javascript
// One-click unsubscribe implementation
app.get('/unsubscribe/:token', async (req, res) => {
    try {
        const leadId = decryptUnsubscribeToken(req.params.token);
        
        // Update consent
        await this.withdrawConsent(leadId, 'marketing');
        
        // Add to suppression list
        const lead = await this.getLeadById(leadId);
        await this.addToSuppressionList(lead.email);
        
        // Log withdrawal
        await this.logConsentWithdrawal(leadId, 'email_unsubscribe');
        
        res.render('unsubscribed-successfully');
        
    } catch (error) {
        res.render('unsubscribe-error');
    }
});
```

### 2. Email Template Compliance
```html
<!-- GDPR-compliant email template -->
<div class="email-template">
    <div class="email-content">
        <!-- Main content -->
    </div>
    
    <div class="email-footer">
        <p class="gdpr-info">
            U ontvangt deze e-mail omdat u heeft ingestemd met marketing communicatie 
            op {{consentDate}} via onze WBSO Check tool.
        </p>
        
        <p class="unsubscribe-links">
            <a href="{{unsubscribeUrl}}">Uitschrijven</a> | 
            <a href="{{preferencesUrl}}">E-mail voorkeuren</a> | 
            <a href="{{dataRequestUrl}}">Mijn gegevens</a>
        </p>
        
        <p class="company-info">
            WBSO Simpel B.V. | KvK: 12345678 | 
            <a href="{{privacyPolicyUrl}}">Privacybeleid</a>
        </p>
    </div>
</div>
```

## Data Sharing Between Marketing & App

### 1. Secure Data Transfer
```javascript
// Encrypted lead token for secure data transfer
class LeadTokenManager {
    generateLeadToken(leadId, expiresIn = '24h') {
        const payload = {
            leadId: leadId,
            exp: Math.floor(Date.now() / 1000) + this.parseExpiry(expiresIn),
            iat: Math.floor(Date.now() / 1000)
        };
        
        return jwt.sign(payload, process.env.LEAD_TOKEN_SECRET);
    }
    
    validateLeadToken(token) {
        try {
            return jwt.verify(token, process.env.LEAD_TOKEN_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired lead token');
        }
    }
}

// Usage in conversion flow
const conversionUrl = `https://app.wbsosimpel.nl/register?lead_token=${leadToken}`;
```

### 2. Data Minimization in Transfer
```javascript
// Only transfer necessary data for application pre-filling
const prepareConversionData = (leadData) => {
    return {
        // Essential for pre-filling
        email: leadData.email,
        companyName: leadData.company_name,
        kvkNumber: leadData.kvk_number,
        
        // Project estimation data
        estimatedSubsidy: leadData.calculated_subsidy,
        projectDuration: leadData.project_duration,
        teamSize: leadData.technical_staff_count,
        
        // Omit sensitive/unnecessary data
        // - IP addresses
        // - User agent strings  
        // - Detailed interaction history
        // - Personal identifiers beyond email
    };
};
```

## Compliance Monitoring & Auditing

### 1. Data Processing Register
```javascript
const dataProcessingRegister = {
    leadManagement: {
        purpose: "Lead generation and nurturing for WBSO services",
        legalBasis: "Consent (marketing) + Legitimate Interest (service follow-up)",
        dataCategories: ["Contact details", "Company information", "Project data"],
        retention: "2 years from last interaction",
        recipients: "Internal sales team, email service provider",
        transfers: "None outside EU"
    }
};
```

### 2. Regular Compliance Checks
```javascript
// Automated compliance monitoring
class ComplianceMonitor {
    async runMonthlyCheck() {
        const issues = [];
        
        // Check for expired consents
        const expiredConsents = await this.findExpiredConsents();
        if (expiredConsents.length > 0) {
            issues.push(`${expiredConsents.length} expired consents need cleanup`);
        }
        
        // Check retention policy compliance
        const overdueData = await this.findOverdueData();
        if (overdueData.length > 0) {
            issues.push(`${overdueData.length} records exceed retention policy`);
        }
        
        // Generate report
        await this.generateComplianceReport(issues);
    }
}
```

## Key Takeaways for Implementation

### ✅ **What You CAN Do:**
1. **Store lead data** with proper consent
2. **Share between marketing/app** with data sharing consent
3. **Follow-up marketing** based on legitimate interest + easy opt-out
4. **Pre-fill applications** using consented data transfer
5. **Retain for 2 years** for business purposes

### ⚠️ **What You MUST Do:**
1. **Get explicit consent** for marketing emails
2. **Provide easy unsubscribe** in every email  
3. **Honor data subject rights** (access, deletion, etc.)
4. **Document consent** with timestamp and method
5. **Regular data cleanup** based on retention policy

### ❌ **What You CANNOT Do:**
1. **Contact without consent** or legitimate interest
2. **Share with third parties** without explicit consent
3. **Ignore unsubscribe requests**
4. **Keep data indefinitely**
5. **Use for unrelated purposes**

This approach gives you **maximum conversion potential** while staying **fully GDPR compliant**! 🔒 