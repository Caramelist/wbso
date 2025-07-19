import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Don't prefix the default locale
  localePrefix: 'as-needed',

  // Detect locale from:
  // 1. URL pathname
  // 2. Accept-Language header
  // 3. Cookie
  localeDetection: true,

  // Alternative hosts for different locales (optional)
  // domains: [
  //   {
  //     domain: 'app.wbsosimpel.nl',
  //     defaultLocale: 'nl'
  //   },
  //   {
  //     domain: 'app.wbsosimple.com',
  //     defaultLocale: 'en'
  //   }
  // ]
});

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(nl|en)/:path*',

    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
}; 