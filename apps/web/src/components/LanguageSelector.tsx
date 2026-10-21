import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  INTERFACE_LANGUAGES,
  resolveInterfaceLanguage,
  type InterfaceLanguage,
} from "../i18n/interface-languages.js";
import { previewFocus } from "../features/recovery-dashboard/focus.js";

const LANGUAGES: Array<{
  code: InterfaceLanguage;
  iso: string;
  native: string;
}> = [
  { code: "es", iso: "ES", native: "Español" },
  { code: "en", iso: "EN", native: "English" },
];

/**
 * Language selector dropdown. Trigger shows the ISO code (compact,
 * fits the header). Dropdown options show the language name in its
 * own language (native label).
 *
 * Only interface languages are listed. Other resource bundles stay
 * registered for editorial work and are not offered here.
 *
 * The user's choice is persisted automatically by i18next's
 * LanguageDetector via localStorage (configured in i18n/config.ts).
 */
interface LanguageSelectorProps {
  /** Sidebar chrome sits at the bottom of the viewport; open upward there. */
  placement?: "up" | "down";
}

export function LanguageSelector({ placement = "down" }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const activeLang = resolveInterfaceLanguage(i18n.language);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = LANGUAGES.find((l) => l.code === activeLang) ?? LANGUAGES[0];

  const handleSelect = (code: InterfaceLanguage) => {
    if (code !== activeLang) {
      void i18n.changeLanguage(code);
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.native}`}
        className={`
          ${previewFocus} rounded-sm
          flex items-center gap-1
          text-xs text-soma-ink-secondary
          hover:text-soma-ink
          transition-colors
        `}
      >
        {active.iso}
        <span className="text-[10px] text-soma-ink-muted" aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select language"
          className={`
            absolute right-0 z-50
            bg-soma-raised border border-soma-line
            rounded-xl shadow-lg
            min-w-[120px]
            py-1
            ${placement === "up" ? "left-0 bottom-full mb-2" : "right-0 top-full mt-2"}
          `}
        >
          {INTERFACE_LANGUAGES.map((code) => {
            const lang = LANGUAGES.find((item) => item.code === code);
            if (!lang) return null;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={lang.code === activeLang}
                onClick={() => handleSelect(lang.code)}
                className={`
                  ${previewFocus}
                  w-full text-left px-3 py-1.5
                  text-xs transition-colors
                  flex items-center justify-between gap-4
                  ${
                    lang.code === activeLang
                      ? "text-soma-action bg-soma-surface"
                      : "text-soma-ink-secondary hover:text-soma-ink hover:bg-soma-surface"
                  }
                `}
              >
                <span>{lang.native}</span>
                <span className="text-soma-ink-muted">{lang.iso}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
