'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams } from 'next/navigation';
import { useLeadConversion, type LeadData } from '@/lib/leadConversion';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  sessionId: string;
  phase: 'discovery' | 'clarification' | 'generation' | 'complete';
  completeness: number;
  cost: number;
  readyForGeneration: boolean;
  extractedInfo?: any;
}

interface GeneratedWBSODocument {
  projectDescription: string;
  technicalChallenge: string;
  innovativeAspects: string;
  expectedResults: string;
  activities: Array<{
    name: string;
    description: string;
    duration: string;
    hours: number;
  }>;
  costBreakdown: {
    totalHours: number;
    laborCosts: number;
    wbsoDeduction: number;
    netCosts: number;
  };
}

const WBSOChatInterface: React.FC = () => {
  const { t, locale } = useLanguage();
  const { user, firebaseUser } = useAuth();
  const searchParams = useSearchParams();
  const { mapLeadToInputs, decryptToken } = useLeadConversion();

  // Helper function to safely get error message
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  };
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => uuidv4());
  const [completeness, setCompleteness] = useState(0);
  const [phase, setPhase] = useState<'discovery' | 'clarification' | 'generation' | 'complete'>('discovery');
  const [canGenerate, setCanGenerate] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  
  // Lead conversion state
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);
  
  // Generation state
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedWBSODocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle lead token pre-population on component mount
  useEffect(() => {
    if (!searchParams) return;
    
    const leadToken = searchParams.get('lead_token');
    const source = searchParams.get('source');
    
    if (leadToken && source === 'wbso_check') {
      try {
        const decryptedLead = decryptToken(leadToken);
        if (decryptedLead) {
          setLeadData(decryptedLead);
          setIsPreFilled(true);
        }
      } catch (error) {
        console.error('Failed to process lead token:', error);
      }
    }
  }, [searchParams, decryptToken]);

  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
  }, [isPreFilled, leadData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Debug: Log current state - NO SENSITIVE DATA
      console.log('🔍 Initializing chat with state:', {
        hasUser: !!user,
        hasFirebaseUser: !!firebaseUser,
        userId: user?.uid ? 'present' : 'missing',
        locale: locale,
        isPreFilled: isPreFilled,
        hasLeadData: !!leadData
      });
      
      // Get authentication token
      if (!user || !firebaseUser) {
        throw new Error('User must be authenticated');
      }
      
      const token = await firebaseUser.getIdToken();
      console.log('🔑 Got auth token:', token ? 'SUCCESS' : 'FAILED');
      
      // Prepare request body - SECURITY: Don't send user email, let server extract from auth token
      const requestBody = {
        sessionId,
        userContext: {
          language: locale,
          isPreFilled,
          ...(isPreFilled && leadData ? { leadData } : {})
        }
      };

      console.log('📤 Sending request to /api/wbso-chat-start with context:', requestBody);

      const response = await fetch('/api/wbso-chat-start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response data:', data);
      
      if (data.success) {
        const initialMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date()
        };
        
        setMessages([initialMessage]);
        setCompleteness(data.data.completeness);
        setPhase(data.data.phase);
        setCanGenerate(data.data.readyForGeneration);
        setTotalCost(data.data.cost);
        
        console.log('✅ Chat initialized successfully');
      } else {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error || 'Failed to initialize chat');
      }
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      let errorContent = 'Sorry, er is een fout opgetreden bij het opstarten van de chat.';
      
      const errorText = getErrorMessage(error);
      console.log('🔍 Processing error:', errorText);
      
      if (errorText.includes('Rate limit')) {
        errorContent = 'Te veel verzoeken. Probeer het over een paar minuten opnieuw.';
      } else if (errorText.includes('authentication')) {
        errorContent = 'Authenticatie vereist. Log opnieuw in.';
      } else if (errorText.includes('Daily usage limit')) {
        errorContent = 'Dagelijkse gebruikslimiet bereikt. Probeer het morgen opnieuw.';
      } else if (errorText.includes('Firebase Functions not accessible')) {
        errorContent = 'De WBSO AI service is momenteel niet beschikbaar. Probeer het later opnieuw of neem contact op met support.';
      } else if (errorText.includes('500')) {
        errorContent = `Server fout: ${errorText}. Probeer het opnieuw of neem contact op met support als het probleem aanhoudt.`;
      }
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user || !firebaseUser) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/wbso-chat-message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setCompleteness(data.data.completeness);
        setPhase(data.data.phase);
        setCanGenerate(data.data.readyForGeneration);
        setTotalCost(data.data.cost);
      } else {
        throw new Error(data.error || 'Failed to process message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      let errorContent = 'Sorry, er is een fout opgetreden. Probeer het opnieuw.';
      
      const errorText = getErrorMessage(error);
      if (errorText.includes('Rate limit')) {
        errorContent = 'Te veel berichten. Wacht even voordat u een nieuw bericht stuurt.';
      } else if (errorText.includes('Daily usage limit')) {
        errorContent = 'Dagelijkse gebruikslimiet bereikt. Probeer het morgen opnieuw.';
      } else if (errorText.includes('Access denied')) {
        errorContent = 'Toegang geweigerd. Start een nieuwe conversatie.';
      }
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const generateApplication = async () => {
    if (!canGenerate || isGenerating || !user || !firebaseUser) return;

          try {
        setIsGenerating(true);
        
        const token = await firebaseUser.getIdToken();
      
      const response = await fetch('/api/wbso-chat-generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setGeneratedDocument(data.data);
        setPhase('complete');
        
        const successMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: '✅ Uw complete WBSO-aanvraag is gegenereerd! U kunt deze nu downloaden als PDF.',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(data.error || 'Failed to generate application');
      }
    } catch (error) {
      console.error('Failed to generate application:', error);
      let errorContent = 'Sorry, er is een fout opgetreden bij het genereren van de aanvraag.';
      
      const errorText = getErrorMessage(error);
      if (errorText.includes('Generation limit')) {
        errorContent = 'Dagelijkse generatielimiet bereikt. U kunt morgen weer nieuwe aanvragen genereren.';
      } else if (errorText.includes('Service temporarily unavailable')) {
        errorContent = 'Service tijdelijk niet beschikbaar vanwege hoog gebruik. Probeer het later opnieuw.';
      }
      
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!generatedDocument) return;

    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 20;
      
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", isBold ? "bold" : "normal");
        
        const lines = pdf.splitTextToSize(text, 170);
        pdf.text(lines, margin, yPosition);
        yPosition += lines.length * (fontSize * 0.4) + 5;
      };
      
      // Header
      addText("WBSO AANVRAAG 2025", 20, true);
      addText("Speur- en Ontwikkelingswerk (S&O)", 14, false);
      yPosition += 10;
      
      // Generated sections
      addText("PROJECTBESCHRIJVING", 16, true);
      addText(generatedDocument.projectDescription, 11, false);
      yPosition += 10;
      
      addText("TECHNISCHE UITDAGING", 16, true);
      addText(generatedDocument.technicalChallenge, 11, false);
      yPosition += 10;
      
      addText("INNOVATIEVE ASPECTEN", 16, true);
      addText(generatedDocument.innovativeAspects, 11, false);
      yPosition += 10;
      
      addText("VERWACHTE RESULTATEN", 16, true);
      addText(generatedDocument.expectedResults, 11, false);
      yPosition += 10;
      
      // Activities
      addText("SPEUR- EN ONTWIKKELINGSACTIVITEITEN", 16, true);
      generatedDocument.activities.forEach((activity, index) => {
        addText(`S&O Activiteit ${index + 1}: ${activity.name}`, 12, true);
        addText(`Periode: ${activity.duration}`, 11, false);
        addText(`Geschatte uren: ${activity.hours}`, 11, false);
        addText(`Beschrijving: ${activity.description}`, 11, false);
        yPosition += 5;
      });
      
      // Cost summary
      yPosition += 10;
      addText("WBSO KOSTENVOORDEEL", 16, true);
      addText(`Totaal S&O-uren: ${generatedDocument.costBreakdown.totalHours}`, 12, false);
      addText(`S&O-loonkosten: €${generatedDocument.costBreakdown.laborCosts.toLocaleString()}`, 12, false);
      addText(`WBSO-aftrek (36%): €${generatedDocument.costBreakdown.wbsoDeduction.toLocaleString()}`, 12, true);
      addText(`Netto S&O-kosten: €${generatedDocument.costBreakdown.netCosts.toLocaleString()}`, 12, true);
      
      // Footer
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Gegenereerd door WBSO Simpel op: ${new Date().toLocaleDateString('nl-NL')}`, margin, pageHeight - 15);
      pdf.text("Professional WBSO Application Platform", margin, pageHeight - 10);
      
      const fileName = `WBSO_Aanvraag_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('❌ Fout bij PDF genereren');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPhaseDisplay = () => {
    switch (phase) {
      case 'discovery': return 'Informatie verzamelen';
      case 'clarification': return 'Details uitwerken';
      case 'generation': return 'Klaar voor genereren';
      case 'complete': return 'Voltooid';
      default: return 'Bezig...';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'discovery': return 'bg-blue-100 text-blue-800';
      case 'clarification': return 'bg-yellow-100 text-yellow-800';
      case 'generation': return 'bg-green-100 text-green-800';
      case 'complete': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">
            WBSO AI Assistent
          </h1>
        </div>
        <p className="text-slate-600">
          {isPreFilled 
            ? 'Voltooi uw WBSO-aanvraag in een paar minuten met behulp van AI' 
            : 'Creëer uw WBSO-aanvraag door te chatten met onze AI-expert'
          }
        </p>
        
        {/* Progress indicators - REMOVED COST DISPLAY */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Fase:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor()}`}>
                {getPhaseDisplay()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Volledigheid:</span>
              <span className="text-sm font-medium text-slate-900">{completeness}%</span>
            </div>
          </div>
          
          <div className="w-32 bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completeness}%` }}
            ></div>
          </div>
        </div>

        {/* Lead magnet context */}
        {isPreFilled && leadData && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-medium text-emerald-800">
                Gegevens overgenomen van WBSO Check
              </h3>
            </div>
            <div className="text-sm text-emerald-700">
              <strong>{leadData.company_name}</strong> - {leadData.sbi_description} 
              • Berekende subsidie: €{leadData.calculated_subsidy?.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Development Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <details className="cursor-pointer">
            <summary className="font-medium text-yellow-800 mb-2">
              🔧 Debug Info (Development Only)
            </summary>
            <div className="text-xs text-yellow-700 space-y-1">
              <div><strong>User:</strong> {user ? 'Authenticated' : 'Not authenticated'}</div>
              <div><strong>Firebase User:</strong> {firebaseUser ? 'Authenticated' : 'Not authenticated'}</div>
              <div><strong>Language:</strong> {locale}</div>
              <div><strong>Session ID:</strong> {sessionId}</div>
              <div><strong>Messages:</strong> {messages.length}</div>
              <div><strong>Phase:</strong> {phase}</div>
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Can Generate:</strong> {canGenerate ? 'Yes' : 'No'}</div>
              <div><strong>Pre-filled:</strong> {isPreFilled ? 'Yes' : 'No'}</div>
              {isPreFilled && <div><strong>Lead Data:</strong> {leadData ? 'Available' : 'Missing'}</div>}
            </div>
          </details>
        </div>
      )}

      {/* Chat interface */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg">
        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString('nl-NL')}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">AI denkt na...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Typ uw bericht hier..."
              rows={2}
              disabled={loading || phase === 'complete'}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim() || phase === 'complete'}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Verstuur
            </button>
          </div>
          
          {/* Action buttons */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {phase === 'complete' 
                ? 'Chat is voltooid. Download uw WBSO-aanvraag hieronder.' 
                : 'Druk op Enter om te versturen, Shift+Enter voor nieuwe regel'
              }
            </div>
            
            <div className="flex space-x-3">
              {canGenerate && !generatedDocument && (
                <button
                  onClick={generateApplication}
                  disabled={isGenerating}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Genereren...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Genereer WBSO Aanvraag</span>
                    </>
                  )}
                </button>
              )}
              
              {generatedDocument && (
                <button
                  onClick={downloadPDF}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated document preview */}
      {generatedDocument && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-slate-900">
              Gegenereerde WBSO Aanvraag
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Projectbeschrijving</h4>
              <p className="text-sm text-gray-600">
                {generatedDocument.projectDescription.substring(0, 200)}...
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Activiteiten & Kosten</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Totaal uren:</span> {generatedDocument.costBreakdown.totalHours}
                </div>
                <div>
                  <span className="font-medium">WBSO-aftrek:</span> €{generatedDocument.costBreakdown.wbsoDeduction.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WBSOChatInterface; 