import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { WBSOAgent } from './wbsoAgent';
import { logger } from 'firebase-functions';
import cors from 'cors';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { defineSecret } from 'firebase-functions/params';

// Define the secret for Anthropic API key
const anthropicApiKey = defineSecret('ANTHROPIC_API_KEY');

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: 'europe-west1',
  memory: '1GiB',
  timeoutSeconds: 180,
  secrets: [anthropicApiKey] // Include secrets in global options
});

const db = getFirestore();
const auth = getAuth();

// Configure CORS with environment-based origins
const getAllowedOrigins = () => {
  const baseOrigins = [
    'https://wbsosimpel.nl',
    'https://www.wbsosimpel.nl', 
    'https://app.wbsosimpel.nl'
  ];
  
  // SECURITY: Only add localhost origins in development
  if (process.env.NODE_ENV === 'development') {
    baseOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002'
    );
  }
  
  return baseOrigins;
};

const corsHandler = cors({
  origin: getAllowedOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS']
});

// ⚠️ SECURITY WARNING: Memory-based rate limiting is NOT SUITABLE for production
// with multiple function instances. Consider implementing Redis-based rate limiting
// for proper distributed rate limiting across all function instances.
// Current implementation may allow bypass through instance scaling.
const chatRateLimiter = new RateLimiterMemory({
  points: 15, // REDUCED for additional security
  duration: 300, // 5 minutes
});

const userChatRateLimiter = new RateLimiterMemory({
  points: 30, // REDUCED from 50 for security
  duration: 3600, // 1 hour
});

const generationRateLimiter = new RateLimiterMemory({
  points: 2, // REDUCED from 3 for security
  duration: 3600, // 1 hour
});

const userGenerationRateLimiter = new RateLimiterMemory({
  points: 3, // REDUCED from 5 for security  
  duration: 86400, // 24 hours
});

// SECURITY: Aggressive rate limiter for attack prevention
const emergencyLimiter = new RateLimiterMemory({
  points: 5, // REDUCED from 10
  duration: 60, // 1 minute
});

/**
 * Enhanced authentication middleware
 */
const authenticateUser = async (req: any): Promise<{ uid: string; email: string }> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || 'unknown'
    };
  } catch (error) {
    logger.error('Authentication failed', { error: (error as Error).message });
    throw new Error('Invalid authentication token');
  }
};

/**
 * Enhanced input validation and sanitization with security measures
 */
const validateAndSanitizeInput = (body: any, requiredFields: string[]): any => {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request format');
  }

  // Check required fields
  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== 'string') {
      throw new Error('Missing or invalid required field');
    }
  }

  // SECURITY: Enhanced sanitization
  const sanitized = { ...body };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      // SECURITY: More aggressive length limits
      sanitized[key] = value.trim().substring(0, 5000); // Reduced from 10,000
      
      // SECURITY: Basic injection pattern detection
      if (sanitized[key].includes('<script>') || 
          sanitized[key].includes('javascript:') ||
          sanitized[key].includes('data:text/html')) {
        throw new Error('Invalid input detected');
      }
    }
  }

  // SECURITY: Validate sessionId format (should be UUID-like)
  if (sanitized.sessionId && !/^[a-zA-Z0-9\-_]{8,64}$/.test(sanitized.sessionId)) {
    throw new Error('Invalid session identifier format');
  }

  return sanitized;
};

/**
 * Rate limiting check
 */
