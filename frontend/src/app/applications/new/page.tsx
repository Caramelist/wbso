'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import WBSOApplicationForm from '@/components/wbso/WBSOApplicationForm';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function NewWBSOApplicationPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<'chat' | 'form' | null>(null);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show authentication required message if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('auth.signInToAccess')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('demo.authRequired')}
            </p>
            <a 
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('auth.signIn')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Handle method selection
  const handleMethodSelect = (method: 'chat' | 'form') => {
    if (method === 'chat') {
      // Redirect to chat interface with current URL parameters preserved
      const currentSearch = window.location.search;
      router.push(`/applications/chat${currentSearch}`);
    } else {
      setSelectedMethod(method);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t('wbso.newApplication')}
              </h1>
              <p className="opacity-90">
                {selectedMethod === null 
                  ? 'Kies hoe u uw WBSO-aanvraag wilt maken'
                  : t('wbso.newApplicationSubtitle')
                }
              </p>
            </div>
            <div className="text-6xl opacity-80">
              {selectedMethod === null ? '🚀' : '📋'}
            </div>
          </div>
        </div>

        {/* Method Selection or Form */}
        {selectedMethod === null ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* AI Chat Option */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  AI Assistent (Nieuw!)
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Chat met onze WBSO-expert AI die u stap voor stap begeleidt. 
                  Ideaal voor beginners en voor wie een gepersonaliseerde ervaring wil.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Gepersonaliseerde begeleiding</span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Realtime hulp en uitleg</span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Automatische kwaliteitscontrole</span>
                  </div>
                  <div className="flex items-center text-sm text-blue-700">
                    <span className="mr-2">🔥</span>
                    <span>Geschikt voor alle ervaringsniveaus</span>
                  </div>
                </div>

                <button
                  onClick={() => handleMethodSelect('chat')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Start AI Chat
                </button>
              </div>
            </div>

            {/* Traditional Form Option */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-transparent hover:border-gray-400 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Traditionele Formulier
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Het bekende formulier voor wie precies weet wat ze willen invullen. 
                  Sneller als u alle informatie al voorbereid heeft.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Vertrouwd formulier interface</span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Alle velden in één overzicht</span>
                  </div>
                  <div className="flex items-center text-sm text-green-700">
                    <span className="mr-2">✅</span>
                    <span>Geschikt voor ervaren gebruikers</span>
                  </div>
                  <div className="flex items-center text-sm text-orange-700">
                    <span className="mr-2">⚡</span>
                    <span>Sneller als u alles vooraf weet</span>
                  </div>
                </div>

                <button
                  onClick={() => handleMethodSelect('form')}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Gebruik Formulier
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Back button */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setSelectedMethod(null)}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 text-sm"
              >
                <span>←</span>
                <span>Terug naar methode selectie</span>
              </button>
            </div>
            
            {/* WBSO Form */}
            <WBSOApplicationForm />
          </>
        )}
      </div>
    </AppLayout>
  );
} 