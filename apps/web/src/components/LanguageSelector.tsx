import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SupportedLanguage } from '../i18n/index.js';

const LANGUAGES: Array<{ code: SupportedLanguage; iso: string; native: string }> = [
  { code: 'en', iso: 'EN', native: 'English'  },
  { code: 'es', iso: 'ES', native: 'Español'  },
  { code: 'ca', iso: 'CA', native: 'Català'   },
  { code: 'gl', iso: 'GL', native: 'Galego'   },
  { code: 'eu', iso: 'EU', native: 'Euskera'  },
  { code: 'fr', iso: 'FR', native: 'Français' },
  { code: 'it', iso: 'IT', native: 'Italiano' },
  { code: 'de', iso: 'DE', native: 'Deutsch'  },
];

/**
 * Language selector dropdown. Trigger shows the ISO code (compact,
 * fits the header). Dropdown options show the language name in its
 * own language (native label) for accessibility and clarity —
 * especially for regional languages without standard flag emoji.
 *
 * The user's choice is persisted automatically by i18next's
 * LanguageDetector via localStorage (configured in i18n/config.ts).
 */
export function LanguageSelector() {
  const { i18n } = useTranslation();
  const activeLang = i18n.language.split('-')[0] as SupportedLanguage;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === activeLang) ?? LANGUAGES[0];

  const handleSelect = (code: SupportedLanguage) => {
    if (code !== activeLang) {
      void i18n.changeLanguage(code);
    }
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.native}`}
        className="
          flex items-center gap-1
          text-xs text-soma-fg-muted
          hover:text-soma-fg-secondary
          transition-colors
        "
      >
        {active.iso}
        <span className="text-[10px] text-soma-fg-muted" aria-hidden="true">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className="
            absolute right-0 top-full mt-2 z-50
            bg-soma-bg-elevated border border-soma-border-subtle
            rounded shadow-lg
            min-w-[120px]
            py-1
          "
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === activeLang}
              onClick={() => handleSelect(lang.code)}
              className={`
                w-full text-left px-3 py-1.5
                text-xs transition-colors
                flex items-center justify-between gap-4
                ${lang.code === activeLang
                  ? 'text-soma-accent bg-soma-bg-surface'
                  : 'text-soma-fg-secondary hover:text-soma-fg-primary hover:bg-soma-bg-surface'
                }
              `}
            >
              <span>{lang.native}</span>
              <span className="text-soma-fg-muted">{lang.iso}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}