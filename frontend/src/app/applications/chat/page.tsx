'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// Helper to check if we're in browser
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Dynamic import with complete SSR disabling
const WBSOChatInterface = dynamicImport(() => import('@/components/wbso/WBSOChatInterface'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">WBSO AI Assistent wordt geladen...</p>
      </div>
    </div>
  )
});

// Force dynamic rendering to prevent build-time context issues
export const dynamic = 'force-dynamic';

// Server-safe component that only renders in browser
function AuthenticatedChatPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { user, firebaseUser, loading: authLoading } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until we're in the browser
  if (!isMounted || !isBrowser()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">WBSO AI Assistent wordt geladen...</p>
        </div>
      </div>
    );
  }

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Authenticatie controleren...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !firebaseUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Inloggen vereist
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            U moet ingelogd zijn om de WBSO AI Assistent te gebruiken.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Naar inlogpagina
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Terug
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated chat interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info and language switcher */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-semibold text-gray-900">
                🤖 WBSO AI Assistent
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <div className="text-sm text-gray-600">
                {user.displayName || user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat interface */}
      <div className="max-w-7xl mx-auto py-8">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">WBSO AI Assistent wordt geladen...</p>
              </div>
            </div>
          }>
            <WBSOChatInterface />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default function WBSOChatPage() {
  return <AuthenticatedChatPage />;
} 