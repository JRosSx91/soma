import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English
import enSubstances from './locales/en/substances.json';
import enNeurotransmitterPhases from './locales/en/neurotransmitter-phases.json';
import enNeurotransmitters from './locales/en/neurotransmitters.json';
import enPhases from './locales/en/phases.json';
import enAuth from './locales/en/auth.json';
import enCommon from './locales/en/common.json';
import enMain from './locales/en/main.json';
import enOnboarding from './locales/en/onboarding.json';
import enOrgans from './locales/en/organs.json';
import enOrganNarrative from './locales/en/organ-narrative.json';
import enAchievements from './locales/en/achievements.json';
import enLanding from './locales/en/landing.json';

// Spanish
import esSubstances from './locales/es/substances.json';
import esNeurotransmitterPhases from './locales/es/neurotransmitter-phases.json';
import esNeurotransmitters from './locales/es/neurotransmitters.json';
import esPhases from './locales/es/phases.json';
import esAuth from './locales/es/auth.json';
import esCommon from './locales/es/common.json';
import esMain from './locales/es/main.json';
import esOnboarding from './locales/es/onboarding.json';
import esOrgans from './locales/es/organs.json';
import esOrganNarrative from './locales/es/organ-narrative.json';
import esAchievements from './locales/es/achievements.json';
import esLanding from './locales/es/landing.json';

// Catalan
import caSubstances from './locales/ca/substances.json';
import caNeurotransmitterPhases from './locales/ca/neurotransmitter-phases.json';
import caNeurotransmitters from './locales/ca/neurotransmitters.json';
import caPhases from './locales/ca/phases.json';
import caAuth from './locales/ca/auth.json';
import caCommon from './locales/ca/common.json';
import caMain from './locales/ca/main.json';
import caOnboarding from './locales/ca/onboarding.json';
import caOrgans from './locales/ca/organs.json';
import caOrganNarrative from './locales/ca/organ-narrative.json';
import caAchievements from './locales/ca/achievements.json';
import caLanding from './locales/ca/landing.json';

// Galician
import glSubstances from './locales/gl/substances.json';
import glNeurotransmitterPhases from './locales/gl/neurotransmitter-phases.json';
import glNeurotransmitters from './locales/gl/neurotransmitters.json';
import glPhases from './locales/gl/phases.json';
import glAuth from './locales/gl/auth.json';
import glCommon from './locales/gl/common.json';
import glMain from './locales/gl/main.json';
import glOnboarding from './locales/gl/onboarding.json';
import glOrgans from './locales/gl/organs.json';
import glOrganNarrative from './locales/gl/organ-narrative.json';
import glAchievements from './locales/gl/achievements.json';
import glLanding from './locales/gl/landing.json';

// Basque
import euSubstances from './locales/eu/substances.json';
import euNeurotransmitterPhases from './locales/eu/neurotransmitter-phases.json';
import euNeurotransmitters from './locales/eu/neurotransmitters.json';
import euPhases from './locales/eu/phases.json';
import euAuth from './locales/eu/auth.json';
import euCommon from './locales/eu/common.json';
import euMain from './locales/eu/main.json';
import euOnboarding from './locales/eu/onboarding.json';
import euOrgans from './locales/eu/organs.json';
import euOrganNarrative from './locales/eu/organ-narrative.json';
import euAchievements from './locales/eu/achievements.json';
import euLanding from './locales/eu/landing.json';

// French
import frSubstances from './locales/fr/substances.json';
import frNeurotransmitterPhases from './locales/fr/neurotransmitter-phases.json';
import frNeurotransmitters from './locales/fr/neurotransmitters.json';
import frPhases from './locales/fr/phases.json';
import frAuth from './locales/fr/auth.json';
import frCommon from './locales/fr/common.json';
import frMain from './locales/fr/main.json';
import frOnboarding from './locales/fr/onboarding.json';
import frOrgans from './locales/fr/organs.json';
import frOrganNarrative from './locales/fr/organ-narrative.json';
import frAchievements from './locales/fr/achievements.json';
import frLanding from './locales/fr/landing.json';

