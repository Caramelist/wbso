// Lead Conversion Utilities - Bridge Marketing → Application
import CryptoJS from 'crypto-js';

export interface LeadData {
  // Lead identification
  id: string;
  email: string;
  created_at: string;
  
  // Company data from KVK
  kvk_number?: string;
  company_name?: string;
  company_address?: string;
  company_city?: string;
  sbi_code?: string;
  sbi_description?: string;
  estimated_employees?: number;
  
  // Project assessment
  annual_revenue_range?: string;
  development_types?: string[];
  technical_problems?: string[];
  project_duration?: string;
  
  // Team data
  technical_staff_count?: string;
  hours_per_week?: number;
  previous_wbso?: boolean;
  
  // Calculation results
  calculated_subsidy?: number;
  subsidy_rate?: number;
  monthly_cashflow?: number;
  total_hours?: number;
  is_starter?: boolean;
  
  // Consent tracking
  consent_marketing?: boolean;
  consent_data_sharing?: boolean;
}

export interface ApplicationInputs {
  projectTitle: string;
  projectType: 'development' | 'research' | '';
  startDate: string;
  endDate: string;
  companyName: string;
  companySector: string;
  teamSize: string;
  problemDescription: string;
  proposedSolution: string;
  whyInnovative: string;
  expectedDuration: string;
  estimatedBudget: string;
}

export class LeadConversionManager {
  private readonly encryptionKey: string;
  
  constructor() {
    this.encryptionKey = process.env.NEXT_PUBLIC_LEAD_TOKEN_KEY || 'fallback-key-dev-only';
  }
  
  /**
   * Encrypt lead data for secure URL transmission
   */
  encryptLeadToken(leadData: Partial<LeadData>): string {
    const payload = {
      ...leadData,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hour expiry
      iat: Date.now()
    };
    
    return CryptoJS.AES.encrypt(JSON.stringify(payload), this.encryptionKey).toString();
  }
  
  /**
   * Decrypt lead token and validate expiry
   */
  decryptLeadToken(token: string): LeadData | null {
    try {
      const decrypted = CryptoJS.AES.decrypt(token, this.encryptionKey);
      const payload = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      
      // Check expiry
      if (payload.exp < Date.now()) {
        throw new Error('Token expired');
      }
      
      return payload as LeadData;
    } catch (error) {
      console.error('Failed to decrypt lead token:', error);
      return null;
    }
  }
  
  /**
   * Map lead magnet data to WBSO application form inputs
   */
  mapLeadToApplicationInputs(leadData: LeadData): ApplicationInputs {
    return {
      // Basic project info
      projectTitle: this.generateProjectTitle(leadData),
      projectType: this.mapProjectType(leadData.development_types),
      startDate: this.getNextQuarterStart(),
      endDate: this.calculateProjectEndDate(leadData.project_duration),
      
      // Company context
      companyName: leadData.company_name || '',
      companySector: leadData.sbi_description || 'Software ontwikkeling',
      teamSize: this.mapTeamSize(leadData.technical_staff_count),
      
      // Project details
      problemDescription: this.mapTechnicalProblems(leadData.technical_problems),
      proposedSolution: this.generateProposedSolution(leadData.technical_problems, leadData.development_types),
      whyInnovative: this.generateInnovationReason(leadData.technical_problems),
      expectedDuration: this.mapProjectDuration(leadData.project_duration),
      estimatedBudget: this.calculateEstimatedBudget(leadData.total_hours, leadData.calculated_subsidy)
    };
  }
  
