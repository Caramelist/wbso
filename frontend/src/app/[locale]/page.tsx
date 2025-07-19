'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations('app');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with language switcher */}
      <header className="flex justify-end p-4">
        <LanguageSwitcher />
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('name')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            {t('tagline')}
          </p>
          <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {t('description')}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                🇳🇱 Nederlands
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                🤖 AI-Powered
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                ⚡ 30 Minutes
              </span>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                📋 WBSO Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 