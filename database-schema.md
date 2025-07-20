# WBSO Platform Database Schema - Lead Conversion System

## Core Architecture: Marketing → App Data Flow

### 1. Lead Management Tables

```sql
-- Leads from marketing site (before registration)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Lead source tracking
    source VARCHAR(50) NOT NULL, -- 'wbso_check', 'newsletter', 'download'
    utm_campaign VARCHAR(100),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    
    -- GDPR compliance
    consent_marketing BOOLEAN DEFAULT false,
    consent_timestamp TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    
    -- Lead status
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'converted', 'unsubscribed'
    lead_score INTEGER DEFAULT 0,
    
    -- Conversion tracking
    converted_user_id UUID REFERENCES users(id),
    converted_at TIMESTAMP
);

-- WBSO Check specific data
CREATE TABLE wbso_check_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Company data (from KVK)
    kvk_number VARCHAR(8),
    company_name VARCHAR(255),
    company_address TEXT,
    company_city VARCHAR(100),
    sbi_code VARCHAR(10),
    sbi_description TEXT,
    estimated_employees INTEGER,
    
    -- Project assessment
    annual_revenue_range VARCHAR(50),
    development_types TEXT[], -- ['software', 'hardware', 'process']
    technical_problems TEXT[], -- ['ai', 'integration', 'automation']
    project_duration VARCHAR(20), -- '3-6', '6-12', '12-24', '24+'
    
    -- Team data
    technical_staff_count VARCHAR(10), -- '0', '1-2', '3-5', '6-10', '10+'
    hours_per_week INTEGER,
    previous_wbso BOOLEAN,
    
    -- Calculation results
    calculated_subsidy INTEGER,
    subsidy_rate INTEGER, -- 36 or 50
    monthly_cashflow INTEGER,
    total_hours INTEGER,
    is_starter BOOLEAN,
    
    -- Form completion tracking
    completed_steps INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 5,
    completion_time_seconds INTEGER,
    abandoned_at_step INTEGER
);

-- Lead interaction tracking
CREATE TABLE lead_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    
    interaction_type VARCHAR(50), -- 'email_open', 'email_click', 'page_visit', 'form_submit'
    interaction_data JSONB,
    source_campaign VARCHAR(100),
    conversion_value DECIMAL(10,2) -- If this interaction led to conversion
);
```

### 2. User Account Tables (Main App)

```sql
-- Main user accounts (after registration)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Authentication
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    
    -- Subscription & billing
    subscription_status VARCHAR(20) DEFAULT 'trial', -- 'trial', 'active', 'cancelled'
    subscription_plan VARCHAR(20), -- 'starter', 'professional', 'enterprise'
    trial_ends_at TIMESTAMP,
    
    -- Company association
    company_id UUID REFERENCES companies(id),
    role VARCHAR(20) DEFAULT 'admin', -- 'admin', 'member'
    
    -- Lead conversion tracking
    original_lead_id UUID REFERENCES leads(id),
    lead_source VARCHAR(50),
    conversion_campaign VARCHAR(100)
);

-- Company information (merged from lead data)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Company details (pre-filled from KVK data)
    name VARCHAR(255) NOT NULL,
    kvk_number VARCHAR(8),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Business details
    industry VARCHAR(100),
    sbi_code VARCHAR(10),
    sbi_description TEXT,
    employee_count INTEGER,
    annual_revenue_range VARCHAR(50),
    
    -- WBSO history
    has_previous_wbso BOOLEAN DEFAULT false,
    wbso_experience_years INTEGER DEFAULT 0
);
```

### 3. Application Data (Pre-filled from Lead)

```sql
-- WBSO Applications (main product)
CREATE TABLE wbso_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Application status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'generated', 'submitted', 'approved'
    application_year INTEGER,
    application_period VARCHAR(10), -- 'Q1', 'Q2', 'Q3', 'Q4'
    
    -- Pre-filled from lead magnet data
    prefilled_from_lead_id UUID REFERENCES wbso_check_submissions(id),
    
    -- Project information (can be pre-populated)
    project_title VARCHAR(255),
    project_type VARCHAR(20), -- 'development', 'research'
    project_description TEXT,
    
    -- Technical details
    technical_challenge TEXT,
    innovative_aspects TEXT,
    expected_results TEXT,
    
    -- Timeline and budget
    start_date DATE,
    end_date DATE,
    estimated_hours INTEGER,
    estimated_budget INTEGER,
    
    -- Generated content
    ai_generated_content JSONB,
    pdf_generated_at TIMESTAMP,
    pdf_file_path VARCHAR(500)
);
```

## Data Flow & Conversion Process

### Step 1: Lead Capture (Marketing Site)
```javascript
// When user completes WBSO check
async function saveWBSOCheckLead(formData, email) {
    const leadData = {
        email: email,
        source: 'wbso_check',
        consent_marketing: formData.emailConsent,
        consent_timestamp: new Date(),
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        lead_score: calculateLeadScore(formData)
    };
    
    // Create or update lead
    const lead = await createOrUpdateLead(leadData);
    
    // Save WBSO check data
    await saveWBSOCheckSubmission(lead.id, formData);
    
    // Track interaction
    await trackLeadInteraction(lead.id, 'wbso_check_completed', formData);
    
    return lead;
}
```

### Step 2: Lead Nurturing & Conversion
```javascript
// Email marketing sequences
const conversionCampaigns = {
    immediate: {
        trigger: 'wbso_check_completed',
        delay: '2 hours',
        template: 'wbso_results_with_cta',
        cta_url: '/register?lead_token={encrypted_lead_id}'
    },
    
    followup_1: {
        trigger: 'wbso_check_completed',
        delay: '1 day',
        condition: 'not_converted',
        template: 'wbso_deadline_urgency'
    },
    
    case_study: {
        trigger: 'wbso_check_completed', 
        delay: '3 days',
        condition: 'high_lead_score && not_converted',
        template: 'success_story_similar_company'
    }
};
```

### Step 3: Seamless Registration & Pre-filling
```javascript
// When lead clicks registration link
async function convertLeadToUser(leadToken, userRegistrationData) {
    // 1. Decrypt and validate lead token
    const leadId = decryptLeadToken(leadToken);
    const lead = await getLeadById(leadId);
    
    // 2. Create user account
    const user = await createUser({
        email: lead.email,
        ...userRegistrationData,
        original_lead_id: lead.id,
        lead_source: lead.source,
        conversion_campaign: lead.last_campaign
    });
    
    // 3. Create company from lead data
    const wbsoData = await getWBSOCheckSubmission(lead.id);
    const company = await createCompany({
        name: wbsoData.company_name,
        kvk_number: wbsoData.kvk_number,
        address: wbsoData.company_address,
        // ... other KVK data
    });
    
    // 4. Pre-fill WBSO application
    const application = await createWBSOApplication({
        user_id: user.id,
        company_id: company.id,
        prefilled_from_lead_id: wbsoData.id,
        // Map lead data to application fields
        project_title: generateProjectTitle(wbsoData),
        estimated_hours: wbsoData.total_hours,
        estimated_budget: calculateBudget(wbsoData)
    });
    
    // 5. Mark lead as converted
    await updateLead(lead.id, {
        status: 'converted',
        converted_user_id: user.id,
        converted_at: new Date()
    });
    
    return { user, company, application };
}
``` 