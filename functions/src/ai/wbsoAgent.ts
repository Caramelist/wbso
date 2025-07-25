import Anthropic from '@anthropic-ai/sdk';
import { WBSOKnowledgeBase } from './knowledgeBase';
import { ConversationManager, ChatResponse } from './conversationManager';
import { SessionManager } from './sessionManager';
import { TokenCounter } from './tokenCounter';
import { logger } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';

// Define the secret for Anthropic API key
const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

export interface WBSOAgentConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  maxExchanges: number;
  costLimits: {
    perSession: number;
    daily: number;
  };
}

interface ApiRetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

export class WBSOAgent {
  private claude: Anthropic;
  private knowledgeBase: WBSOKnowledgeBase;
  private conversationManager: ConversationManager;
  private sessionManager: SessionManager;
  private tokenCounter: TokenCounter;
  private config: WBSOAgentConfig;
  private retryConfig: ApiRetryConfig;

  constructor() {
    // Get API key from Firebase Functions v2 secrets
    const apiKey = anthropicApiKey.value();
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY secret not configured');
    }

    this.claude = new Anthropic({
      apiKey: apiKey,
    });
    
    this.knowledgeBase = new WBSOKnowledgeBase();
    this.conversationManager = new ConversationManager(this.claude);
    this.sessionManager = new SessionManager();
    this.tokenCounter = new TokenCounter();
    
    this.config = {
      model: process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022",
      maxTokens: 4000,
      temperature: 0.3,
      maxExchanges: 25, // Increased from 15 to allow longer conversations
      costLimits: {
        perSession: parseFloat(process.env.MAX_COST_PER_SESSION || '5.00'),
        daily: parseFloat(process.env.DAILY_COST_LIMIT || '50.00')
      }
    };

