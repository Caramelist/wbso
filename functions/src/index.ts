import { onRequest, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import cors from 'cors';
import express from 'express';

// Initialize Firebase Admin
admin.initializeApp();

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://wbso-platform.com',
    'https://wbso-automation-platform.vercel.app',
    'https://wbso-automation-platform.netlify.app',
    'https://your-custom-domain.com',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Express app for HTTP functions
const app = express();

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    message: 'WBSO Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Basic test function for OpenAI
export const testOpenAI = onCall({
  region: 'europe-west1',
  timeoutSeconds: 60,
  memory: '512MiB',
}, async (request) => {
  // Verify user is authenticated
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  try {
    // For now, just return success - we'll add actual OpenAI testing later
    return {
      success: true,
      message: 'Function is working',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
  } catch (error) {
    console.error('Error testing OpenAI:', error);
    throw new Error('Failed to test configuration');
  }
});

// Export the Express app as an HTTP function
export const api = onRequest({
  region: 'europe-west1',
  timeoutSeconds: 540,
  memory: '1GiB',
}, app);

// Database Triggers
export const onUserCreate = onDocumentCreated({
  document: 'users/{userId}',
  region: 'europe-west1',
}, async (event) => {
  const userId = event.params?.userId;
  
  console.log(`New user created: ${userId}`);
  
  try {
    // Initialize user analytics
    await admin.firestore()
      .collection('analytics')
      .doc('users')
      .set({
        totalUsers: admin.firestore.FieldValue.increment(1),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

  } catch (error) {
    console.error(`Failed to process new user ${userId}:`, error);
  }
});

export const onApplicationCreate = onDocumentCreated({
  document: 'applications/{applicationId}',
  region: 'europe-west1',
}, async (event) => {
  const applicationId = event.params?.applicationId;
  const applicationData = event.data?.data();
  
  console.log(`New application created: ${applicationId}`);
  
  try {
    // Update company analytics if applicable
    if (applicationData?.companyId) {
      await admin.firestore()
        .collection('companies')
        .doc(applicationData.companyId)
        .set({
          lastApplicationCreated: admin.firestore.FieldValue.serverTimestamp(),
          totalApplications: admin.firestore.FieldValue.increment(1),
        }, { merge: true });
    }
    
  } catch (error) {
    console.error(`Failed to process new application ${applicationId}:`, error);
  }
});

// Export admin for other modules
export { admin }; 