  /**
   * Generate professional project title from lead data
   */
  private generateProjectTitle(leadData: LeadData): string {
    const company = leadData.company_name ? leadData.company_name.replace(' B.V.', '').replace(' BV', '') : 'Innovatie';
    const problemType = leadData.technical_problems?.[0] || 'ontwikkeling';
    
    const titleTemplates = {
      'ai': `${company} AI-gedreven automatisering`,
      'integration': `${company} systeem integratie platform`,
      'automation': `${company} proces automatisering`,
      'performance': `${company} prestatie optimalisatie`,
      'security': `${company} security enhancement`,
      'scalability': `${company} schaalbaarheids oplossing`
    };
    
    return titleTemplates[problemType as keyof typeof titleTemplates] || `${company} technische innovatie`;
  }
  
  /**
   * Map development types to project type
   */
  private mapProjectType(developmentTypes?: string[]): 'development' | 'research' | '' {
    if (!developmentTypes || developmentTypes.length === 0) return 'development';
    
    // Research-oriented types
    const researchTypes = ['research', 'analysis', 'feasibility'];
    if (developmentTypes.some(type => researchTypes.includes(type))) {
      return 'research';
    }
    
    return 'development';
  }
  
  /**
   * Map technical problems to problem description
   */
  private mapTechnicalProblems(technicalProblems?: string[]): string {
    if (!technicalProblems || technicalProblems.length === 0) {
      return 'Optimalisatie van bestaande processen en systemen voor betere prestaties en efficiency';
    }
    
    const problemDescriptions = {
      'ai': 'Implementatie van AI-algoritmen voor automatische besluitvorming en voorspellingen',
      'integration': 'Integratie van verschillende systemen en platforms voor naadloze datauitwisseling',
      'automation': 'Automatisering van handmatige processen en workflows',
      'performance': 'Prestatie-optimalisatie van bestaande systemen onder hoge belasting',
      'security': 'Verbetering van security en privacy-maatregelen',
      'scalability': 'Schaalbaarheidsoplossingen voor groeiende gebruikersbase'
    };
    
    const descriptions = technicalProblems
      .map(problem => problemDescriptions[problem as keyof typeof problemDescriptions])
      .filter(Boolean);
    
    return descriptions.length > 0 
      ? descriptions.join(', ')
      : 'Oplossen van complexe technische uitdagingen die conventionele methoden overstijgen';
  }
  
  /**
   * Generate proposed solution based on problems and development types
   */
  private generateProposedSolution(technicalProblems?: string[], developmentTypes?: string[]): string {
    const problemType = technicalProblems?.[0] || 'performance';
    const devType = developmentTypes?.[0] || 'software';
    
    const solutions = {
      'ai_software': 'Machine learning algoritmes en neural networks voor intelligente automatisering',
      'integration_software': 'API-first architectuur met microservices voor systeem integratie',
      'automation_software': 'Event-driven architectuur met smart workflows en rule engines',
      'performance_software': 'High-performance computing met geoptimaliseerde data structures',
      'security_software': 'Zero-trust security model met end-to-end encryptie',
      'scalability_software': 'Cloud-native architectuur met auto-scaling capabilities'
    };
    
    const solutionKey = `${problemType}_${devType}` as keyof typeof solutions;
    return solutions[solutionKey] || 'Innovatieve technische oplossing die bestaande methoden overstijgt';
  }
  
  /**
   * Generate innovation reason
   */
  private generateInnovationReason(technicalProblems?: string[]): string {
    return 'Bestaande commerciële oplossingen kunnen deze specifieke technische uitdagingen niet adequaat oplossen, waardoor eigen R&D noodzakelijk is';
  }
  
  /**
   * Map team size from lead data
   */
  private mapTeamSize(technicalStaffCount?: string): string {
    const mapping = {
      '0': '1 developer (ZZP)',
      '1-2': '2 developers',
      '3-5': '4 developers, 1 technical lead',
      '6-10': '6 developers, 2 specialisten',
      '10+': '10+ technical professionals'
    };
    
    return mapping[technicalStaffCount as keyof typeof mapping] || '3 developers, 1 data scientist';
  }
  
