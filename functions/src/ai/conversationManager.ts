import Anthropic from '@anthropic-ai/sdk';
import { WBSOKnowledgeBase } from './knowledgeBase';
import { SessionManager, ConversationSession } from './sessionManager';
import { TokenCounter } from './tokenCounter';
import { ChatResponse } from './wbsoAgent';
import { logger } from 'firebase-functions';

export class ConversationManager {
  private claude: Anthropic;
  private knowledgeBase: WBSOKnowledgeBase;
  private sessionManager: SessionManager;
  private tokenCounter: TokenCounter;

  constructor(claude: Anthropic) {
    this.claude = claude;
    this.knowledgeBase = new WBSOKnowledgeBase();
    this.sessionManager = new SessionManager();
    this.tokenCounter = new TokenCounter();
  }

  async processMessage(
    sessionId: string, 
    userMessage: string, 
    session: ConversationSession
  ): Promise<ChatResponse> {
    try {
      // Add user message to session
      await this.sessionManager.addMessage(sessionId, 'user', userMessage);

      // Build conversation context
      const conversationHistory = this.buildConversationHistory(session);
      const systemPrompt = this.buildContextualSystemPrompt(session);

      // Get response from Claude
      const response = await this.claude.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: conversationHistory
      });

      const assistantResponse = response.content[0].text;

