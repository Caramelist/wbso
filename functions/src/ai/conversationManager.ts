import Anthropic from '@anthropic-ai/sdk';
import { WBSOKnowledgeBase } from './knowledgeBase';
import { SessionManager, ConversationSession } from './sessionManager';
import { TokenCounter } from './tokenCounter';
import { logger } from 'firebase-functions';

// Define ChatResponse interface here to avoid circular dependency
export interface ChatResponse {
  message: string;
  sessionId: string;
  phase: 'discovery' | 'clarification' | 'generation' | 'complete';
  completeness: number;
  readyForGeneration: boolean;
  extractedInfo?: any;
}

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

      // Get updated session with the new user message included
      const updatedSessionWithUserMessage = await this.sessionManager.getSession(sessionId);
      if (!updatedSessionWithUserMessage) {
        throw new Error('Failed to retrieve session after adding user message');
      }

      // Build conversation context with complete history including current user message
      const conversationHistory = this.buildConversationHistory(updatedSessionWithUserMessage);
      const systemPrompt = this.buildContextualSystemPrompt(updatedSessionWithUserMessage);

      logger.info('Sending conversation to Claude', {
        sessionId,
        messageCount: conversationHistory.length,
        lastUserMessage: userMessage.substring(0, 100) + '...',
        systemPromptLength: systemPrompt.length
      });

      // Get response from Claude
      const response = await this.claude.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        system: systemPrompt,
        messages: conversationHistory
      });

      // Extract text from response (handle different content types)
      const assistantResponse = this.extractTextFromResponse(response);

      // Use ACTUAL token usage from Anthropic API response instead of approximation
      const actualInputTokens = response.usage.input_tokens;
      const actualOutputTokens = response.usage.output_tokens;
      const messageCost = this.tokenCounter.calculateCost(actualInputTokens, actualOutputTokens, 
        process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022');

      logger.info('Actual token usage', {
        sessionId,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        totalTokens: actualInputTokens + actualOutputTokens,
        cost: messageCost
      });

      // Add assistant response to session
      await this.sessionManager.addMessage(sessionId, 'assistant', assistantResponse);

      // Extract information from the conversation using updated session
      const extractedInfo = await this.extractInformation(sessionId, userMessage, assistantResponse, updatedSessionWithUserMessage);

      // Get updated session after extraction (which includes extraction costs)
      const updatedSessionAfterExtraction = await this.sessionManager.getSession(sessionId);
      if (!updatedSessionAfterExtraction) {
        throw new Error('Failed to retrieve session after extraction');
      }

      // Update session with main conversation costs only (extraction costs already added)
      await this.sessionManager.updateSession(sessionId, {
        tokenCount: updatedSessionAfterExtraction.tokenCount + actualInputTokens + actualOutputTokens,
        cost: updatedSessionAfterExtraction.cost + messageCost
      });

      if (extractedInfo && Object.keys(extractedInfo).length > 0) {
        await this.sessionManager.updateExtractedInfo(sessionId, extractedInfo);
      }

      // Determine next phase and readiness
      const updatedSession = await this.sessionManager.getSession(sessionId);
      if (!updatedSession) {
        throw new Error('Failed to retrieve updated session');
      }

      const completeness = this.calculateCompleteness(updatedSession);
      const nextPhase = this.determineNextPhase(completeness, updatedSession.phase);

      await this.sessionManager.updateSession(sessionId, {
        phase: nextPhase,
        completeness: completeness
      });

      return {
        message: assistantResponse,
        sessionId,
        phase: nextPhase,
        completeness,
        readyForGeneration: completeness >= 80,
        extractedInfo
      };

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to process message', { sessionId, error: err.message });
      throw new Error(`Failed to process message: ${err.message}`);
    }
  }

  async generateApplication(session: ConversationSession): Promise<any> {
    try {
      logger.info('Generating WBSO application', { sessionId: session.id });

      const generationPrompt = this.buildApplicationGenerationPrompt(session);
      
      const response = await this.claude.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
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
      const generatedContent = this.extractTextFromResponse(response);
      const application = this.parseGeneratedApplication(generatedContent, session);

      // Use ACTUAL token usage from Anthropic API response instead of approximation
      const actualInputTokens = response.usage.input_tokens;
      const actualOutputTokens = response.usage.output_tokens;
      const generationCost = this.tokenCounter.calculateCost(actualInputTokens, actualOutputTokens, 
        process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022');

      logger.info('Application generation - actual token usage', {
        sessionId: session.id,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        totalTokens: actualInputTokens + actualOutputTokens,
        cost: generationCost
      });

      // Update session
      await this.sessionManager.updateSession(session.id, {
        phase: 'complete',
        tokenCount: session.tokenCount + actualInputTokens + actualOutputTokens,
        cost: session.cost + generationCost,
        completeness: 100
      });

      logger.info('WBSO application generated successfully', { 
        sessionId: session.id,
        generationCost,
        outputLength: generatedContent.length
      });

      return application;

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to generate WBSO application', { sessionId: session.id, error: err.message });
      throw new Error(`Failed to generate application: ${err.message}`);
    }
  }

  /**
   * Extract text content from Anthropic API response
   */
  private extractTextFromResponse(response: Anthropic.Messages.Message): string {
    // Handle different content types from Anthropic API
    if (response.content && response.content.length > 0) {
      const firstContent = response.content[0];
      if (firstContent.type === 'text') {
        return firstContent.text;
      }
    }
    throw new Error('No text content found in response');
  }

  /**
   * Build conversation history with proper typing
   */
  private buildConversationHistory(session: ConversationSession): Anthropic.Messages.MessageParam[] {
    const history = session.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    
    logger.info('Built conversation history', {
      sessionId: session.id,
      messageCount: history.length,
      lastMessages: history.slice(-3).map(msg => ({
        role: msg.role,
        preview: msg.content.substring(0, 100) + '...'
      }))
    });
    
    return history;
  }

  private buildContextualSystemPrompt(session: ConversationSession): string {
    // Get user's language preference, default to Dutch
    const userLanguage = session.userContext?.language || 'nl';
    
    const basePrompt = this.knowledgeBase.getSystemPrompt(userLanguage);
    // Handle phase prompt - only use valid phases, map 'complete' to 'generation'
    const validPhase = session.phase === 'complete' ? 'generation' : session.phase;
    const phasePrompt = this.knowledgeBase.getPhasePrompt(validPhase as 'discovery' | 'clarification' | 'generation');
    
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
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.1,
        system: "You are an information extraction expert. Extract structured data from conversations and return valid JSON.",
        messages: [{
          role: 'user',
          content: extractionPrompt
        }]
      });

      const extracted = this.parseExtractedInfo(this.extractTextFromResponse(extractionResponse));
      
      // Use actual token usage from Anthropic API response for extraction
      const extractionInputTokens = extractionResponse.usage.input_tokens;
      const extractionOutputTokens = extractionResponse.usage.output_tokens;
      const extractionCost = this.tokenCounter.calculateCost(extractionInputTokens, extractionOutputTokens, 
        process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022');

      logger.info('Information extraction - actual token usage', {
        sessionId,
        inputTokens: extractionInputTokens,
        outputTokens: extractionOutputTokens,
        totalTokens: extractionInputTokens + extractionOutputTokens,
        cost: extractionCost,
        extractedFields: Object.keys(extracted)
      });

      // Add extraction costs to session
      await this.sessionManager.updateSession(sessionId, {
        tokenCount: session.tokenCount + extractionInputTokens + extractionOutputTokens,
        cost: session.cost + extractionCost
      });

      return extracted;

    } catch (error) {
      const err = error as Error;
      logger.warn('Failed to extract information from conversation', { sessionId, error: err.message });
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

  private determineNextPhase(completeness: number, currentPhase: ConversationSession['phase']): ConversationSession['phase'] {
    if (completeness >= 80) {
      return 'generation';
    } else if (completeness >= 50) {
      return 'clarification';
    } else {
      return 'discovery';
    }
  }

  private calculateCompleteness(session: ConversationSession): number {
    const extractedInfo = session.extractedInfo || {};
    const totalFields = 10; // Example total fields, adjust as needed
    let completeness = 0;

    if (extractedInfo.projectTitle) completeness++;
    if (extractedInfo.projectType) completeness++;
    if (extractedInfo.problemDescription) completeness++;
    if (extractedInfo.proposedSolution) completeness++;
    if (extractedInfo.technicalChallenges && extractedInfo.technicalChallenges.length > 0) completeness++;
    if (extractedInfo.innovationAspects) completeness++;
    if (extractedInfo.timeline) completeness++;
    if (extractedInfo.teamSize) completeness++;
    if (extractedInfo.companyInfo) completeness++;
    if (extractedInfo.budgetEstimate) completeness++;

    return (completeness / totalFields) * 100;
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
      const err = error as Error;
      logger.warn('Failed to parse generated application, using fallback', { 
        sessionId: session.id, 
        error: err.message 
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