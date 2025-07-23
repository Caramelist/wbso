import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

export interface ConversationSession {
  id: string;
  phase: 'discovery' | 'clarification' | 'generation' | 'complete';
  extractedInfo: any;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: Date;
  }>;
  tokenCount: number;
  cost: number;
  completeness: number;
  userContext: any;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export class SessionManager {
  private db = getFirestore();
  private readonly COLLECTION_NAME = 'wbso_chat_sessions';
  private readonly SESSION_EXPIRY_HOURS = 24;

  /**
   * Create a new conversation session
   */
  async createSession(sessionId: string, initialData: Partial<ConversationSession>): Promise<ConversationSession> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (this.SESSION_EXPIRY_HOURS * 60 * 60 * 1000));

      const session: ConversationSession = {
        id: sessionId,
        phase: 'discovery',
        extractedInfo: {},
        messages: [],
        tokenCount: 0,
        cost: 0,
        completeness: 0,
        userContext: {},
        createdAt: now,
        updatedAt: now,
        expiresAt,
        ...initialData
      };

      await this.db.collection(this.COLLECTION_NAME).doc(sessionId).set(session);
      
      logger.info('Session created successfully', { sessionId, phase: session.phase });
      return session;

    } catch (error) {
      logger.error('Failed to create session', { sessionId, error: error.message });
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  /**
   * Get an existing session
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const doc = await this.db.collection(this.COLLECTION_NAME).doc(sessionId).get();
      
      if (!doc.exists) {
        logger.warn('Session not found', { sessionId });
        return null;
      }

      const session = doc.data() as ConversationSession;
      
      // Check if session has expired
      if (session.expiresAt && new Date() > session.expiresAt.toDate()) {
        logger.warn('Session expired', { sessionId, expiresAt: session.expiresAt });
        await this.deleteSession(sessionId);
        return null;
      }

      return session;

    } catch (error) {
      logger.error('Failed to get session', { sessionId, error: error.message });
      throw new Error(`Failed to get session: ${error.message}`);
    }
  }

  /**
   * Update an existing session
   */
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await this.db.collection(this.COLLECTION_NAME).doc(sessionId).update(updateData);
      
      logger.info('Session updated successfully', { 
        sessionId, 
        updatedFields: Object.keys(updates) 
      });

    } catch (error) {
      logger.error('Failed to update session', { sessionId, error: error.message });
      throw new Error(`Failed to update session: ${error.message}`);
    }
  }

  /**
   * Add a message to the session
   */
  async addMessage(
    sessionId: string, 
    role: 'user' | 'assistant' | 'system', 
    content: string
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const newMessage = {
        role,
        content,
        timestamp: new Date()
      };

      session.messages.push(newMessage);

      await this.updateSession(sessionId, {
        messages: session.messages
      });

      logger.info('Message added to session', { 
        sessionId, 
        role, 
        messageLength: content.length,
        totalMessages: session.messages.length 
      });

    } catch (error) {
      logger.error('Failed to add message to session', { sessionId, error: error.message });
      throw new Error(`Failed to add message: ${error.message}`);
    }
  }

  /**
   * Update extracted information from conversation
   */
  async updateExtractedInfo(sessionId: string, info: any): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const mergedInfo = {
        ...session.extractedInfo,
        ...info
      };

      // Calculate completeness based on required fields
      const completeness = this.calculateCompleteness(mergedInfo);

      await this.updateSession(sessionId, {
        extractedInfo: mergedInfo,
        completeness
      });

      logger.info('Extracted info updated', { 
        sessionId, 
        completeness,
        infoFields: Object.keys(info) 
      });

    } catch (error) {
      logger.error('Failed to update extracted info', { sessionId, error: error.message });
      throw new Error(`Failed to update extracted info: ${error.message}`);
    }
  }

  /**
   * Update session phase
   */
  async updatePhase(sessionId: string, phase: ConversationSession['phase']): Promise<void> {
    try {
      await this.updateSession(sessionId, { phase });
      
      logger.info('Session phase updated', { sessionId, phase });

    } catch (error) {
      logger.error('Failed to update phase', { sessionId, error: error.message });
      throw new Error(`Failed to update phase: ${error.message}`);
    }
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.db.collection(this.COLLECTION_NAME).doc(sessionId).delete();
      
      logger.info('Session deleted', { sessionId });

    } catch (error) {
      logger.error('Failed to delete session', { sessionId, error: error.message });
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const now = new Date();
      const expiredQuery = this.db.collection(this.COLLECTION_NAME)
        .where('expiresAt', '<', now)
        .limit(100);

      const snapshot = await expiredQuery.get();
      const deletions: Promise<void>[] = [];

      snapshot.forEach(doc => {
        deletions.push(doc.ref.delete());
      });

      await Promise.all(deletions);
      
      logger.info('Expired sessions cleaned up', { count: deletions.length });
      return deletions.length;

    } catch (error) {
      logger.error('Failed to cleanup expired sessions', { error: error.message });
      throw new Error(`Failed to cleanup sessions: ${error.message}`);
    }
  }

  /**
   * Calculate conversation completeness based on extracted information
   */
  private calculateCompleteness(extractedInfo: any): number {
    const requiredFields = [
      'projectTitle',
      'projectType',
      'problemDescription',
      'proposedSolution',
      'technicalChallenges',
      'innovationAspects',
      'timeline',
      'teamSize',
      'companyInfo'
    ];

    const providedFields = requiredFields.filter(field => 
      extractedInfo[field] && 
      (typeof extractedInfo[field] === 'string' ? extractedInfo[field].trim() : true)
    );

    const completeness = Math.round((providedFields.length / requiredFields.length) * 100);
    
    return Math.min(100, completeness);
  }

  /**
   * Get session statistics for monitoring
   */
  async getSessionStats(sessionId: string): Promise<{
    messageCount: number;
    totalCost: number;
    tokenCount: number;
    duration: number;
    completeness: number;
  } | null> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return null;

      const duration = new Date().getTime() - session.createdAt.getTime();

      return {
        messageCount: session.messages.length,
        totalCost: session.cost,
        tokenCount: session.tokenCount,
        duration: Math.round(duration / 1000), // seconds
        completeness: session.completeness
      };

    } catch (error) {
      logger.error('Failed to get session stats', { sessionId, error: error.message });
      return null;
    }
  }
} 