    // Retry configuration for API resilience
    this.retryConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      retryableErrors: ['overloaded_error', 'rate_limit_error', 'timeout', 'network_error']
    };

    logger.info('WBSO Agent initialized', { 
      model: this.config.model,
      maxCostPerSession: this.config.costLimits.perSession,
      hasApiKey: !!apiKey
    });
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateBackoffDelay(attempt: number): number {
    const delay = this.retryConfig.baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 1000; // Add jitter to prevent thundering herd
    return Math.min(delay + jitter, this.retryConfig.maxDelayMs);
  }

  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    const errorStr = JSON.stringify(error).toLowerCase();
    return this.retryConfig.retryableErrors.some(retryableError => 
      errorStr.includes(retryableError)
    );
  }

  private getUserFriendlyErrorMessage(error: any): string {
    const errorStr = JSON.stringify(error).toLowerCase();
    
    if (errorStr.includes('overloaded')) {
      return 'De AI service is momenteel overbelast door hoge vraag. We proberen automatisch opnieuw...';
    } else if (errorStr.includes('rate_limit')) {
      return 'Tijdelijke limiet bereikt. Even geduld terwijl we opnieuw proberen...';
    } else if (errorStr.includes('timeout')) {
      return 'Verbinding verbroken. We herstellen de verbinding...';
    } else {
      return 'Tijdelijke service onderbreking. We proberen automatisch opnieuw...';
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    sessionId?: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateBackoffDelay(attempt - 1);
          logger.info(`Retrying ${operationName}`, { 
            sessionId, 
            attempt, 
            delayMs: delay 
          });
          await this.sleep(delay);
        }
        
        return await operation();
        
      } catch (error) {
        lastError = error;
        const isRetryable = this.isRetryableError(error);
        
        logger.warn(`${operationName} failed`, {
          sessionId,
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error),
          isRetryable,
          willRetry: isRetryable && attempt < this.retryConfig.maxRetries
        });
        
        // If it's the last attempt or not retryable, break
        if (!isRetryable || attempt >= this.retryConfig.maxRetries) {
          break;
        }
      }
    }
    
    // All retries failed
    const userMessage = this.getUserFriendlyErrorMessage(lastError);
    const technicalMessage = lastError instanceof Error ? lastError.message : String(lastError);
    
    logger.error(`${operationName} failed after all retries`, {
      sessionId,
      maxRetries: this.retryConfig.maxRetries,
      finalError: technicalMessage
    });
    
    throw new Error(`${userMessage} (Technical: ${technicalMessage})`);
  }

  async startConversation(sessionId: string, userContext: any = {}): Promise<ChatResponse> {
    try {
      logger.info('Starting WBSO conversation', { sessionId, userContext });

      // Initialize session
      await this.sessionManager.createSession(sessionId, {
        phase: 'discovery',
        extractedInfo: {},
        messages: [],
        tokenCount: 0,
        cost: 0,
        userContext,
        createdAt: new Date(),
      });

      // Generate opening message with retry logic
      const response = await this.withRetry(async () => {
        const userLanguage = userContext?.language || 'nl';
        const systemPrompt = this.knowledgeBase.getSystemPrompt(userLanguage);
        const contextualGreeting = this.generateContextualGreeting(userContext);
        
        return await this.claude.messages.create({
          model: this.config.model,
          max_tokens: 1000,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: contextualGreeting
          }]
        });
      }, 'startConversation API call', sessionId);

      // Extract text from response (handle different content types)
      const responseText = this.extractTextFromResponse(response);

      // Use ACTUAL token usage from Anthropic API response instead of approximation
      const actualInputTokens = response.usage.input_tokens;
      const actualOutputTokens = response.usage.output_tokens;
      const cost = this.tokenCounter.calculateCost(actualInputTokens, actualOutputTokens, this.config.model);
      
      logger.info('Conversation start - actual token usage', {
        sessionId,
        inputTokens: actualInputTokens,
        outputTokens: actualOutputTokens,
        totalTokens: actualInputTokens + actualOutputTokens,
        cost: cost
      });
      
      await this.sessionManager.updateSession(sessionId, {
        messages: [{ role: "assistant", content: responseText }],
        tokenCount: actualInputTokens + actualOutputTokens,
        cost: cost
      });

      logger.info('Conversation started successfully', { sessionId, cost, tokens: actualInputTokens + actualOutputTokens });

      return {
        message: responseText,
        sessionId,
        phase: 'discovery',
        completeness: 0,
        readyForGeneration: false
      };
      
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to start conversation', { sessionId, error: err.message });
      throw new Error(`Failed to start conversation: ${err.message}`);
    }
  }

  async processMessage(sessionId: string, userMessage: string): Promise<ChatResponse> {
    try {
      logger.info('Processing message', { sessionId, messageLength: userMessage.length });

      // Validate session and limits
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      this.validateLimits(session);

      // Process with conversation manager
      const result = await this.conversationManager.processMessage(
        sessionId, 
        userMessage, 
        session
      );

      logger.info('Message processed successfully', { 
        sessionId, 
        phase: result.phase,
        completeness: result.completeness 
      });

      return result;
      
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to process message', { sessionId, error: err.message });
      throw new Error(`Failed to process message: ${err.message}`);
    }
  }

  async generateApplication(sessionId: string): Promise<any> {
    try {
      logger.info('Generating WBSO application', { sessionId });

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      
      if ((session.completeness || 0) < 80) {
        throw new Error('Insufficient information for application generation');
      }

      // Use the conversation manager to generate the final application
      return await this.conversationManager.generateApplication(session);
      
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to generate application', { sessionId, error: err.message });
      throw new Error(`Failed to generate application: ${err.message}`);
    }
  }

  private generateContextualGreeting(userContext: any): string {
    const language = userContext?.language || 'nl';
    
    // Check if user came from lead magnet
    if (userContext.isPreFilled && userContext.leadData) {
      const companyName = userContext.leadData.company_name;
      const sector = userContext.leadData.sbi_description;
      
      if (language === 'en') {
        return `I want to create a WBSO application for ${companyName}, a ${sector} company. I've already provided some information through the WBSO Check, so let's continue from there to complete my application.`;
      } else {
        return `Ik wil een WBSO-aanvraag maken voor ${companyName}, een ${sector} bedrijf. Ik heb al wat informatie verstrekt via de WBSO Check, dus laten we daar vandaan verder gaan om mijn aanvraag te voltooien.`;
      }
    }
    
    // Direct user
    if (language === 'en') {
      return "I want to start a WBSO application for my company's R&D project.";
    } else {
      return "Ik wil een WBSO-aanvraag starten voor het R&D-project van mijn bedrijf.";
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

  private validateLimits(session: any): void {
    if (session.cost > this.config.costLimits.perSession) {
      logger.warn('Session cost limit exceeded', { 
        sessionId: session.id, 
        cost: session.cost, 
        limit: this.config.costLimits.perSession 
      });
      throw new Error('Session cost limit exceeded');
    }
    
    if (session.messages.length > this.config.maxExchanges * 2) {
      logger.warn('Maximum conversation length exceeded', { 
        sessionId: session.id, 
        messageCount: session.messages.length 
      });
      throw new Error('Maximum conversation length exceeded');
    }
  }
} 