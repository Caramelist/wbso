import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ClientProviders from '@/components/providers/ClientProviders';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WBSO Simpel - AI-powered WBSO automation platform',
  description: 'Transform weeks of WBSO paperwork into 30 minutes with AI-powered automation for Dutch companies',
  keywords: ['WBSO', 'Netherlands', 'R&D tax credit', 'automation', 'AI'],
  authors: [{ name: 'WBSO Simpel Team' }],
  creator: 'WBSO Simpel',
  publisher: 'WBSO Simpel',
  robots: 'index, follow',
  metadataBase: new URL('https://app.wbsosimpel.nl'),
  openGraph: {
    title: 'WBSO Simpel - AI-powered WBSO automation',
    description: 'Transform weeks of WBSO paperwork into 30 minutes',
    url: 'https://app.wbsosimpel.nl',
    siteName: 'WBSO Simpel',
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WBSO Simpel - AI-powered WBSO automation',
    description: 'Transform weeks of WBSO paperwork into 30 minutes',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#3b82f6',
    'theme-color': '#ffffff',
  },
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="nl" className="h-full">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS prefetch for Firebase and external APIs */}
        <link rel="dns-prefetch" href="//firebaseapp.com" />
        <link rel="dns-prefetch" href="//googleapis.com" />
        <link rel="dns-prefetch" href="//api.kvk.nl" />
        
        {/* Viewport and mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      
      <body className={`${inter.className} h-full antialiased`}>
        <LanguageProvider>
          <ClientProviders>
            <div className="min-h-full">
              {children}
            </div>
          </ClientProviders>
        </LanguageProvider>
        
        {/* Service Worker Registration */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.register('/sw.js');
                }
              `,
            }}
          />
        )}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
} 