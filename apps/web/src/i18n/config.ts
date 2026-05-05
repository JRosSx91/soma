import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enSubstances from './locales/en/substances.json';
import esSubstances from './locales/es/substances.json';

import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enMain from './locales/en/main.json';
import enOnboarding from './locales/en/onboarding.json';
import enOrgans from './locales/en/organs.json';

import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esMain from './locales/es/main.json';
import esOnboarding from './locales/es/onboarding.json';
import esOrgans from './locales/es/organs.json';

/**
 * i18next configuration for Soma.
 *
 * - Static imports of translation JSONs (bundled at build time).
 * - LanguageDetector chooses the language by reading, in order:
 *   localStorage > navigator.language > 'en' as fallback.
 * - User's choice is persisted to localStorage so the app remembers
 *   it across sessions.
 * - When a key is missing in the active language, fall back to
 *   English. If still missing, the key string itself is shown
 *   (helpful during development).
 */
const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    debug: import.meta.env.DEV,
    ns: ['common', 'auth', 'main', 'onboarding', 'organs', 'substances'],
    defaultNS: 'common',
    interpolation: {
      // React already escapes by default, no need to double-escape.
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'soma.i18n.lang',
      caches: ['localStorage'],
    },
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        main: enMain,
        onboarding: enOnboarding,
        organs: enOrgans,
        substances: enSubstances,
      },
      es: {
        common: esCommon,
        auth: esAuth,
        main: esMain,
        onboarding: esOnboarding,
        organs: esOrgans,
        substances: esSubstances,
      },
    },
  });

export default i18n;