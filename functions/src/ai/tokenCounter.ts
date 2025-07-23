/**
 * Token counter for Claude API cost management
 * Uses approximation since we don't have access to Claude's exact tokenizer
 */
export class TokenCounter {
  private pricing: Record<string, { input: number; output: number }>;

  constructor() {
    // Claude pricing per token (as of 2024)
    this.pricing = {
      'claude-3-5-sonnet-20241022': {
        input: 3.00 / 1_000_000,   // $3 per 1M input tokens
        output: 15.00 / 1_000_000  // $15 per 1M output tokens
      },
      'claude-3-opus-20240229': {
        input: 15.00 / 1_000_000,  // $15 per 1M input tokens
        output: 75.00 / 1_000_000  // $75 per 1M output tokens
      },
      'claude-3-haiku-20240307': {
        input: 0.25 / 1_000_000,   // $0.25 per 1M input tokens
        output: 1.25 / 1_000_000   // $1.25 per 1M output tokens
      }
    };
  }

  /**
   * Approximate token count for text
   * Rule of thumb: 1 token ≈ 4 characters for English text
   * Claude tokenizer may differ, but this provides reasonable estimation
   */
  count(text: string): number {
    if (!text) return 0;
    
    // Remove extra whitespace
    const cleanText = text.trim().replace(/\s+/g, ' ');
    
    // Approximate tokens: 1 token per ~4 characters
    // Add some buffer for special tokens and formatting
    const approximateTokens = Math.ceil(cleanText.length / 3.5);
    
    return approximateTokens;
  }

  /**
   * Calculate cost for API call with input and output tokens
   */
  calculateCost(inputTokens: number, outputTokens: number, model: string): number {
    const rates = this.pricing[model];
    if (!rates) {
      throw new Error(`Unknown model pricing: ${model}`);
    }
    
    const inputCost = inputTokens * rates.input;
    const outputCost = outputTokens * rates.output;
    
    return Number((inputCost + outputCost).toFixed(6));
  }

  /**
   * Estimate conversation cost based on message history
   */
  estimateConversationCost(messages: Array<{role: string; content: string}>, model: string): number {
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    
    for (const message of messages) {
      const tokens = this.count(message.content);
      
      if (message.role === 'user' || message.role === 'system') {
        totalInputTokens += tokens;
      } else if (message.role === 'assistant') {
        totalOutputTokens += tokens;
      }
    }
    
    return this.calculateCost(totalInputTokens, totalOutputTokens, model);
  }

  /**
   * Get pricing information for a model
   */
  getModelPricing(model: string): { input: number; output: number } | null {
    return this.pricing[model] || null;
  }

  /**
   * Estimate tokens needed for WBSO application generation
   */
  estimateApplicationGenerationTokens(): { input: number; output: number } {
    return {
      input: 8000,  // System prompt + conversation history + generation instructions
      output: 4000  // Generated WBSO application content
    };
  }

  /**
   * Check if estimated cost would exceed budget
   */
  wouldExceedBudget(
    currentCost: number, 
    estimatedAdditionalTokens: { input: number; output: number },
    model: string,
    budget: number
  ): boolean {
    const additionalCost = this.calculateCost(
      estimatedAdditionalTokens.input,
      estimatedAdditionalTokens.output,
      model
    );
    
    return (currentCost + additionalCost) > budget;
  }

  /**
   * Format cost for display
   */
  formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(2)}k`; // Show in millidollars if very small
    }
    return `$${cost.toFixed(3)}`;
  }

  /**
   * Calculate cost per message for monitoring
   */
  calculateMessageCost(messageContent: string, responseContent: string, model: string): number {
    const inputTokens = this.count(messageContent);
    const outputTokens = this.count(responseContent);
    
    return this.calculateCost(inputTokens, outputTokens, model);
  }
} 