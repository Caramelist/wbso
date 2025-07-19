'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';
import { locales, type Locale } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const switchLanguage = (newLocale: Locale) => {
    startTransition(() => {
      // Remove the current locale from the pathname
      const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/';
      
      // Navigate to the new locale
      const newPath = newLocale === 'nl' 
        ? pathWithoutLocale === '/' ? '/' : pathWithoutLocale
        : `/${newLocale}${pathWithoutLocale}`;
      
      router.replace(newPath);
      setIsOpen(false);
    });
  };

  const getCurrentLanguageLabel = () => {
    return locale === 'nl' ? t('dutch') : t('english');
  };

  const getLanguageFlag = (lang: Locale) => {
    return lang === 'nl' ? '🇳🇱' : '🇬🇧';
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="mr-2">{getLanguageFlag(locale as Locale)}</span>
        {getCurrentLanguageLabel()}
        <svg
          className={`ml-2 -mr-1 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-36 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                disabled={isPending || lang === locale}
                className={`
                  flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 disabled:opacity-50
                  ${lang === locale ? 'bg-gray-50 text-primary-600' : 'text-gray-700'}
                `}
                role="menuitem"
              >
                <span className="mr-3">{getLanguageFlag(lang)}</span>
                {lang === 'nl' ? t('dutch') : t('english')}
                {lang === locale && (
                  <svg className="ml-auto h-4 w-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 