const checkRateLimit = async (req: any, userInfo: { uid: string; email: string }) => {
  const clientKey = req.ip || 'unknown';
  const userKey = userInfo.uid;

  try {
    // Check emergency rate limit first
    await emergencyLimiter.consume(clientKey);
    
    // Check general chat rate limit
    await chatRateLimiter.consume(clientKey);
    
    // Check user-specific rate limit
    await userChatRateLimiter.consume(userKey);
    
  } catch (rejRes) {
    const rateLimitRes = rejRes as RateLimiterRes;
    logger.warn('Rate limit exceeded', {
      clientKey,
      userKey,
      rateLimiter: 'chat_rate_limit',
      remainingPoints: rateLimitRes.remainingPoints,
      msBeforeNext: rateLimitRes.msBeforeNext
    });

    const waitTime = Math.round((rateLimitRes.msBeforeNext || 60000) / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
  }
};

/**
 * Generation rate limiting check
 */
const checkGenerationRateLimit = async (req: any, userInfo: { uid: string; email: string }) => {
  const clientKey = req.ip || 'unknown';
  const userKey = userInfo.uid;

  try {
    await generationRateLimiter.consume(clientKey);
    await userGenerationRateLimiter.consume(userKey);
    
  } catch (rejRes) {
    const rateLimitRes = rejRes as RateLimiterRes;
    logger.warn('Generation rate limit exceeded', {
      clientKey,
      userKey,
      rateLimiter: 'generation_rate_limit',
      remainingPoints: rateLimitRes.remainingPoints
    });

    const waitTime = Math.round((rateLimitRes.msBeforeNext || 3600000) / 1000 / 60); // minutes
    throw new Error(`Generation limit exceeded. You can generate 3 applications per day. Please wait ${waitTime} minutes.`);
  }
};

/**
 * Enhanced cost monitoring with race condition protection
 */
const checkCostLimitsWithLock = async (userInfo: { uid: string }, estimatedCost: number = 0.05) => {
  const today = new Date().toISOString().split('T')[0];
  const userCostRef = db.collection('user_daily_costs').doc(`${userInfo.uid}_${today}`);
  
  // SECURITY: Use Firestore transaction to prevent race conditions
  return await db.runTransaction(async (transaction) => {
    const userCostDoc = await transaction.get(userCostRef);
    const currentCost = userCostDoc.exists ? userCostDoc.data()?.totalCost || 0 : 0;
    const dailyLimit = parseFloat(process.env.USER_DAILY_COST_LIMIT || '10.00');
    
    if (currentCost + estimatedCost > dailyLimit) {
      logger.warn('User daily cost limit would be exceeded', {
        userId: userInfo.uid,
        currentCost,
        estimatedCost,
        dailyLimit
      });
      throw new Error(`Daily usage limit reached. Current: $${currentCost.toFixed(3)}, Limit: $${dailyLimit}`);
    }
    
    // Check global daily costs
    const globalCostRef = db.collection('system_costs').doc(`global_${today}`);
    const globalCostDoc = await transaction.get(globalCostRef);
    const globalCost = globalCostDoc.exists ? globalCostDoc.data()?.totalCost || 0 : 0;
    const globalLimit = parseFloat(process.env.DAILY_COST_LIMIT || '500.00');
    
    if (globalCost + estimatedCost > globalLimit) {
      logger.error('Global daily cost limit would be exceeded', {
        globalCost,
        estimatedCost,
        globalLimit
      });
      throw new Error('Service temporarily unavailable due to high usage. Please try again tomorrow.');
    }
    
    // Reserve the cost by incrementing it immediately
    transaction.set(userCostRef, {
      userId: userInfo.uid,
      date: today,
      totalCost: currentCost + estimatedCost,
      reservedAt: new Date(),
      lastUpdated: new Date()
    }, { merge: true });
    
    return currentCost + estimatedCost;
  });
};

/**
 * Update cost tracking
 */
const updateCostTracking = async (userInfo: { uid: string }, actualCost: number) => {
  const today = new Date().toISOString().split('T')[0];
  const batch = db.batch();
  
  // Update user daily cost
  const userCostRef = db.collection('user_daily_costs').doc(`${userInfo.uid}_${today}`);
  batch.set(userCostRef, {
    userId: userInfo.uid,
    date: today,
    totalCost: actualCost,
    lastUpdated: new Date()
  }, { merge: true });
  
  // Update global daily cost
  const globalCostRef = db.collection('system_costs').doc(`global_${today}`);
  batch.set(globalCostRef, {
    date: today,
    totalCost: actualCost,
    lastUpdated: new Date()
  }, { merge: true });
  
  await batch.commit();
};

/**
 * Verify session ownership
 */
const verifySessionOwnership = async (sessionId: string, userInfo: { uid: string }) => {
  const sessionRef = db.collection('wbso_chat_sessions').doc(sessionId);
  const sessionDoc = await sessionRef.get();
  
  if (sessionDoc.exists) {
    const sessionData = sessionDoc.data();
    const sessionUserId = sessionData?.userContext?.userId;
    
    if (sessionUserId && sessionUserId !== userInfo.uid) {
      logger.warn('Session ownership violation attempt', {
        sessionId,
        requestingUser: userInfo.uid,
        sessionOwner: sessionUserId
      });
      throw new Error('Access denied: Session belongs to another user');
    }
  }
};

/**
 * Start a new WBSO chat conversation - SECURED
 */
export const startWBSOChat = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ success: false, error: 'Method not allowed' });
          return resolve(undefined);
        }

        // Authenticate user
        const userInfo = await authenticateUser(req);
        
        // Rate limiting
        await checkRateLimit(req, userInfo);
        
        // Input validation
        const validatedBody = validateAndSanitizeInput(req.body, ['sessionId']);
        const { sessionId, userContext = {} } = validatedBody;
        
        // Cost monitoring
        await checkCostLimitsWithLock(userInfo, 0.02); // Estimated cost for starting conversation
        
        logger.info('Starting WBSO chat conversation', { 
          sessionId, 
          userId: userInfo.uid,
          hasUserContext: !!userContext,
          ip: req.ip 
        });

        // Add user info to context
        const enhancedUserContext = {
          ...userContext,
          userId: userInfo.uid,
          userEmail: userInfo.email
        };

        const agent = new WBSOAgent();
        const result = await agent.startConversation(sessionId, enhancedUserContext);
        
        // Get session data for cost tracking (result no longer contains cost)
        const session = await db.collection('wbso_chat_sessions').doc(sessionId).get();
        const sessionData = session.data();
        if (sessionData) {
          await updateCostTracking(userInfo, sessionData.cost || 0);
        }

        res.status(200).json({
          success: true,
          data: result
        });

        resolve(undefined);

      } catch (error) {
        const err = error as Error;
        logger.error('Failed to start WBSO chat', { 
          error: err.message,
          sessionId: req.body?.sessionId,
          ip: req.ip
        });

        const statusCode = err.message.includes('Rate limit') ? 429 :
                          err.message.includes('authentication') ? 401 :
                          err.message.includes('Daily usage limit') ? 429 : 500;

        // SECURITY: Sanitize error messages to prevent information leakage
        let sanitizedError = 'Request failed';
        if (err.message.includes('Rate limit')) {
          sanitizedError = 'Rate limit exceeded. Please try again later.';
        } else if (err.message.includes('authentication')) {
          sanitizedError = 'Authentication required';
        } else if (err.message.includes('Daily usage limit')) {
          sanitizedError = 'Daily usage limit reached';
        } else if (err.message.includes('Session cost limit')) {
          sanitizedError = 'Session limit reached';
        } else if (err.message.includes('Maximum conversation length')) {
          sanitizedError = 'Conversation limit reached';
        }

        res.status(statusCode).json({
          success: false,
          error: sanitizedError
        });

        resolve(undefined);
      }
    });
  });
});

