import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isLegalNoticePublished } from "@soma/shared-types";
import { LanguageSelector } from "../../components/LanguageSelector.js";
import { MAIN_CONTENT_ID, SkipToContent } from "../../components/SkipToContent.js";
import { SomaMark } from "../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { authLinkClass } from "../auth/components/AuthShell.js";

const PRIVACY_SECTIONS = [
  "known",
  "identity",
  "purpose",
  "data",
  "special",
  "processors",
  "transfers",
  "retention",
  "cookies",
  "advertising",
  "age",
  "rights",
  "deletion",
  "bases",
] as const;

const TERMS_SECTIONS = [
  "nature",
  "limits",
  "medical",
  "access",
  "age",
  "accounts",
  "advertising",
  "changes",
  "deletion",
  "use",
  "contact",
] as const;

export function LegalDocumentPage({ kind }: { kind: "privacy" | "terms" }) {
  const { t, i18n } = useTranslation("legal");
  const published = isLegalNoticePublished();
  const ns = kind;
  const sections = kind === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  useEffect(() => {
    const previous = document.title;
    document.title = t(`${ns}.metaTitle`);
    return () => {
      document.title = previous;
    };
  }, [ns, t, i18n.language]);

  return (
    <div className="min-h-svh bg-[#081018] text-soma-ink">
      <SkipToContent />
      <header className="h-[3.75rem] border-b border-soma-line/60 bg-[#081018]/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className={`${previewFocus} rounded-lg`}>
            <SomaMark />
          </Link>
          <LanguageSelector />
        </div>
      </header>
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14"
      >
        {published ? null : (
          <p
            className="rounded-xl border border-soma-line-strong bg-[#0c1a26] px-4 py-3 text-sm leading-relaxed text-soma-ink-secondary"
            role="status"
          >
            {t("draftBanner")}
          </p>
        )}
        <h1 className="mt-6 text-pretty text-3xl font-light tracking-wide text-[#86B7E8]">
          {t(`${ns}.title`)}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-soma-ink-secondary">
          {t(`${ns}.intro`)}
        </p>
        {sections.map((section) => (
          <section key={section} className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-soma-action">
              {t(`${ns}.${section}Title`)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-soma-ink-secondary">
              {t(`${ns}.${section}Body`)}
            </p>
          </section>
        ))}
        <p className="mt-10 text-sm text-soma-ink-muted">
          {t("contact")}:{" "}
          <a className={authLinkClass} href="mailto:soma.recovery.app@gmail.com">
            soma.recovery.app@gmail.com
          </a>
        </p>
        <p className="mt-6 text-sm">
          <Link to="/" className={authLinkClass}>
            {t("home")}
          </Link>
        </p>
      </main>
    </div>
  );
}

export function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" />;
}

export function TermsPage() {
  return <LegalDocumentPage kind="terms" />;
}
