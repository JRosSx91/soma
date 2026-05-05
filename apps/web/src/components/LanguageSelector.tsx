import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../i18n/index.js';

const LANGUAGES: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'EN' },
  { code: 'es', label: 'ES' },
];

/**
 * Minimal language toggle. Renders the supported languages as a row
 * of buttons; the active language is highlighted.
 *
 * The user's choice is persisted automatically by i18next's
 * LanguageDetector via localStorage (configured in i18n/config.ts).
 */
export function LanguageSelector() {
  const { i18n } = useTranslation();
  const activeLang = i18n.language.split('-')[0] as SupportedLanguage;

  const changeLanguage = (lang: SupportedLanguage) => {
    if (lang !== activeLang) {
      void i18n.changeLanguage(lang);
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs">
      {LANGUAGES.map((lang, index) => (
        <span key={lang.code} className="flex items-center">
          <button
            onClick={() => changeLanguage(lang.code)}
            className={
              lang.code === activeLang
                ? 'text-soma-accent'
                : 'text-soma-fg-muted hover:text-soma-fg-secondary transition-colors'
            }
            aria-label={`Switch to ${lang.code.toUpperCase()}`}
            aria-current={lang.code === activeLang ? 'true' : undefined}
          >
            {lang.label}
          </button>
          {index < LANGUAGES.length - 1 && (
            <span className="text-soma-fg-muted mx-1.5" aria-hidden>
              ·
            </span>
          )}
        </span>
      ))}
    </div>
  );
}