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
      icon: '📊',
      href: '/dashboard',
      labelKey: 'navigation.dashboard'
    },
    {
      key: 'applications',
      icon: '📋',
      href: '/applications',
      labelKey: 'navigation.applications'
    },
    {
      key: 'company',
      icon: '🏢',
      href: '/company',
      labelKey: 'navigation.company'
    },
    {
      key: 'team',
      icon: '👥',
      href: '/team',
      labelKey: 'navigation.team'
    },
    {
      key: 'settings',
      icon: '⚙️',
      href: '/settings',
      labelKey: 'navigation.settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className={`flex items-center space-x-2 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            {sidebarOpen && (
              <span className="font-semibold text-gray-800">{t('app.name')}</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <span className="text-gray-500">{sidebarOpen ? '←' : '→'}</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors group"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium">{t(item.labelKey)}</span>
              )}
            </a>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          {user ? (
            <div className={`flex items-center space-x-3 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                )}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center ${!sidebarOpen && 'px-2'}`}>
              <span className="text-sm text-gray-500">
                {sidebarOpen ? t('demo.authRequired') : '👤'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {t('dashboard.title')}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {user && (
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {t('auth.signOut')}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout; 