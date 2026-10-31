import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isLegalNoticePublished } from "@soma/shared-types";
import { LanguageSelector } from "../../components/LanguageSelector.js";
import { MAIN_CONTENT_ID, SkipToContent } from "../../components/SkipToContent.js";
import { SomaMark } from "../recovery-dashboard/components/SomaMark.js";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { authLinkClass } from "../auth/components/AuthShell.js";

export type LegalDocumentKind = "notice" | "privacy" | "terms" | "cookies";

const LEGAL_DOCUMENTS: ReadonlyArray<{
  kind: LegalDocumentKind;
  path: string;
}> = [
  { kind: "notice", path: "/legal" },
  { kind: "privacy", path: "/privacy" },
  { kind: "terms", path: "/terms" },
  { kind: "cookies", path: "/cookies" },
];

const NOTICE_SECTIONS = [
  "identity",
  "contact",
  "site",
  "nature",
  "ip",
  "related",
] as const;

const PRIVACY_SECTIONS = [
  "known",
  "identity",
  "purpose",
  "bases",
  "data",
  "special",
  "derived",
  "auth",
  "feedback",
  "processors",
  "transfers",
  "retention",
  "cookies",
  "advertising",
  "age",
  "rights",
  "deletion",
] as const;

const TERMS_SECTIONS = [
  "nature",
  "beta",
  "age",
  "accounts",
  "use",
  "education",
  "modes",
  "estimates",
  "medical",
  "emergency",
  "availability",
  "changes",
  "deletion",
  "advertising",
  "contact",
] as const;

const COOKIES_SECTIONS = [
  "scope",
  "cookie",
  "local",
  "session",
  "memory",
  "third",
  "banner",
] as const;

const SECTIONS: Record<LegalDocumentKind, readonly string[]> = {
  notice: NOTICE_SECTIONS,
  privacy: PRIVACY_SECTIONS,
  terms: TERMS_SECTIONS,
  cookies: COOKIES_SECTIONS,
};

function bodyParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function LegalDocumentPage({ kind }: { kind: LegalDocumentKind }) {
  const { t, i18n } = useTranslation("legal");
  const published = isLegalNoticePublished();
  const ns = kind;
  const sections = SECTIONS[kind];

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
        <nav
          aria-label={t("nav.label")}
          className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm"
        >
          {LEGAL_DOCUMENTS.map((document) => (
            <Link
              key={document.kind}
              to={document.path}
              className={authLinkClass}
              aria-current={document.kind === kind ? "page" : undefined}
            >
              {t(`nav.${document.kind}`)}
            </Link>
          ))}
        </nav>
        <h1 className="mt-6 text-pretty text-3xl font-light tracking-wide text-[#86B7E8]">
          {t(`${ns}.title`)}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-soma-ink-secondary">
          {t(`${ns}.intro`)}
        </p>
        {sections.map((section) => (
          <section
            key={section}
            id={`${kind}-${section}`}
            className="mt-8"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-soma-action">
              {t(`${ns}.${section}Title`)}
            </h2>
            {bodyParagraphs(t(`${ns}.${section}Body`)).map((paragraph, index) => (
              <p
                key={`${section}-${index}`}
                className="mt-2 text-sm leading-relaxed text-soma-ink-secondary"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <p className="mt-10 text-sm text-soma-ink-muted">
          {t("contact")}: {t("pendingContact")}
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

export function LegalNoticePage() {
  return <LegalDocumentPage kind="notice" />;
}

export function PrivacyPage() {
  return <LegalDocumentPage kind="privacy" />;
}

export function TermsPage() {
  return <LegalDocumentPage kind="terms" />;
}

export function CookiesPage() {
  return <LegalDocumentPage kind="cookies" />;
}
