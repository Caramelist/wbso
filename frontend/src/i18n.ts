import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define supported locales
export const locales = ['nl', 'en'] as const;
export type Locale = typeof locales[number];

// Default locale
export const defaultLocale: Locale = 'nl';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) notFound();

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Europe/Amsterdam',
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        medium: {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: 'EUR'
        }
      }
    }
  };
}); 