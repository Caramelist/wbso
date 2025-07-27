'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    {
      key: 'dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
      href: '/dashboard',
      labelKey: 'navigation.dashboard'
    },
    {
      key: 'applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/applications/new',
      labelKey: 'navigation.applications'
    },
    {
      key: 'company',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      href: '/company/setup',
      labelKey: 'navigation.company'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-slate-800">{t('app.name')}</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-colors group"
            >
              <div className="text-slate-600 group-hover:text-slate-700">
                {item.icon}
              </div>
              {sidebarOpen && (
                <span className="font-medium text-slate-700">{t(item.labelKey)}</span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-200">
          {user ? (
            <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-sm font-medium text-slate-600">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center ${!sidebarOpen && 'px-2'}`}>
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              {sidebarOpen && (
                <span className="text-sm text-slate-500 mt-2 block">
                  {t('demo.authRequired')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {user && (
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                >
                  {t('auth.signOut')}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-slate-50">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-sm border-t border-slate-200 px-6 py-4">
          <div className="text-xs text-slate-500">
            © 2024 WBSO Simpel. Alle rechten voorbehouden.
          </div>
          <div className="flex space-x-4 text-xs">
            <a 
              href="/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Privacybeleid
            </a>
            <a 
              href="/terms-conditions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Algemene Voorwaarden
            </a>
            <a 
              href="mailto:privacy@wbsosimpel.nl"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Privacy Contact
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout; 