  /**
   * Map project duration
   */
  private mapProjectDuration(projectDuration?: string): string {
    const mapping = {
      '3-6': '6',
      '6-12': '12', 
      '12-24': '18',
      '24+': '24'
    };
    
    return mapping[projectDuration as keyof typeof mapping] || '12';
  }
  
  /**
   * Calculate estimated budget based on hours and subsidy
   */
  private calculateEstimatedBudget(totalHours?: number, calculatedSubsidy?: number): string {
    if (calculatedSubsidy) {
      // Reverse calculate from subsidy (assuming 36% rate)
      const estimatedCosts = Math.round(calculatedSubsidy / 0.36);
      return estimatedCosts.toString();
    }
    
    if (totalHours) {
      // Estimate based on €65/hour average
      const estimatedCosts = totalHours * 65;
      return estimatedCosts.toString();
    }
    
    return '150000'; // Default estimate
  }
  
  /**
   * Get next WBSO quarter start date
   */
  private getNextQuarterStart(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // WBSO quarters: Jan 1, Apr 1, Jul 1, Oct 1
    let quarterStart: Date;
    
    if (month < 3) {
      quarterStart = new Date(year, 3, 1); // Q2
    } else if (month < 6) {
      quarterStart = new Date(year, 6, 1); // Q3
    } else if (month < 9) {
      quarterStart = new Date(year, 9, 1); // Q4
    } else {
      quarterStart = new Date(year + 1, 0, 1); // Q1 next year
    }
    
    return quarterStart.toISOString().split('T')[0];
  }
  
  /**
   * Calculate project end date based on duration
   */
  private calculateProjectEndDate(projectDuration?: string): string {
    const startDate = new Date(this.getNextQuarterStart());
    const durationMonths = parseInt(this.mapProjectDuration(projectDuration));
    
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + durationMonths);
    
    return endDate.toISOString().split('T')[0];
  }
  
  /**
   * Generate conversion URL with encrypted lead token
   */
  generateConversionUrl(leadData: LeadData, baseUrl: string = 'https://app.wbsosimpel.nl'): string {
    const token = this.encryptLeadToken(leadData);
    return `${baseUrl}/applications/new?lead_token=${encodeURIComponent(token)}&source=wbso_check`;
  }
  
  /**
   * Calculate conversion score for lead prioritization
   */
  calculateConversionScore(leadData: LeadData): number {
    let score = 0;
    
    // Company size scoring
    const sizeScores = { '0': 10, '1-2': 20, '3-5': 30, '6-10': 40, '10+': 50 };
    score += sizeScores[leadData.technical_staff_count as keyof typeof sizeScores] || 0;
    
    // Subsidy amount scoring (higher subsidy = more motivated)
    if (leadData.calculated_subsidy) {
      if (leadData.calculated_subsidy > 100000) score += 30;
      else if (leadData.calculated_subsidy > 50000) score += 20;
      else if (leadData.calculated_subsidy > 25000) score += 10;
    }
    
    // Technical complexity scoring
    const complexProblems = ['ai', 'integration', 'automation'];
    const hasComplexProblems = leadData.technical_problems?.some(p => complexProblems.includes(p));
    if (hasComplexProblems) score += 15;
    
    // Starter bonus (higher percentage = more attractive)
    if (leadData.is_starter) score += 10;
    
    // Consent scoring (data sharing consent = easier conversion)
    if (leadData.consent_data_sharing) score += 15;
    
    return Math.min(score, 100);
  }
}

// Export singleton instance
export const leadConversion = new LeadConversionManager();

// Utility functions for React components
export const useLeadConversion = () => {
  return {
    mapLeadToInputs: leadConversion.mapLeadToApplicationInputs.bind(leadConversion),
    decryptToken: leadConversion.decryptLeadToken.bind(leadConversion),
    generateUrl: leadConversion.generateConversionUrl.bind(leadConversion),
    calculateScore: leadConversion.calculateConversionScore.bind(leadConversion)
  };
}; 