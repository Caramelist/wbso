export class WBSOKnowledgeBase {
  private coreRules: string;
  private sectorGuidelines: Record<string, string>;
  private successPatterns: Record<string, string>;
  private rejectionPatterns: string[];

  constructor() {
    this.initializeKnowledge();
  }

  private initializeKnowledge(): void {
    this.coreRules = `
WBSO Core Eligibility Rules 2025:

1. TECHNICAL NOVELTY REQUIREMENT:
   - Project must develop technically new knowledge or solutions
   - Cannot be solved using existing, generally known techniques
   - Must involve systematic research into technical uncertainties
   - Innovation must go beyond routine engineering or software development

2. SELF-EXECUTION REQUIREMENT:
   - Research and development must be carried out by the applicant company
   - Cannot be outsourced to external parties as the primary work
   - Company must have technical staff to execute the project

3. RISK AND UNCERTAINTY:
   - Technical outcome must be uncertain at project start
   - Real risk of technical failure must exist
   - Not just implementation of known solutions

4. DUTCH R&D ACTIVITIES:
   - Work must be performed in the Netherlands
   - By employees on Dutch payroll
   - For Dutch tax resident companies

5. PROHIBITED ACTIVITIES:
   - Market research, customer surveys
   - Routine maintenance or debugging
   - Copying or reverse engineering existing solutions
   - Standard software implementation without technical novelty
   - Commercial activities, sales, marketing

6. DOCUMENTATION REQUIREMENTS:
   - Clear technical problem definition
   - Explanation why conventional methods don't work
   - Systematic approach to solving technical uncertainties
   - Realistic time and resource estimates
    `;

    this.sectorGuidelines = {
      'Software ontwikkeling': `
      Software Development WBSO Guidelines:
      - Algorithm innovation (AI/ML) is highly eligible
      - New data processing methods qualify
      - User interface improvements generally don't qualify
      - Database optimization requires technical novelty
      - Integration challenges can qualify if technically novel
      - Performance optimization must involve new techniques
      `,
      'Manufacturing': `
      Manufacturing WBSO Guidelines:
      - Process optimization with technical innovation
      - New production methods or techniques
      - Material science improvements
      - Automation beyond standard implementation
      - Quality control innovations
      `,
      'Healthcare': `
      Healthcare WBSO Guidelines:
      - Medical device innovations highly eligible
      - Digital health solutions with technical novelty
      - Data analysis for medical insights
      - Clinical trial software (technical aspects)
      - Regulatory compliance alone doesn't qualify
      `
    };

    this.successPatterns = {
      'ai_machine_learning': 'AI/ML projects with novel algorithms, custom neural networks, or innovative data processing approaches have high success rates',
      'automation': 'Automation projects succeed when they involve technical challenges beyond standard system integration',
      'data_processing': 'Big data projects qualify when developing new processing methods or analytical techniques',
      'integration': 'System integration qualifies when solving complex technical compatibility issues'
    };

    this.rejectionPatterns = [
      'Projects that only implement existing commercial solutions',
      'Standard web development without technical innovation',
      'Database administration and routine maintenance',
      'User experience improvements without technical challenges',
      'Market research or business process optimization',
      'Projects with no technical risk or uncertainty'
    ];
  }

  getSystemPrompt(): string {
    return `You are a specialized WBSO (Dutch R&D Tax Credit) application expert. Your role is to help Dutch companies create successful WBSO applications through natural, professional conversation.

MISSION:
Guide users through a conversational process to gather all information needed for a complete, professional WBSO application that meets RVO requirements and maximizes their R&D tax benefits.

WBSO EXPERTISE:
${this.coreRules}

CONVERSATION STRATEGY:
1. START WITH PROJECT UNDERSTANDING
   - Ask them to describe what they're building/researching
   - Understand their technical challenges and goals
   - Identify the innovation beyond existing solutions

2. PROBE FOR GENUINE TECHNICAL CHALLENGES
   - Focus on technical problems, not business problems
   - Identify specific uncertainties and risks
   - Ensure challenges can't be solved with existing methods

3. ASSESS INNOVATION AND NOVELTY
   - Understand what makes their approach new
   - Compare to existing solutions in their field  
   - Identify the technical knowledge they'll create

4. GATHER REALISTIC PROJECT DETAILS
   - Timeline that reflects actual R&D work
   - Team composition and expertise
   - Hour estimates that won't trigger RVO concerns

5. IDENTIFY POTENTIAL ISSUES EARLY
   - Flag activities that don't qualify for WBSO
   - Suggest improvements to increase eligibility
   - Ensure compliance with WBSO requirements

CONVERSATION GUIDELINES:
- Ask ONE focused question at a time
- Build on their previous answers naturally
- Use encouraging but realistic tone about WBSO prospects
- Maintain consultant-level expertise and professionalism
- Be specific in your questions - avoid generic inquiries
- Guide them toward WBSO-compliant project descriptions

SUCCESS FACTORS:
- Technical challenges must be specific and measurable
- Innovation must clearly go beyond existing solutions  
- Risks/uncertainties must be genuine (failure must be possible)
- Timeline and hours must be realistic and defensible
- Language must be professional and ready for RVO review

Begin by asking them to describe their project and the main technical challenges they expect to face.`;
  }

  getRelevantContext(projectType?: string, sector?: string, phase?: string): string {
    let context = this.coreRules;
    
    if (sector && this.sectorGuidelines[sector]) {
      context += `\n\nSECTOR-SPECIFIC GUIDELINES:\n${this.sectorGuidelines[sector]}`;
    }
    
    if (projectType && this.successPatterns[projectType]) {
      context += `\n\nSUCCESS PATTERNS:\n${this.successPatterns[projectType]}`;
    }
    
    if (phase === 'validation') {
      context += `\n\nCOMMON REJECTION PATTERNS TO AVOID:\n${this.rejectionPatterns.join('\n- ')}`;
    }
    
    return context;
  }

  getSectorGuidelines(sector: string): string {
    return this.sectorGuidelines[sector] || 'No specific guidelines available for this sector.';
  }

  getSuccessPatterns(): Record<string, string> {
    return this.successPatterns;
  }

  getRejectionPatterns(): string[] {
    return this.rejectionPatterns;
  }

  // Dynamic prompt generation based on conversation phase
  getPhasePrompt(phase: 'discovery' | 'clarification' | 'validation' | 'generation'): string {
    switch (phase) {
      case 'discovery':
        return `Focus on understanding their project goals and technical challenges. Ask open-ended questions about what they're building and why existing solutions don't work.`;
      
      case 'clarification':
        return `Dig deeper into specific technical details. Probe for genuine innovation, technical risks, and measurable challenges that qualify for WBSO.`;
      
      case 'validation':
        return `Validate that their project meets WBSO requirements. Identify any potential issues and suggest improvements to increase success chances.`;
      
      case 'generation':
        return `Prepare to generate the WBSO application. Ensure all required information is collected and properly formatted for RVO submission.`;
      
      default:
        return this.getSystemPrompt();
    }
  }
} 