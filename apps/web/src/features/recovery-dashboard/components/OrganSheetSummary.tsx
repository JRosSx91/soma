import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import type { AnatomySource } from "../anatomy/anatomy-education.js";
import {
  anatomyOrganEducationCopy,
  anatomySystemEducationCopy,
  localizeAnatomyCitation,
} from "../anatomy/present-anatomy-education.js";
import { presentAnatomySource } from "../anatomy/present-catalog-reference.js";
import type { OrganAnatomicalSheet } from "../anatomy/organ-sheet.js";
import type { SystemAnatomicalSheet } from "../anatomy/system-sheet.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  exploreEduSheetForOrgan,
  exploreEduSheetForSystem,
} from "../explore/explore-edu-anatomy.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import type { ExploreEduSheetId } from "../explore/explore-edu.js";

/**
 * Resumen tab content for an atlas organ sheet.
 * Renders education when present; otherwise explicit empty states.
 * Does not invent prose, plates, narratives, or recovery figures.
 */
export function OrganSheetSummary({
  sheet,
  intro,
  onEffects,
  onRecovery,
}: {
  sheet: OrganAnatomicalSheet;
  /** System/organ-specific lead sentence from the explorer. */
  intro: string;
  onEffects: () => void;
  onRecovery: () => void;
}) {
  const { t } = useTranslation("anatomy");
  const { availability, education } = sheet;
  const copy = education ? anatomyOrganEducationCopy(t, sheet.organId) : null;
  const hasEffectsContent = availability.hasNarratives || availability.hasEducationalSignaling;

  return (
    <div className="space-y-3">
      <p>{intro}</p>

      {!availability.hasPlate ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs text-soma-ink-muted">
          {t("noPlateYet")}
        </p>
      ) : null}

      {education ? (
        <div className="space-y-3">
          {copy?.location ? <AnatomyNote title={t("location")} text={copy.location} /> : null}
          {copy?.anatomy ? <AnatomyNote title={t("anatomy")} text={copy.anatomy} /> : null}
          {copy?.physiology ? <AnatomyNote title={t("function")} text={copy.physiology} /> : null}
          {copy?.relations ? <AnatomyNote title={t("relations")} text={copy.relations} /> : null}
          {education.sources.length > 0 ? <AnatomySourceList sources={education.sources} /> : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs leading-relaxed text-soma-ink-muted">
          {t("noAnatomyEducation")}
        </p>
      )}

      <EducationalArticleLink sheetId={exploreEduSheetForOrgan(sheet.organId)} />

      <AvailabilityNotes sheet={sheet} />

      {hasEffectsContent || availability.hasRecoveryCurves ? (
        <div className="flex flex-wrap gap-3">
          {hasEffectsContent ? (
            <button
              type="button"
              onClick={onEffects}
              className={`${previewFocus} text-xs text-soma-action hover:text-soma-action-hover`}
            >
              {t("viewEffects")}
            </button>
          ) : null}
          {availability.hasRecoveryCurves ? (
            <button
              type="button"
              onClick={onRecovery}
              className={`${previewFocus} text-xs text-soma-action hover:text-soma-action-hover`}
            >
              {t("viewRecovery")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * System-level resumen when no organ is selected.
 * Renders system education when present; does not invent organ sheets.
 */
export function SystemSheetSummary({
  intro,
  sheet,
}: {
  intro: string;
  sheet: SystemAnatomicalSheet;
}) {
  const { t } = useTranslation("anatomy");
  const { education, emptySystem, availability } = sheet;
  const copy = education ? anatomySystemEducationCopy(t, sheet.systemId) : null;

  return (
    <div className="space-y-3">
      <p>{intro}</p>
      {emptySystem ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs text-soma-ink-muted">
          {t("emptySystemCatalog")}
        </p>
      ) : null}

      {education ? (
        <div className="space-y-3">
          {copy?.location ? <AnatomyNote title={t("location")} text={copy.location} /> : null}
          {copy?.anatomy ? <AnatomyNote title={t("anatomy")} text={copy.anatomy} /> : null}
          {copy?.physiology ? <AnatomyNote title={t("function")} text={copy.physiology} /> : null}
          {copy?.relations ? <AnatomyNote title={t("relations")} text={copy.relations} /> : null}
          {education.sources.length > 0 ? <AnatomySourceList sources={education.sources} /> : null}
        </div>
      ) : emptySystem ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs leading-relaxed text-soma-ink-muted">
          {t("noSystemAnatomy")}
        </p>
      ) : null}

      {emptySystem ? (
        <ul className="space-y-1 text-[11px] leading-relaxed text-soma-ink-muted">
          {!availability.hasNarratives ? <li>{t("systemNoNarratives")}</li> : null}
          {!availability.hasRecoveryCurves ? <li>{t("systemNoCurves")}</li> : null}
        </ul>
      ) : null}

      <EducationalArticleLink sheetId={exploreEduSheetForSystem(sheet.systemId)} />
    </div>
  );
}

function EducationalArticleLink({ sheetId }: { sheetId: ExploreEduSheetId | null }) {
  const { t } = useTranslation("explore-edu");
  const base = useShellBase();
  if (!sheetId) return null;
  const href = exploreEduHref(base, sheetId);
  const label = t(`anatomyToArticle.${sheetId}`, { defaultValue: "" });
  if (!href || !label || label === `anatomyToArticle.${sheetId}`) return null;
  return (
    <p className="min-w-0 max-w-full">
      <Link
        to={href}
        data-edu-from-anatomy={sheetId}
        className={`${previewFocus} inline-block max-w-full break-words text-xs text-soma-action hover:text-soma-action-hover`}
      >
        {label}
      </Link>
    </p>
  );
}

function AvailabilityNotes({ sheet }: { sheet: OrganAnatomicalSheet }) {
  const { t } = useTranslation("anatomy");
  const { availability } = sheet;
  const notes: string[] = [];

  if (!availability.hasNarratives && availability.hasEducationalSignaling) {
    notes.push(t("signalingInEffectsHint"));
  } else if (!availability.hasNarratives && !availability.hasEducationalSignaling) {
    notes.push(t("noEducationalEffects"));
  }
  if (!availability.hasRecoveryCurves) {
    notes.push(t("noRecoveryCurve"));
  }

  if (notes.length === 0) return null;

  return (
    <ul className="space-y-1 text-[11px] leading-relaxed text-soma-ink-muted">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

function AnatomyNote({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-1">
      <h3 className="text-xs font-semibold text-soma-ink">{title}</h3>
      <p>{text}</p>
    </section>
  );
}

function AnatomySourceList({ sources }: { sources: readonly AnatomySource[] }) {
  const { t } = useTranslation("anatomy");

  return (
    <div>
      <h3 className="text-xs font-semibold text-soma-ink">{t("sources")}</h3>
      <ul className="mt-1 space-y-1">
        {        sources.map((source) => {
          const presented = presentAnatomySource({
            ...source,
            citation: localizeAnatomyCitation(source.citation, t),
          });
          return (
            <li key={source.href} className="text-[11px] leading-relaxed text-soma-ink-muted">
              {presented.useVerifiedLinkStyle ? (
                <a
                  href={presented.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
                >
                  {presented.citation}
                </a>
              ) : (
                <span>
                  {presented.href ? (
                    <a
                      href={presented.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`${previewFocus} underline decoration-soma-line`}
                    >
                      {presented.citation}
                    </a>
                  ) : (
                    presented.citation
                  )}
                  <span className="mt-0.5 block">{t("anatomySourceUnverified")}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
