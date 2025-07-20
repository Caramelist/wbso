// Lead API Client - Frontend integration with backend lead management

interface LeadCaptureData {
  email: string;
  source: string;
  consent_marketing: boolean;
  consent_data_sharing: boolean;
  wbso_data?: {
    kvk_number: string;
    company_name: string;
    company_address: string;
    sbi_description: string;
    technical_problems: string[];
    project_duration: string;
    technical_staff_count: string;
    calculated_subsidy: number;
    subsidy_rate: number;
    is_starter: boolean;
  };
}

interface LeadResponse {
  success: boolean;
  lead_id: string;
  lead_score: number;
  conversion_token: string;
}

interface ConversionData {
  lead_token: string;
  user_data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

class LeadApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL || 'https://europe-west1-wbso-platform.cloudfunctions.net';
  }

  /**
   * Capture lead from marketing site (WBSO Check, newsletter, etc.)
   */
  async captureLead(data: LeadCaptureData): Promise<LeadResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/captureLead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Lead capture error:', error);
      throw new Error('Failed to capture lead');
    }
  }

  /**
   * Generate conversion URL for lead magnet users
   */
  generateConversionUrl(conversionToken: string, baseUrl: string = 'https://app.wbsosimpel.nl'): string {
    return `${baseUrl}/applications/new?lead_token=${encodeURIComponent(conversionToken)}&source=wbso_check`;
  }

  /**
   * Track lead interaction (email opens, clicks, page visits)
   */
  async trackInteraction(leadId: string, interactionType: string, data?: any): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/trackInteraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead_id: leadId,
          interaction_type: interactionType,
          interaction_data: data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Interaction tracking error:', error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  /**
   * Get lead analytics dashboard data
   */
  async getAnalytics(): Promise<{
    total_leads: number;
    total_conversions: number;
    conversion_rate: number;
    source_breakdown: Record<string, number>;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/getLeadAnalytics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Analytics fetch error:', error);
      throw new Error('Failed to fetch analytics');
    }
  }

  /**
   * Convert lead to user account
   */
  async convertLeadToUser(data: ConversionData): Promise<{
    success: boolean;
    user_id: string;
    pre_filled_data?: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/convertLead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Lead conversion error:', error);
      throw new Error('Failed to convert lead');
    }
  }
}

// Singleton instance
export const leadApi = new LeadApiClient();

// React hook for lead management
export const useLeadTracking = () => {
  return {
    captureLead: leadApi.captureLead.bind(leadApi),
    trackInteraction: leadApi.trackInteraction.bind(leadApi),
    generateConversionUrl: leadApi.generateConversionUrl.bind(leadApi),
    convertLead: leadApi.convertLeadToUser.bind(leadApi)
  };
};

// Utility functions for marketing site integration
export const createWBSOCheckLead = async (wbsoCheckData: any, email: string, consents: {
  marketing: boolean;
  data_sharing: boolean;
}) => {
  return await leadApi.captureLead({
    email,
    source: 'wbso_check',
    consent_marketing: consents.marketing,
    consent_data_sharing: consents.data_sharing,
    wbso_data: {
      kvk_number: wbsoCheckData.kvkNumber,
      company_name: wbsoCheckData.companyName,
      company_address: wbsoCheckData.companyAddress,
      sbi_description: wbsoCheckData.sbiDescription,
      technical_problems: wbsoCheckData.technicalProblems,
      project_duration: wbsoCheckData.projectDuration,
      technical_staff_count: wbsoCheckData.technicalStaffCount,
      calculated_subsidy: wbsoCheckData.calculatedSubsidy,
      subsidy_rate: wbsoCheckData.subsidyRate,
      is_starter: wbsoCheckData.isStarter
    }
  });
};

// Event tracking utilities
export const trackPageView = (leadId: string, page: string) => {
  leadApi.trackInteraction(leadId, 'page_visit', { page });
};

export const trackEmailClick = (leadId: string, emailType: string, linkType: string) => {
  leadApi.trackInteraction(leadId, 'email_click', { 
    email_type: emailType,
    link_type: linkType 
  });
};

export const trackFormSubmission = (leadId: string, formType: string, formData: any) => {
  leadApi.trackInteraction(leadId, 'form_submit', { 
    form_type: formType,
    form_data: formData 
  });
};

// Conversion tracking for different sources
export const ConversionSources = {
  WBSO_CHECK: 'wbso_check',
  NEWSLETTER: 'newsletter',
  BLOG_POST: 'blog_post',
  SOCIAL_MEDIA: 'social_media',
  GOOGLE_ADS: 'google_ads',
  DIRECT: 'direct',
  REFERRAL: 'referral'
} as const;

export type ConversionSource = typeof ConversionSources[keyof typeof ConversionSources]; 