/**
 * Process a message in WBSO chat conversation - SECURED
 */
export const processWBSOChatMessage = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ success: false, error: 'Method not allowed' });
          return resolve(undefined);
        }

        // Authenticate user
        const userInfo = await authenticateUser(req);
        
        // Rate limiting
        await checkRateLimit(req, userInfo);
        
        // Input validation
        const validatedBody = validateAndSanitizeInput(req.body, ['sessionId', 'message']);
        const { sessionId, message } = validatedBody;
        
        // Verify session ownership
        await verifySessionOwnership(sessionId, userInfo);
        
        // Cost monitoring
        await checkCostLimitsWithLock(userInfo, 0.05); // Estimated cost per message
        
        logger.info('Processing WBSO chat message', { 
          sessionId, 
          userId: userInfo.uid,
          messageLength: message.length,
          ip: req.ip 
        });

        const agent = new WBSOAgent();
        const result = await agent.processMessage(sessionId, message);
        
        // Get session data for cost tracking (result no longer contains cost)
        const session = await db.collection('wbso_chat_sessions').doc(sessionId).get();
        const sessionData = session.data();
        if (sessionData) {
          await updateCostTracking(userInfo, sessionData.cost || 0);
        }

        res.status(200).json({
          success: true,
          data: result
        });

        resolve(undefined);

      } catch (error) {
        const err = error as Error;
        logger.error('Failed to process WBSO chat message', { 
          error: err.message,
          sessionId: req.body?.sessionId,
          ip: req.ip
        });

        const statusCode = err.message.includes('Rate limit') ? 429 :
                          err.message.includes('authentication') ? 401 :
                          err.message.includes('Access denied') ? 403 :
                          err.message.includes('Daily usage limit') ? 429 : 500;

        // SECURITY: Sanitize error messages to prevent information leakage
        let sanitizedError = 'Request failed';
        if (err.message.includes('Rate limit')) {
          sanitizedError = 'Rate limit exceeded. Please try again later.';
        } else if (err.message.includes('authentication')) {
          sanitizedError = 'Authentication required';
        } else if (err.message.includes('Access denied')) {
          sanitizedError = 'Access denied';
        } else if (err.message.includes('Daily usage limit')) {
          sanitizedError = 'Daily usage limit reached';
        }

        res.status(statusCode).json({
          success: false,
          error: sanitizedError
        });

        resolve(undefined);
      }
    });
  });
});

