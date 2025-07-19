'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();

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

  return (
    <AppLayout>
      <DashboardOverview />
    </AppLayout>
  );
} 