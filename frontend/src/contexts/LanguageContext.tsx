'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translation files
import nlMessages from '@/messages/nl.json';
import enMessages from '@/messages/en.json';

export type Locale = 'nl' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get nested object values using dot notation
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Helper function to check if we're in a browser environment
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('nl');

  // Load saved language preference on mount (browser only)
  useEffect(() => {
    if (!isBrowser()) return;
    
    try {
      const savedLocale = localStorage.getItem('wbso-locale') as Locale;
      if (savedLocale && (savedLocale === 'nl' || savedLocale === 'en')) {
        setLocaleState(savedLocale);
      } else {
        // Detect browser language
        const browserLanguage = navigator.language.toLowerCase();
        if (browserLanguage.startsWith('en')) {
          setLocaleState('en');
        }
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
      // Fallback to default 'nl'
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (isBrowser()) {
      try {
        localStorage.setItem('wbso-locale', newLocale);
      } catch (error) {
        console.warn('Failed to save language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    const messages = locale === 'nl' ? nlMessages : enMessages;
    return getNestedValue(messages, key);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 