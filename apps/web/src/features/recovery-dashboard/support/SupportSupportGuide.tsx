import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";
import { supportBreathingHref } from "./support-strategies.js";
import {
  SUPPORT_GUIDE_ANCHOR_ID,
  SUPPORT_GUIDE_SECTION_IDS,
  emptyGuideChecked,
  supportGuideHelpHref,
  supportGuideStrategiesHref,
  toggleGuideChecked,
  type SupportGuideChecked,
  type SupportGuideSectionId,
} from "./support-guide.js";

interface SupportSupportGuideProps {
  /** Test hook only; production always starts unchecked. */
  initialChecked?: SupportGuideChecked;
}

/**
 * Session-only educational guide. Checkmarks live in React state and are never stored.
 */
export function SupportSupportGuide({
  initialChecked = emptyGuideChecked(),
}: SupportSupportGuideProps = {}) {
  const { t } = useTranslation("support");
  const base = useShellBase();
  const [checked, setChecked] = useState<SupportGuideChecked>(initialChecked);

  const breathingHref = supportBreathingHref(base);
  const strategiesHref = supportGuideStrategiesHref(base);
  const helpHref = supportGuideHelpHref(base);

  const links: Partial<
    Record<SupportGuideSectionId, { href: string; labelKey: string }[]>
  > = {
    moments: [{ href: breathingHref, labelKey: "plan.sections.moments.linkBreathing" }],
    tools: [{ href: strategiesHref, labelKey: "plan.sections.tools.linkStrategies" }],
    professional: [
      { href: helpHref, labelKey: "plan.sections.professional.linkHelp" },
      { href: SUPPORT_TERMS_EMERGENCY_HREF, labelKey: "plan.sections.professional.linkTerms" },
    ],
  };

  const anyChecked = SUPPORT_GUIDE_SECTION_IDS.some((id) => checked[id]);

  return (
    <div id={SUPPORT_GUIDE_ANCHOR_ID} className="mt-5 space-y-4" data-support-guide>
      <p className="text-sm leading-relaxed text-soma-ink-secondary">{t("plan.intro")}</p>
      <p className="text-xs leading-relaxed text-soma-ink-muted" data-support-guide-privacy>
        {t("plan.privacy")}
      </p>

      <ol className="space-y-3">
        {SUPPORT_GUIDE_SECTION_IDS.map((id, index) => {
          const checkboxId = `support-guide-${id}`;
          const sectionLinks = links[id] ?? [];
          return (
            <li
              key={id}
              data-support-guide-section={id}
              className="min-w-0 rounded-xl border border-soma-line bg-soma-raised/20 px-3 py-3"
            >
              <div className="flex gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  data-support-guide-check={id}
                  checked={checked[id]}
                  onChange={() => setChecked((prev) => toggleGuideChecked(prev, id))}
                  className={`${previewFocus} mt-1 h-4 w-4 shrink-0 rounded border-soma-line-strong accent-[rgb(var(--soma-shell-accent))]`}
                />
                <div className="min-w-0 flex-1">
                  <label htmlFor={checkboxId} className="block cursor-pointer">
                    <span className="text-xs font-medium uppercase tracking-wide text-soma-ink-muted">
                      {t("plan.stepLabel", { step: index + 1 })}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold leading-snug text-soma-ink">
                      {t(`plan.sections.${id}.title`)}
                    </span>
                  </label>
                  <p className="mt-1.5 text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`plan.sections.${id}.body`)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-soma-ink-secondary">
                    {t(`plan.sections.${id}.hint`)}
                  </p>
                  {sectionLinks.length > 0 ? (
                    <ul className="mt-2 space-y-1.5">
                      {sectionLinks.map((link) => (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            data-support-guide-link={id}
                            className={`${previewFocus} inline-flex min-h-11 items-center text-sm font-medium text-soma-ink underline-offset-2 hover:underline`}
                          >
                            {t(link.labelKey)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-soma-ink-muted">{t("plan.optional")}</p>
        <button
          type="button"
          data-support-guide-reset
          disabled={!anyChecked}
          onClick={() => setChecked(emptyGuideChecked())}
          className={`${previewFocus} min-h-11 rounded-lg border border-soma-line bg-soma-surface/70 px-3 text-sm font-medium text-soma-ink-secondary enabled:hover:bg-soma-raised/70 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {t("plan.reset")}
        </button>
      </div>
    </div>
  );
}