      // Calculate costs
      const inputTokens = this.tokenCounter.count(systemPrompt + userMessage);
      const outputTokens = this.tokenCounter.count(assistantResponse);
      const messageCost = this.tokenCounter.calculateCost(inputTokens, outputTokens, 
        process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022");

      // Add assistant response to session
      await this.sessionManager.addMessage(sessionId, 'assistant', assistantResponse);

      // Extract information from the conversation
      const extractedInfo = await this.extractInformation(sessionId, userMessage, assistantResponse, session);

      // Update session with costs and extracted info
      await this.sessionManager.updateSession(sessionId, {
        tokenCount: session.tokenCount + inputTokens + outputTokens,
        cost: session.cost + messageCost
      });

      if (extractedInfo && Object.keys(extractedInfo).length > 0) {
        await this.sessionManager.updateExtractedInfo(sessionId, extractedInfo);
      }

      // Determine next phase and readiness
      const updatedSession = await this.sessionManager.getSession(sessionId);
      const nextPhase = this.determineNextPhase(updatedSession);
      const readyForGeneration = updatedSession.completeness >= 80;

      if (nextPhase !== session.phase) {
        await this.sessionManager.updatePhase(sessionId, nextPhase);
      }

      logger.info('Message processed in conversation', {
        sessionId,
        phase: nextPhase,
        completeness: updatedSession.completeness,
        cost: messageCost
      });

      return {
        message: assistantResponse,
        sessionId,
        phase: nextPhase,
        completeness: updatedSession.completeness,
        cost: session.cost + messageCost,
        readyForGeneration,
        extractedInfo: updatedSession.extractedInfo
      };

    } catch (error) {
      logger.error('Failed to process conversation message', { sessionId, error: error.message });
      throw new Error(`Conversation processing failed: ${error.message}`);
    }
  }

  async generateApplication(session: ConversationSession): Promise<any> {
    try {
      logger.info('Generating WBSO application', { sessionId: session.id });

      const generationPrompt = this.buildApplicationGenerationPrompt(session);
      
      const response = await this.claude.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.2, // Lower temperature for more consistent output
        system: `You are a WBSO application writer. Generate a complete, professional WBSO application ALWAYS IN DUTCH based on the conversation context. 

CRITICAL: Regardless of the conversation language, the final WBSO application document must be written in Dutch (Nederlandse) as required by the RVO (Rijksdienst voor Ondernemend Nederland).

The conversation may have been in English or Dutch, but transform all content into professional Dutch for the official application document.

Return the response as a JSON object with the exact structure expected by the system.`,
        messages: [{
          role: 'user',
          content: generationPrompt
        }]
      });

      // Parse the generated application
      const generatedContent = response.content[0].text;
      const application = this.parseGeneratedApplication(generatedContent, session);

      // Calculate costs
      const inputTokens = this.tokenCounter.count(generationPrompt);
      const outputTokens = this.tokenCounter.count(generatedContent);
      const generationCost = this.tokenCounter.calculateCost(inputTokens, outputTokens, 
        process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022");

      // Update session
      await this.sessionManager.updateSession(session.id, {
        phase: 'complete',
        tokenCount: session.tokenCount + inputTokens + outputTokens,
        cost: session.cost + generationCost,
        completeness: 100
      });

      logger.info('WBSO application generated successfully', {
        sessionId: session.id,
        generationCost,
        totalCost: session.cost + generationCost
      });

      return application;

    } catch (error) {
      logger.error('Failed to generate WBSO application', { sessionId: session.id, error: error.message });
      throw new Error(`Application generation failed: ${error.message}`);
    }
  }

  private buildConversationHistory(session: ConversationSession): Array<{role: string; content: string}> {
    // Only include user and assistant messages, exclude system messages
    return session.messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }

  private buildContextualSystemPrompt(session: ConversationSession): string {
    // Get user's language preference, default to Dutch
    const userLanguage = session.userContext?.language || 'nl';
    
    const basePrompt = this.knowledgeBase.getSystemPrompt(userLanguage);
    const phasePrompt = this.knowledgeBase.getPhasePrompt(session.phase);
    
    let contextPrompt = basePrompt + '\n\n' + phasePrompt;

    // Add user context if available
    if (session.userContext?.leadData) {
      const leadData = session.userContext.leadData;
      contextPrompt += `\n\nUSER CONTEXT (from WBSO Check):
- Company: ${leadData.company_name}
- Sector: ${leadData.sbi_description}
- Team size: ${leadData.technical_staff_count}
- Technical problems identified: ${leadData.technical_problems?.join(', ')}
- Calculated subsidy potential: €${leadData.calculated_subsidy}

Use this context to provide more targeted questions and advice.`;
    }

    // Add extracted information context
    if (session.extractedInfo && Object.keys(session.extractedInfo).length > 0) {
      contextPrompt += `\n\nINFORMATION ALREADY COLLECTED:
${JSON.stringify(session.extractedInfo, null, 2)}

Build on this information rather than asking for details already provided.`;
    }

    return contextPrompt;
  }

  private async extractInformation(
    sessionId: string,
    userMessage: string,
    assistantResponse: string,
    session: ConversationSession
  ): Promise<any> {
    try {
      // Use Claude to extract structured information
      const extractionPrompt = `Based on this conversation exchange, extract any new structured information about the WBSO project. Return as JSON with only the fields that have clear, specific information:

User message: "${userMessage}"

Previous extracted info: ${JSON.stringify(session.extractedInfo)}

Extract fields like:
- projectTitle: string
- projectType: "development" | "research"
- problemDescription: string
- proposedSolution: string
- technicalChallenges: string[]
- innovationAspects: string
- timeline: {startDate: string, duration: string}
- teamSize: string
- companyInfo: {name: string, sector: string}
- budgetEstimate: string

Return only new or updated information as JSON. If nothing specific was mentioned, return {}.`;

      const extractionResponse = await this.claude.messages.create({
        model: process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.1,
        system: "You are an information extraction expert. Extract structured data from conversations and return valid JSON.",
        messages: [{
          role: 'user',
          content: extractionPrompt
        }]
      });

      const extracted = this.parseExtractedInfo(extractionResponse.content[0].text);
      
      logger.info('Information extracted from conversation', {
        sessionId,
        extractedFields: Object.keys(extracted)
      });

      return extracted;

    } catch (error) {
      logger.warn('Failed to extract information from conversation', { sessionId, error: error.message });
      return {};
    }
  }

  private parseExtractedInfo(response: string): any {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      logger.warn('Failed to parse extracted information JSON', { response });
      return {};
    }
  }

  private determineNextPhase(session: ConversationSession): ConversationSession['phase'] {
    if (session.completeness >= 80) {
      return 'generation';
    } else if (session.completeness >= 50) {
      return 'clarification';
    } else {
      return 'discovery';
    }
  }

  private buildApplicationGenerationPrompt(session: ConversationSession): string {
    const userLanguage = session.userContext?.language || 'nl';
    const languageNote = userLanguage === 'en' 
      ? 'IMPORTANT: The conversation was in English, but translate all content to professional Dutch for the official WBSO application as required by RVO.'
      : 'BELANGRIJK: Zorg ervoor dat alle content in professioneel Nederlands wordt geschreven voor de officiële WBSO-aanvraag zoals vereist door RVO.';

    return `Generate a complete WBSO application based on this conversation:

${languageNote}

EXTRACTED INFORMATION:
${JSON.stringify(session.extractedInfo, null, 2)}

CONVERSATION HISTORY:
${session.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}

Generate a complete WBSO application with the following structure as JSON:
{
  "projectDescription": "Professional project description in Dutch",
  "technicalChallenge": "Detailed technical challenge explanation in Dutch",
  "innovativeAspects": "Innovation and novelty description in Dutch",
  "expectedResults": "Expected outcomes and results in Dutch",
  "activities": [
    {
      "name": "Activity name in Dutch",
      "description": "Detailed description in Dutch", 
      "duration": "Duration description in Dutch",
      "hours": number
    }
  ],
  "costBreakdown": {
    "totalHours": number,
    "laborCosts": number,
    "wbsoDeduction": number,
    "netCosts": number
  }
}

Ensure the application is in professional Dutch, WBSO-compliant, and ready for RVO submission.`;
  }

  private parseGeneratedApplication(content: string, session: ConversationSession): any {
    try {
      // Try to parse JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      // Fallback: create application from extracted info
      return this.createFallbackApplication(session);

    } catch (error) {
      logger.warn('Failed to parse generated application, using fallback', { 
        sessionId: session.id, 
        error: error.message 
      });
      return this.createFallbackApplication(session);
    }
  }

  private createFallbackApplication(session: ConversationSession): any {
    const info = session.extractedInfo;
    
    // Create a basic application structure from extracted info
    return {
      projectDescription: info.problemDescription || 'Project description not fully captured',
      technicalChallenge: info.technicalChallenges?.join(' ') || 'Technical challenges not specified',
      innovativeAspects: info.innovationAspects || 'Innovation aspects not specified',
      expectedResults: 'Expected results based on project goals',
      activities: [
        {
          name: 'Research and Development',
          description: info.proposedSolution || 'R&D activities',
          duration: info.timeline?.duration || '12 months',
          hours: 1920
        }
      ],
      costBreakdown: {
        totalHours: 1920,
        laborCosts: 124800,
        wbsoDeduction: 44928,
        netCosts: 79872
      }
    };
  }
} 