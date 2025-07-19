'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { t, locale } = useLanguage();
  const { signInWithGoogle, user, loading } = useAuth();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-gray-800">{t('app.name')}</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            {t('app.name')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            {t('app.tagline')}
          </p>
          
          {/* Status badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
              🇳🇱 {t('features.dutch')}
            </span>
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
              🤖 {t('features.aiPowered')}
            </span>
            <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
              ⚡ {t('features.fast')}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
              📋 {t('features.wbsoReady')}
            </span>
          </div>

          {/* Demo CTA */}
          <div className="space-y-4">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
            >
              {loading ? t('auth.loading') : user ? t('dashboard.title') : t('auth.signIn')}
            </button>
            <p className="text-sm text-gray-500">
              {user ? t('demo.loggedInAs') + ' ' + user.email : t('demo.authRequired')}
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
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {t('demo.dashboardPreview')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-blue-800">{t('dashboard.totalApplications')}</h3>
                <span className="text-3xl font-bold text-blue-600">12</span>
              </div>
              <p className="text-blue-600 text-sm">+3 {t('demo.thisMonth')}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-800">{t('dashboard.submitted')}</h3>
                <span className="text-3xl font-bold text-green-600">8</span>
              </div>
              <p className="text-green-600 text-sm">{t('demo.approved')}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-yellow-800">{t('dashboard.pendingReview')}</h3>
                <span className="text-3xl font-bold text-yellow-600">4</span>
              </div>
              <p className="text-yellow-600 text-sm">{t('demo.inProgress')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 