/**
 * Generate WBSO application from conversation - SECURED
 */
export const generateWBSOApplication = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'POST') {
          res.status(405).json({ success: false, error: 'Method not allowed' });
          return resolve(undefined);
        }

        // Authenticate user
        const userInfo = await authenticateUser(req);
        
        // Enhanced rate limiting for generation
        await checkGenerationRateLimit(req, userInfo);
        
        // Input validation
        const validatedBody = validateAndSanitizeInput(req.body, ['sessionId']);
        const { sessionId } = validatedBody;
        
        // Verify session ownership
        await verifySessionOwnership(sessionId, userInfo);
        
        // Cost monitoring (generation is more expensive)
        await checkCostLimitsWithLock(userInfo, 0.15);
        
        logger.info('Generating WBSO application', { 
          sessionId,
          userId: userInfo.uid,
          ip: req.ip 
        });

        const agent = new WBSOAgent();
        const result = await agent.generateApplication(sessionId);
        
        // Update cost tracking
        const session = await db.collection('wbso_chat_sessions').doc(sessionId).get();
        const sessionData = session.data();
        if (sessionData) {
          await updateCostTracking(userInfo, sessionData.cost || 0);
        }

        res.status(200).json({
          success: true,
          data: result
        });

        resolve(undefined);

      } catch (error) {
        const err = error as Error;
        logger.error('Failed to generate WBSO application', { 
          error: err.message,
          sessionId: req.body?.sessionId,
          ip: req.ip
        });

        const statusCode = err.message.includes('Generation limit') ? 429 :
                          err.message.includes('authentication') ? 401 :
                          err.message.includes('Access denied') ? 403 :
                          err.message.includes('Service temporarily unavailable') ? 503 : 500;

        // SECURITY: Sanitize error messages to prevent information leakage
        let sanitizedError = 'Request failed';
        if (err.message.includes('Generation limit')) {
          sanitizedError = 'Generation limit exceeded. You can generate 3 applications per day. Please try again later.';
        } else if (err.message.includes('authentication')) {
          sanitizedError = 'Authentication required';
        } else if (err.message.includes('Access denied')) {
          sanitizedError = 'Access denied';
        } else if (err.message.includes('Service temporarily unavailable')) {
          sanitizedError = 'Service temporarily unavailable';
        }

        res.status(statusCode).json({
          success: false,
          error: sanitizedError
        });

        resolve(undefined);
      }
    });
  });
});

