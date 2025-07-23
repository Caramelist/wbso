'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { signInWithGoogle, user, loading } = useAuth();

  // Debug: Check Firebase config availability
  const hasFirebaseConfig = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );

  const features = [
    {
      icon: '🤖',
      titleKey: 'features.aiGeneration.title',
      descKey: 'features.aiGeneration.description'
    },
    {
      icon: '⚡',
      titleKey: 'features.fastProcess.title', 
      descKey: 'features.fastProcess.description'
    },
    {
      icon: '👥',
      titleKey: 'features.teamManagement.title',
      descKey: 'features.teamManagement.description'
    },
    {
      icon: '📊',
      titleKey: 'features.tracking.title',
      descKey: 'features.tracking.description'
    }
  ];

  const handleDemoLogin = () => {
    if (!user) {
      signInWithGoogle();
    }
  };

  const handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold text-blue-600">🚀</div>
            <h1 className="text-2xl font-bold text-gray-800">{t('app.name')}</h1>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            {t('app.tagline')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('app.description')}
          </p>

          {/* Success badge - Firebase is working! */}
          {hasFirebaseConfig && (
            <div className="mb-6 inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🔥 Authentication Ready
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={user ? handleGoDashboard : handleDemoLogin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {loading ? t('auth.loading') : user ? t('dashboard.title') : t('auth.signIn')}
            </button>
            <p className="text-sm text-gray-500">
              {user ? t('demo.loggedInAs') + ' ' + user.email : (hasFirebaseConfig ? 'Ready for authentication' : t('demo.authRequired'))}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {t(feature.titleKey)}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Demo Dashboard Preview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {t('demo.dashboardPreview')}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">{t('demo.approved')}</p>
                  <p className="text-3xl font-bold">€127K</p>
                  <p className="text-green-100 text-sm">{t('demo.thisYear')}</p>
                </div>
                <div className="text-4xl opacity-80">✅</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">{t('demo.inProgress')}</p>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-blue-100 text-sm">{t('demo.thisMonth')}</p>
                </div>
                <div className="text-4xl opacity-80">⏳</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Team Members</p>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-purple-100 text-sm">Active</p>
                </div>
                <div className="text-4xl opacity-80">👥</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 