import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export AI chat endpoints - THE MAIN FUNCTIONALITY WE FIXED
export {
  startWBSOChat,
  processWBSOChatMessage,
  generateWBSOApplication,
  wbsoChatHealth
} from './ai/chatEndpoints';

// Export user management functions
export { 
  createUser, 
  getUserProfile,
  updateCompany,
  submitWBSOApplication,
  generateWBSOPDF 
} from './userManagement';

// Simple health check
export const healthCheck = onRequest(async (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    functions: ['startWBSOChat', 'processWBSOChatMessage', 'generateWBSOApplication', 'wbsoChatHealth']
  });
}); 