// Italian
import itSubstances from './locales/it/substances.json';
import itNeurotransmitterPhases from './locales/it/neurotransmitter-phases.json';
import itNeurotransmitters from './locales/it/neurotransmitters.json';
import itPhases from './locales/it/phases.json';
import itAuth from './locales/it/auth.json';
import itCommon from './locales/it/common.json';
import itMain from './locales/it/main.json';
import itOnboarding from './locales/it/onboarding.json';
import itOrgans from './locales/it/organs.json';
import itOrganNarrative from './locales/it/organ-narrative.json';
import itAchievements from './locales/it/achievements.json';
import itLanding from './locales/it/landing.json';

// German
import deSubstances from './locales/de/substances.json';
import deNeurotransmitterPhases from './locales/de/neurotransmitter-phases.json';
import deNeurotransmitters from './locales/de/neurotransmitters.json';
import dePhases from './locales/de/phases.json';
import deAuth from './locales/de/auth.json';
import deCommon from './locales/de/common.json';
import deMain from './locales/de/main.json';
import deOnboarding from './locales/de/onboarding.json';
import deOrgans from './locales/de/organs.json';
import deOrganNarrative from './locales/de/organ-narrative.json';
import deAchievements from './locales/de/achievements.json';
import deLanding from './locales/de/landing.json';

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
const SUPPORTED_LANGUAGES = ['en', 'es', 'ca', 'gl', 'eu', 'fr', 'it', 'de'] as const;
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
      ca: {
        common: caCommon,
        auth: caAuth,
        main: caMain,
        onboarding: caOnboarding,
        organs: caOrgans,
        substances: caSubstances,
        'neurotransmitter-phases': caNeurotransmitterPhases,
        neurotransmitters: caNeurotransmitters,
        phases: caPhases,
        'organ-narrative': caOrganNarrative,
        achievements: caAchievements,
        landing: caLanding,
      },
      gl: {
        common: glCommon,
        auth: glAuth,
        main: glMain,
        onboarding: glOnboarding,
        organs: glOrgans,
        substances: glSubstances,
        'neurotransmitter-phases': glNeurotransmitterPhases,
        neurotransmitters: glNeurotransmitters,
        phases: glPhases,
        'organ-narrative': glOrganNarrative,
        achievements: glAchievements,
        landing: glLanding,
      },
      eu: {
        common: euCommon,
        auth: euAuth,
        main: euMain,
        onboarding: euOnboarding,
        organs: euOrgans,
        substances: euSubstances,
        'neurotransmitter-phases': euNeurotransmitterPhases,
        neurotransmitters: euNeurotransmitters,
        phases: euPhases,
        'organ-narrative': euOrganNarrative,
        achievements: euAchievements,
        landing: euLanding,
      },
      fr: {
        common: frCommon,
        auth: frAuth,
        main: frMain,
        onboarding: frOnboarding,
        organs: frOrgans,
        substances: frSubstances,
        'neurotransmitter-phases': frNeurotransmitterPhases,
        neurotransmitters: frNeurotransmitters,
        phases: frPhases,
        'organ-narrative': frOrganNarrative,
        achievements: frAchievements,
        landing: frLanding,
      },
      it: {
        common: itCommon,
        auth: itAuth,
        main: itMain,
        onboarding: itOnboarding,
        organs: itOrgans,
        substances: itSubstances,
        'neurotransmitter-phases': itNeurotransmitterPhases,
        neurotransmitters: itNeurotransmitters,
        phases: itPhases,
        'organ-narrative': itOrganNarrative,
        achievements: itAchievements,
        landing: itLanding,
      },
      de: {
        common: deCommon,
        auth: deAuth,
        main: deMain,
        onboarding: deOnboarding,
        organs: deOrgans,
        substances: deSubstances,
        'neurotransmitter-phases': deNeurotransmitterPhases,
        neurotransmitters: deNeurotransmitters,
        phases: dePhases,
        'organ-narrative': deOrganNarrative,
        achievements: deAchievements,
        landing: deLanding,
      },
    },
  });

export default i18n;