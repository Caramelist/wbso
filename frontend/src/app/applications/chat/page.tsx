import { Suspense } from 'react';
import WBSOChatInterface from '@/components/wbso/WBSOChatInterface';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'WBSO AI Assistent | WBSO Simpel',
  description: 'Creëer uw WBSO-aanvraag met behulp van onze AI-assistent. Eenvoudig, snel en professioneel.',
};

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