/**
 * Health check endpoint - Public but rate limited
 */
export const wbsoChatHealth = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      try {
        // Basic rate limiting for health checks
        await emergencyLimiter.consume(req.ip || 'unknown');
        
        // Check required parameters - try to access them to validate they're set
        try {
          const apiKey = anthropicApiKey.value();
          if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY not configured');
          }
        } catch (error) {
          res.status(500).json({
            success: false,
            error: 'Missing required parameters',
            details: 'ANTHROPIC_API_KEY secret not configured'
          });
          return resolve(undefined);
        }

        // Check Firestore connectivity
        await db.collection('health_check').limit(1).get();

        res.status(200).json({
          success: true,
          message: 'WBSO Chat API is healthy',
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          security: 'enabled'
        });

        resolve(undefined);

      } catch (error) {
        const err = error as Error;
        logger.error('Health check failed', { error: err.message });
        
        res.status(500).json({
          success: false,
          error: 'Health check failed'
        });

        resolve(undefined);
      }
    });
  });
}); 

/**
 * Debug endpoint - ADMIN ONLY with restricted information
 */
export const debugWBSOChatSession = onRequest({ secrets: [anthropicApiKey] }, async (req, res) => {
  return new Promise((resolve) => {
    corsHandler(req, res, async () => {
      try {
        if (req.method !== 'GET') {
          res.status(405).json({ success: false, error: 'Method not allowed' });
          return resolve(undefined);
        }

        // SECURITY: Enhanced authentication for debug endpoint
        const userInfo = await authenticateUser(req);
        
        // SECURITY: Admin-only access check
        const userDoc = await db.collection('users').doc(userInfo.uid).get();
        const userData = userDoc.data();
        if (!userData?.role || userData.role !== 'admin') {
          logger.warn('Debug endpoint access denied', { userId: userInfo.uid });
          res.status(403).json({ success: false, error: 'Admin access required' });
          return resolve(undefined);
        }
        
        // Get sessionId from query parameters
        const sessionId = req.query.sessionId as string;
        if (!sessionId) {
          res.status(400).json({ success: false, error: 'sessionId required' });
          return resolve(undefined);
        }

        // Verify session ownership or admin access
        await verifySessionOwnership(sessionId, userInfo);
        
        // Get session data
        const sessionRef = db.collection('wbso_chat_sessions').doc(sessionId);
        const sessionDoc = await sessionRef.get();
        
        if (!sessionDoc.exists) {
          res.status(404).json({ success: false, error: 'Session not found' });
          return resolve(undefined);
        }

        const sessionData = sessionDoc.data();
        
        // SECURITY: Return only non-sensitive debug information
        res.status(200).json({
          success: true,
          debug: {
            sessionId,
            phase: sessionData?.phase,
            messageCount: sessionData?.messages?.length || 0,
            tokenCount: sessionData?.tokenCount || 0,
            completeness: sessionData?.completeness || 0,
            // SECURITY: Remove sensitive data
            hasExtractedInfo: !!(sessionData?.extractedInfo && Object.keys(sessionData.extractedInfo).length > 0),
            messagePreview: sessionData?.messages?.length > 0 ? 'Messages present' : 'No messages',
            createdAt: sessionData?.createdAt,
            isExpired: sessionData?.expiresAt ? new Date() > sessionData.expiresAt : false
          }
        });

        resolve(undefined);

      } catch (error) {
        const err = error as Error;
        logger.error('Debug endpoint error', { 
          error: err.message,
          sessionId: req.query?.sessionId
        });

        // SECURITY: Generic error message to prevent information leakage
        res.status(400).json({
          success: false,
          error: 'Access denied'
        });

        resolve(undefined);
      }
    });
  });
}); 