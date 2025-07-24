'use client'

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import '@/styles/globals.css';

// MAINTENANCE MODE - Block all routes except home
const MAINTENANCE_MODE = true;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (MAINTENANCE_MODE && pathname !== '/') {
      // Redirect all non-home pages to maintenance page
      router.replace('/');
    }
  }, [pathname, router]);

  return (
    <html lang="nl">
      <head>
        <title>WBSO Simpel - Onderhoud</title>
        <meta name="description" content="WBSO applicatie in onderhoud" />
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body>
        <ErrorBoundary>
          <LanguageProvider>
            <ClientProviders>
              {children}
            </ClientProviders>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 