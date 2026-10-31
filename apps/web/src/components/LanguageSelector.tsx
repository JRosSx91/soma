import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  INTERFACE_LANGUAGES,
  resolveInterfaceLanguage,
  type InterfaceLanguage,
} from "../i18n/interface-languages.js";
import { previewFocus } from "../features/recovery-dashboard/focus.js";
import { placeAnchoredPanel } from "../features/recovery-dashboard/lib/place-anchored-panel.js";

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
  compact?: boolean;
  floating?: boolean;
}

export function LanguageSelector({
  placement = "down",
  compact = false,
  floating = false,
}: LanguageSelectorProps) {
  const { t, i18n } = useTranslation("common");
  const activeLang = resolveInterfaceLanguage(i18n.language);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const active = LANGUAGES.find((l) => l.code === activeLang) ?? LANGUAGES[0];

  const handleSelect = (code: InterfaceLanguage) => {
    if (code !== activeLang) {
      void i18n.changeLanguage(code);
    }
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!floating || !open || !triggerRef.current || !panelRef.current) return;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    function place() {
      placeAnchoredPanel(trigger, panel, {
        align: "start",
        anchor: "right",
        minHeight: 80,
        width: 160,
      });
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [floating, open, activeLang]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target) ||
        containerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const triggerClass = compact
    ? `${previewFocus} flex h-9 w-9 items-center justify-center rounded-full text-xs text-soma-ink-secondary hover:bg-soma-surface hover:text-soma-ink`
    : floating
      ? `${previewFocus} flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-soma-ink-secondary transition-colors hover:bg-soma-surface hover:text-soma-ink`
      : `${previewFocus} flex items-center gap-1 rounded-sm text-xs text-soma-ink-secondary transition-colors hover:text-soma-ink`;

  const listClass = `
            bg-soma-raised border border-soma-line
            rounded-xl shadow-lg
            min-w-[148px]
            py-1
          `;

  const options = INTERFACE_LANGUAGES.map((code) => {
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
                  flex items-center justify-between gap-3
                  ${
                    lang.code === activeLang
                      ? "text-soma-action bg-soma-surface"
                      : "text-soma-ink-secondary hover:text-soma-ink hover:bg-soma-surface"
                  }
                `}
      >
        <span className="flex min-w-0 items-center gap-2">
          <LanguageFlag code={lang.code} />
          <span>{lang.native}</span>
        </span>
        <span className="text-soma-ink-muted">{lang.iso}</span>
      </button>
    );
  });

  const listbox = (
    <div
      ref={panelRef}
      id={listId}
      role="listbox"
      aria-label={t("language.list")}
      className={
        floating
          ? listClass
          : `${listClass} absolute z-50 ${placement === "up" ? "left-0 bottom-full mb-2" : "right-0 top-full mt-2"}`
      }
    >
      {options}
    </div>
  );

  return (
    <div ref={containerRef} className={floating && !compact ? "w-full" : "relative"}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("language.selector", { language: active.native })}
        title={t("language.selector", { language: active.native })}
        className={triggerClass}
      >
        {compact ? (
          <LanguageFlag code={active.code} />
        ) : floating ? (
          <>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-soma-surface">
              <LanguageFlag code={active.code} />
            </span>
            {active.native}
          </>
        ) : (
          <>
            <LanguageFlag code={active.code} />
            {active.iso}
            <span className="text-[10px] text-soma-ink-muted" aria-hidden="true">
              {open ? "▴" : "▾"}
            </span>
          </>
        )}
      </button>

      {open ? (floating ? createPortal(listbox, document.body) : listbox) : null}
    </div>
  );
}

function LanguageFlag({ code }: { code: InterfaceLanguage }) {
  return (
    <span
      className="relative inline-block h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20"
      aria-hidden="true"
    >
      {code === "es" ? (
        <svg
          viewBox="0 0 21 15"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="21" height="15" fill="#AA151B" />
          <rect y="3.75" width="21" height="7.5" fill="#F1BF00" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 60 30"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="2" />
          <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0 V30 M0 15 H60" stroke="#C8102E" strokeWidth="6" />
        </svg>
      )}
    </span>
  );
}
