# WBSO AI Agent Setup Guide

## Overview
The WBSO AI Agent replaces the traditional form-based application process with an intelligent conversational interface powered by Claude AI. Users can now create professional WBSO applications through natural conversation.

## Architecture

### Backend (Firebase Functions)
- **WBSOAgent**: Main orchestrator class that manages conversations
- **KnowledgeBase**: Contains WBSO rules, guidelines, and expertise
- **ConversationManager**: Handles dialogue flow and information extraction
- **SessionManager**: Manages conversation state in Firestore
- **TokenCounter**: Monitors API usage and costs

### Frontend (Next.js)
- **WBSOChatInterface**: React component for the chat interface
- **Method Selection**: Users can choose between chat and traditional form
- **Lead Integration**: Seamlessly works with existing lead magnet system

## Setup Instructions

### 1. Environment Variables

Add these to your Firebase Functions environment:

```bash
# Claude AI Configuration
ANTHROPIC_API_KEY=your_claude_api_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Cost Controls
MAX_COST_PER_SESSION=5.00
DAILY_COST_LIMIT=500.00
```

### 2. Firebase Functions Deployment

```bash
# Navigate to functions directory
cd functions

# Install new dependencies
npm install @anthropic-ai/sdk

# Deploy functions
firebase deploy --only functions
```

### 3. Frontend Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install new dependencies
npm install uuid @types/uuid

# Run development server
npm run dev
```

### 4. Database Setup

The system automatically creates the following Firestore collection:
- `wbso_chat_sessions`: Stores conversation sessions with 24-hour expiry

## API Endpoints

### Chat Functions

1. **Start Conversation**
   - Endpoint: `/startWBSOChat`
   - Body: `{ sessionId: string, userContext?: any }`
   - Returns: Initial AI response with session info

2. **Process Message**
   - Endpoint: `/processWBSOChatMessage`
   - Body: `{ sessionId: string, message: string }`
   - Returns: AI response with conversation state

3. **Generate Application**
   - Endpoint: `/generateWBSOApplication`
   - Body: `{ sessionId: string }`
   - Returns: Complete WBSO application document

4. **Health Check**
   - Endpoint: `/wbsoChatHealth`
   - Returns: System status and configuration check

## User Experience Flow

### 1. Method Selection
Users see two options:
- **AI Assistant**: Conversational interface (recommended for beginners)
- **Traditional Form**: Classic form interface (for experienced users)

### 2. Lead Magnet Integration
- Users from WBSO Check get personalized AI responses
- 80% of data pre-populated from lead magnet
- AI uses company context for targeted questions

### 3. Conversation Phases
- **Discovery**: Understanding project goals and challenges
- **Clarification**: Detailed technical information gathering
- **Generation**: Ready to create WBSO application
- **Complete**: Application generated and downloadable

### 4. Progress Tracking
- Real-time completeness percentage
- Phase indicators
- Cost monitoring (transparent to users)

## Key Features

### 🤖 Intelligent Conversation
- Context-aware responses based on WBSO expertise
- Adaptive questioning based on user's experience level
- Automatic information extraction and validation

### 📊 Progress Management
- Session persistence for 24 hours
- Real-time progress tracking
- Automatic phase transitions

### 💰 Cost Controls
- Per-session spending limits ($5 default)
- Daily spending limits ($500 default)
- Token usage monitoring

### 🔗 Lead Integration
- Seamless integration with existing lead conversion
- Pre-populated data from WBSO Check
- Maintains all existing functionality

### 📄 PDF Generation
- Same high-quality PDF output as form approach
- Professional Dutch language documents
- RVO-compliant formatting

## Monitoring & Analytics

### Conversation Metrics
- Session completion rates
- Average conversation length
- Cost per successful application
- Phase completion statistics

### Error Handling
- Graceful Claude API failures
- Session recovery mechanisms
- Rate limiting protection
- Input validation and sanitization

## Best Practices

### 1. Cost Management
- Monitor daily spending via Firebase Console
- Adjust rate limits based on usage patterns
- Set up billing alerts for unexpected spikes

### 2. Quality Assurance
- Review generated applications periodically
- Monitor user feedback and satisfaction
- Update knowledge base based on common issues

### 3. Performance
- Sessions auto-expire after 24 hours
- Regular cleanup of expired sessions
- Efficient token usage with context management

## Deployment Checklist

- [ ] Claude API key configured
- [ ] Firebase Functions deployed
- [ ] Frontend dependencies installed
- [ ] Rate limiting configured
- [ ] Cost monitoring set up
- [ ] Error tracking enabled
- [ ] Lead conversion tested
- [ ] PDF generation verified

## Troubleshooting

### Common Issues

1. **"ANTHROPIC_API_KEY not configured"**
   - Ensure environment variable is set in Firebase Functions
   - Redeploy functions after adding the key

2. **Rate limiting errors**
   - Adjust rate limits in `chatEndpoints.ts`
   - Monitor usage patterns

3. **Session not found**
   - Sessions expire after 24 hours
   - Users need to start new conversation

4. **PDF generation fails**
   - Check if generated document structure is valid
   - Verify jsPDF integration

## Future Enhancements

- Multi-language support (English/Dutch)
- Advanced analytics dashboard
- Custom knowledge base management
- Integration with RVO portal API
- Voice interaction capabilities
- Mobile app support

## Support

For technical issues or questions about the AI agent system, please refer to:
- Firebase Functions logs for backend issues
- Browser console for frontend debugging
- Claude API documentation for AI-related questions 