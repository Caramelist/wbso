'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamicImport from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

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
function ChatPageContent() {
  const [isMounted, setIsMounted] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
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
  return <ChatPageContent />;
} 