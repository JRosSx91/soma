import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enSubstances from './locales/en/substances.json';
import esSubstances from './locales/es/substances.json';

import enNeurotransmitterPhases from './locales/en/neurotransmitter-phases.json';
import enNeurotransmitters from './locales/en/neurotransmitters.json';
import enPhases from './locales/en/phases.json';

import esNeurotransmitterPhases from './locales/es/neurotransmitter-phases.json';
import esNeurotransmitters from './locales/es/neurotransmitters.json';
import esPhases from './locales/es/phases.json';

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

import enOrganNarrative from './locales/en/organ-narrative.json';
import esOrganNarrative from './locales/es/organ-narrative.json';

import enAchievements from './locales/en/achievements.json';
import esAchievements from './locales/es/achievements.json';

import enLanding from './locales/en/landing.json';
import esLanding from './locales/es/landing.json';

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
    ns: [
  'common',
  'auth',
  'main',
  'onboarding',
  'organs',
  'substances',
  'neurotransmitter-phases',
  'neurotransmitters',
  'phases',
  'organ-narrative',
  'achievements',
  'landing',
],
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
        'neurotransmitter-phases': enNeurotransmitterPhases,
  neurotransmitters: enNeurotransmitters,
  phases: enPhases,
  'organ-narrative': enOrganNarrative,
  achievements: enAchievements,
  landing: enLanding,
      },
      es: {
        common: esCommon,
        auth: esAuth,
        main: esMain,
        onboarding: esOnboarding,
        organs: esOrgans,
        substances: esSubstances,
        'neurotransmitter-phases': esNeurotransmitterPhases,
  neurotransmitters: esNeurotransmitters,
  phases: esPhases,
  'organ-narrative': esOrganNarrative,
  achievements: esAchievements,
  landing: esLanding,
      },
    },
  });

export default i18n;