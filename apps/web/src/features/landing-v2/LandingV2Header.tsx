import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "../../components/LanguageSelector.js";
import { SomaMark } from "../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../recovery-dashboard/focus.js";

export function LandingV2Header() {
  const { t } = useTranslation("landing-v2");

  return (
    <header className="relative z-20 h-[var(--landing-v2-header)] border-b border-soma-line/60 bg-[#081018]/90 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className={`${previewFocus} rounded-lg`}
          aria-current="page"
        >
          <SomaMark />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5" aria-label="Primary">
          <Link
            to="/preview"
            className={`${previewFocus} rounded-lg text-sm text-soma-ink-secondary transition-colors hover:text-soma-ink`}
          >
            {t("nav.preview")}
          </Link>
          <Link
            to="/login"
            className={`${previewFocus} rounded-lg text-sm text-soma-ink-secondary transition-colors hover:text-soma-ink`}
          >
            {t("nav.signIn")}
          </Link>
          <LanguageSelector />
        </nav>
      </div>
    </header>
  );
}
