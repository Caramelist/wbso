import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Dynamic import to prevent SSR issues with contexts
const WBSOChatInterface = dynamic(() => import('@/components/wbso/WBSOChatInterface'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export const metadata = {
  title: 'WBSO AI Assistent | WBSO Simpel',
  description: 'Creëer uw WBSO-aanvraag met behulp van onze AI-assistent. Eenvoudig, snel en professioneel.',
};

// Force dynamic rendering to prevent build-time context issues
export const dynamic = 'force-dynamic';

export default function WBSOChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <WBSOChatInterface />
        </Suspense>
      </div>
    </div>
  );
} 