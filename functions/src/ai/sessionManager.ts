import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

export interface ConversationSession {
  id: string;
  phase: 'discovery' | 'clarification' | 'generation' | 'complete';
  extractedInfo: any;
  messages: Array<{ role: string; content: string; timestamp?: Date }>;
  tokenCount: number;
  cost: number;
  completeness?: number;
  userContext?: any;
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
      const err = error as Error;
      logger.error('Failed to create session', { sessionId, error: err.message });
      throw new Error(`Failed to create session: ${err.message}`);
    }
  }

  /**
   * Get a conversation session
   */
  async getSession(sessionId: string): Promise<ConversationSession | null> {
    try {
      const sessionDoc = await this.db.collection(this.COLLECTION_NAME).doc(sessionId).get();
      
      if (!sessionDoc.exists) {
        return null;
      }
      
      const sessionData = sessionDoc.data() as ConversationSession;
      
      // Check if session has expired - handle both Date and Timestamp objects
      if (sessionData.expiresAt) {
        const expirationTime = sessionData.expiresAt instanceof Timestamp 
          ? sessionData.expiresAt.toDate() 
          : sessionData.expiresAt;
        
        if (new Date() > expirationTime) {
          await this.deleteSession(sessionId);
          return null;
        }
      }
      
      return sessionData;
      
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to get session', { sessionId, error: err.message });
      throw new Error(`Failed to get session: ${err.message}`);
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, updates: Partial<ConversationSession>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await this.db.collection(this.COLLECTION_NAME).doc(sessionId).update(updateData);
      
      logger.debug('Session updated successfully', { sessionId, updates: Object.keys(updates) });
      
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to update session', { sessionId, error: err.message });
      throw new Error(`Failed to update session: ${err.message}`);
    }
  }

  /**
   * Add a message to the session
   */
  async addMessage(sessionId: string, role: 'user' | 'assistant', content: string): Promise<void> {
    try {
      const message = {
        role,
        content,
        timestamp: new Date()
      };

      // Get current session and add the message
      const sessionDoc = await this.db.collection(this.COLLECTION_NAME).doc(sessionId).get();
      const currentMessages = sessionDoc.data()?.messages || [];
      
      // Update with new message array
      await this.db.collection(this.COLLECTION_NAME).doc(sessionId).update({
        messages: [...currentMessages, message],
        updatedAt: new Date()
      });

      logger.debug('Message added to session', { sessionId, role, contentLength: content.length });

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to add message to session', { sessionId, error: err.message });
      throw new Error(`Failed to add message: ${err.message}`);
    }
  }

  /**
   * Update extracted information
   */
  async updateExtractedInfo(sessionId: string, newInfo: any): Promise<void> {
    try {
      // Get current session to merge extracted info
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const mergedInfo = {
        ...session.extractedInfo,
        ...newInfo
      };

      await this.updateSession(sessionId, {
        extractedInfo: mergedInfo
      });

      logger.debug('Extracted info updated', { sessionId, newFields: Object.keys(newInfo) });

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to update extracted info', { sessionId, error: err.message });
      throw new Error(`Failed to update extracted info: ${err.message}`);
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
      const err = error as Error;
      logger.error('Failed to update phase', { sessionId, error: err.message });
      throw new Error(`Failed to update phase: ${err.message}`);
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
      const err = error as Error;
      logger.error('Failed to delete session', { sessionId, error: err.message });
      throw new Error(`Failed to delete session: ${err.message}`);
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      const expiredQuery = this.db.collection(this.COLLECTION_NAME)
        .where('expiresAt', '<', now)
        .limit(100);

      const expiredSessions = await expiredQuery.get();
      
      if (expiredSessions.empty) {
        logger.debug('No expired sessions to clean up');
        return;
      }

      // Delete expired sessions in batches
      const batch = this.db.batch();
      expiredSessions.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      logger.info('Expired sessions cleaned up', { 
        count: expiredSessions.size,
        cleanupTime: now.toISOString()
      });

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to cleanup expired sessions', { error: err.message });
      throw new Error(`Failed to cleanup sessions: ${err.message}`);
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId?: string): Promise<any> {
    try {
      if (sessionId) {
        // Get stats for specific session
        const session = await this.getSession(sessionId);
        if (!session) {
          return null;
        }

        return {
          sessionId,
          phase: session.phase,
          messageCount: session.messages.length,
          tokenCount: session.tokenCount,
          cost: session.cost,
          completeness: session.completeness,
          age: new Date().getTime() - session.createdAt.getTime(),
          isExpired: session.expiresAt ? new Date() > session.expiresAt : false
        };
      } else {
        // Get general stats
        const totalSessions = await this.db.collection(this.COLLECTION_NAME).count().get();
        const activeSessions = await this.db.collection(this.COLLECTION_NAME)
          .where('expiresAt', '>', new Date())
          .count().get();

        return {
          totalSessions: totalSessions.data().count,
          activeSessions: activeSessions.data().count,
          expiredSessions: totalSessions.data().count - activeSessions.data().count
        };
      }

    } catch (error) {
      const err = error as Error;
      logger.error('Failed to get session stats', { sessionId, error: err.message });
      return null;
    }
  }
} 