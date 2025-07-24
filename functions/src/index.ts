import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

// GDPR COMPLIANCE: Configure all functions to deploy only in EU regions
setGlobalOptions({
  region: 'europe-west1', // Belgium - EU region for GDPR compliance
  maxInstances: 10,
  memory: '1GiB',
  timeoutSeconds: 180
});

// Initialize Firebase Admin
admin.initializeApp();

// Export AI chat endpoints - FULL FUNCTIONALITY WITH EU-ONLY DEPLOYMENT
export {
  startWBSOChat,
  processWBSOChatMessage,
  generateWBSOApplication,
  wbsoChatHealth,
  debugWBSOChatSession
} from './ai/chatEndpoints';

// Export user management functions - EU ONLY
export { 
  createUser, 
  getUserProfile,
  updateCompany,
  submitWBSOApplication,
  generateWBSOPDF 
} from './userManagement';

// GDPR-compliant health check - EU ONLY
export const healthCheck = onRequest(async (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'WBSO AI Agent - EU GDPR Compliant',
    region: 'europe-west1',
    gdprCompliant: true,
    functions: ['startWBSOChat', 'processWBSOChatMessage', 'generateWBSOApplication', 'wbsoChatHealth']
  });
}); 