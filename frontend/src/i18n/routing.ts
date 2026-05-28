import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['pl', 'en'],

  // Used when no locale matches
  defaultLocale: 'pl',
  
  // Always show locale prefix in URL
  localePrefix: 'always',
  
  // Localized pathnames (folder names stay in English!)
  pathnames: {
    '/': {
      pl: '/',
      en: '/',
    },
    '/login': {
      pl: '/logowanie',
      en: '/login',
    },
    '/register': {
      pl: '/rejestracja',
      en: '/register',
    },
    '/register/client': {
      pl: '/rejestracja/klient',
      en: '/register/client',
    },
    '/register/instructor': {
      pl: '/rejestracja/instruktor',
      en: '/register/instructor',
    },
    '/dashboard': {
      pl: '/panel',
      en: '/dashboard',
    },
    '/dashboard/profile': {
      pl: '/panel/profil',
      en: '/dashboard/profile',
    },
    '/dashboard/profile/edit': {
      pl: '/panel/profil/edycja',
      en: '/dashboard/profile/edit',
    },
    '/dashboard/profile/preview': {
      pl: '/panel/profil/podglad',
      en: '/dashboard/profile/preview',
    },
    '/dashboard/settings': {
      pl: '/panel/ustawienia',
      en: '/dashboard/settings',
    },
    '/dashboard/calendar': {
      pl: '/panel/kalendarz',
      en: '/dashboard/calendar',
    },
    '/instructors': {
      pl: '/instruktorzy',
      en: '/instructors',
    },
    '/instructors/[username]': {
      pl: '/instruktorzy/[username]',
      en: '/instructors/[username]',
    },
    '/instructors/[username]/book': {
      pl: '/instruktorzy/[username]/rezerwacja',
      en: '/instructors/[username]/book',
    },
    '/how-it-works': {
      pl: '/jak-to-dziala',
      en: '/how-it-works',
    },
    '/pricing': {
      pl: '/cennik',
      en: '/pricing',
    },
    '/help': {
      pl: '/pomoc',
      en: '/help',
    },
    '/contact': {
      pl: '/kontakt',
      en: '/contact',
    },
    '/faq': {
      pl: '/faq',
      en: '/faq',
    },
    '/safety': {
      pl: '/bezpieczenstwo',
      en: '/safety',
    },
    '/privacy': {
      pl: '/polityka-prywatnosci',
      en: '/privacy',
    },
    '/terms': {
      pl: '/regulamin',
      en: '/terms',
    },
    '/cookies': {
      pl: '/polityka-cookies',
      en: '/cookies',
    },
  },
});

export type Locale = (typeof routing.locales)[number];

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
