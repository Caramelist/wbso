'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import WBSOApplicationForm from '@/components/wbso/WBSOApplicationForm';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

// User journey types based on lead data
type UserJourney = 'lead_magnet' | 'direct' | 'returning';

export default function NewWBSOApplicationPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [userJourney, setUserJourney] = useState<UserJourney | null>(null);
  const [leadData, setLeadData] = useState<any>(null);
  const [showMethodChoice, setShowMethodChoice] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'form' | null>(null);

  // Determine user journey on mount
  useEffect(() => {
    if (!user) return;

    const leadToken = searchParams?.get('lead_token');
    const source = searchParams?.get('source');
    
    if (leadToken && source === 'wbso_check') {
      // Lead magnet user - 80% data pre-filled
      setUserJourney('lead_magnet');
      // In real app, decrypt and set lead data here
      setLeadData({ hasLeadData: true, completeness: 80 });
    } else {
      // Check if returning user with saved applications
      const hasExistingApplications = false; // Check from API
      setUserJourney(hasExistingApplications ? 'returning' : 'direct');
    }
  }, [user, searchParams]);

  // Auto-route lead magnet users to AI (highest conversion path)
  useEffect(() => {
    if (userJourney === 'lead_magnet') {
      // Small delay for UX, then auto-route to AI
      const timer = setTimeout(() => {
        const currentSearch = window.location.search;
        router.push(`/applications/chat${currentSearch}`);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [userJourney, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              {t('auth.signInToAccess')}
            </h2>
            <p className="text-slate-600 mb-6">
              {t('demo.authRequired')}
            </p>
            <a 
              href="/"
              className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('auth.signIn')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle method selection for direct users
  const handleMethodSelect = (method: 'chat' | 'form') => {
    if (method === 'chat') {
      const currentSearch = window.location.search;
      router.push(`/applications/chat${currentSearch}`);
    } else {
      setSelectedMethod(method);
    }
  };

  // Lead magnet user journey - auto-routing to AI
  if (userJourney === 'lead_magnet') {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-8 text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h1 className="text-3xl font-bold">Geweldig! 80% al ingevuld</h1>
            </div>
            <p className="text-xl opacity-90">
              We hebben al het meeste van uw gegevens van de WBSO Check
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Uw voortgang</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Bedrijfsgegevens</span>
                <span className="text-sm font-medium text-emerald-600">✓ Compleet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Project type & budget</span>
                <span className="text-sm font-medium text-emerald-600">✓ Compleet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Technische uitdaging</span>
                <span className="text-sm font-medium text-emerald-600">✓ Compleet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Project details</span>
                <span className="text-sm font-medium text-amber-600">→ Nog 3 vragen</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full transition-all duration-500" style={{ width: '80%' }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">80% voltooid - nog ~3 minuten</p>
            </div>
          </div>

          {/* Auto-routing message */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-700"></div>
              <p className="text-slate-700 font-medium">Uw AI assistent wordt gestart...</p>
            </div>
            <p className="text-sm text-slate-600">
              We verbinden u met onze WBSO AI die de laatste 3 vragen stelt en uw aanvraag genereert
            </p>
          </div>

          {/* Optional manual redirect */}
          <button
            onClick={() => {
              const currentSearch = window.location.search;
              router.push(`/applications/chat${currentSearch}`);
            }}
            className="text-slate-600 hover:text-slate-800 text-sm underline"
          >
            Direct doorgaan →
          </button>
        </div>
      </AppLayout>
    );
  }

  // Direct user journey - choice with strong AI recommendation
  if (userJourney === 'direct' && !showMethodChoice) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">WBSO Aanvraag Maken</h1>
            <p className="text-xl opacity-90">
              Creëer uw R&D belastingvoordeel aanvraag
            </p>
          </div>

          {/* Recommendation Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">💡 Tip: Probeer eerst onze gratis WBSO Check</h3>
                <p className="text-blue-800 text-sm mb-3">
                  Met onze WBSO Check kunt u 80% van deze vragen overslaan én krijgt u direct inzicht in uw potentiële subsidie.
                </p>
                <a 
                  href="/#wbso-check" 
                  className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium text-sm"
                >
                  Doe eerst de WBSO Check →
                </a>
              </div>
            </div>
          </div>

          {/* Method choice */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Hoe wilt u uw aanvraag maken?
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowMethodChoice(true)}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white p-4 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">🚀 AI Assistent (Aanbevolen)</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Intelligente begeleiding - ideaal voor eerste keer
                    </p>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </button>
              
              <button
                onClick={() => setShowMethodChoice(true)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">📝 Traditioneel Formulier</h3>
                    <p className="text-sm opacity-70 mt-1">
                      Voor ervaren gebruikers met alle gegevens klaar
                    </p>
                  </div>
                  <span className="text-2xl">→</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Method selection detailed view
  if (showMethodChoice && !selectedMethod) {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setShowMethodChoice(false)}
            className="text-slate-600 hover:text-slate-800 flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Terug</span>
          </button>

          {/* Detailed comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Chat Option - RECOMMENDED */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-emerald-200 relative">
              <div className="absolute -top-3 left-6 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                AANBEVOLEN
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  AI Assistent
                </h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Onze AI begeleidt u stap voor stap. Perfect voor beginners en complexe projecten.
                </p>
                
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center text-sm text-emerald-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Realtime uitleg en hulp</span>
                  </div>
                  <div className="flex items-center text-sm text-emerald-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Automatische kwaliteitscontrole</span>
                  </div>
                  <div className="flex items-center text-sm text-emerald-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gepersonaliseerde vragen</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span><strong>95% succesvol bij eerste poging</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleMethodSelect('chat')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Start AI Assistent
                </button>
              </div>
            </div>

            {/* Traditional Form Option */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-slate-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Traditioneel Formulier
                </h3>
                <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                  Direct invullen als u precies weet wat u wilt. Voor ervaren WBSO aanvragers.
                </p>
                
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center text-sm text-slate-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Vertrouwde formulier interface</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Alle velden in één overzicht</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sneller met voorbereide data</span>
                  </div>
                  <div className="flex items-center text-sm text-amber-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span><strong>Alleen voor ervaren gebruikers</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => handleMethodSelect('form')}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Gebruik Formulier
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show form if selected
  if (selectedMethod === 'form') {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Back button */}
          <button
            onClick={() => setSelectedMethod(null)}
            className="text-slate-600 hover:text-slate-800 flex items-center space-x-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Terug naar methode selectie</span>
          </button>
          
          <WBSOApplicationForm />
        </div>
      </AppLayout>
    );
  }

  return null;
} 