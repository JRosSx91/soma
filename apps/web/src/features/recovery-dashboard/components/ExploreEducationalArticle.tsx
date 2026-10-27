import { useEffect, useRef, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { atlasSystems } from "../anatomy/atlas-config.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  exploreEduRelatedKey,
  exploreEduRelatedSheet,
  exploreEduSectionIds,
  type ExploreEduSheetId,
} from "../explore/explore-edu.js";
import {
  exploreEduAnatomyHref,
  exploreEduAnatomyLinks,
  exploreEduAnatomyLinksVisible,
  type ExploreEduAnatomyDestination,
} from "../explore/explore-edu-anatomy.js";
import { localizedCatalogLabel } from "../explore/explore-search.js";
import { previewFocus } from "../focus.js";

interface ExploreEducationalArticleProps {
  sheetId: ExploreEduSheetId;
  onOpenRelated: (id: ExploreEduSheetId) => void;
  lead?: ReactNode;
  children?: ReactNode;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function asAnalogyBlocks(value: unknown): string[][] {
  if (!Array.isArray(value)) return [];
  return value
    .map((block) => asStringList(block))
    .filter((block) => block.length > 0);
}

/**
 * Long-form educational article for Explorador 2.0.
 * Copy lives in the explore-edu i18n namespace, not in seed models.
 */
export function ExploreEducationalArticle({
  sheetId,
  onOpenRelated,
  lead,
  children,
}: ExploreEducationalArticleProps) {
  const { t } = useTranslation(["explore-edu", "explore"]);
  const articleRef = useRef<HTMLElement>(null);
  const sectionIds = exploreEduSectionIds[sheetId];
  const relatedId = exploreEduRelatedSheet[sheetId];
  const relatedLabel = t(`related.${exploreEduRelatedKey(sheetId)}`);
  const bibliography = asStringList(t(`sheets.${sheetId}.bibliography`, { returnObjects: true }));

  useEffect(() => {
    const scroller = articleRef.current?.closest(".overflow-y-auto");
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0;
    const panel = articleRef.current?.closest("[role='dialog']");
    if (panel instanceof HTMLElement) panel.focus();
  }, [sheetId]);

  return (
    <article
      ref={articleRef}
      className="max-w-prose min-w-0 space-y-6 text-[15px] leading-7 text-soma-ink-secondary"
    >
      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("explore:ntIndexSheetNotice")}</p>
      {lead}

      {sectionIds.map((sectionId) => {
        const title = t(`sheets.${sheetId}.sections.${sectionId}.title`);
        const paragraphs = asStringList(
          t(`sheets.${sheetId}.sections.${sectionId}.paragraphs`, { returnObjects: true }),
        );
        const analogies = asAnalogyBlocks(
          t(`sheets.${sheetId}.sections.${sectionId}.analogies`, {
            returnObjects: true,
            defaultValue: [],
          }),
        );
        return (
          <section key={sectionId} data-edu-section={`${sheetId}.${sectionId}`} className="space-y-3">
            <h3 className="text-base font-semibold text-soma-ink">{title}</h3>
            {paragraphs.map((paragraph, index) => (
              <p key={`${sectionId}-p-${index}`}>{paragraph}</p>
            ))}
            {analogies.map((block, index) => (
              <aside
                key={`${sectionId}-analogy-${index}`}
                data-edu-analogy={`${sheetId}.${sectionId}.${index}`}
                className="rounded-2xl border border-soma-line bg-soma-canvas/55 p-3 sm:p-4"
              >
                <p className="text-sm font-semibold text-soma-ink">{t("analogyHeading")}</p>
                <div className="mt-2 space-y-3 text-sm leading-relaxed sm:text-[15px] sm:leading-7">
                  {block.map((paragraph, paragraphIndex) => (
                    <p key={`${sectionId}-a-${index}-${paragraphIndex}`}>{paragraph}</p>
                  ))}
                </div>
              </aside>
            ))}
          </section>
        );
      })}

      <p>
        <button
          type="button"
          onClick={() => onOpenRelated(relatedId)}
          className={`${previewFocus} text-left font-medium text-soma-action hover:text-soma-action-hover`}
        >
          {relatedLabel}
        </button>
      </p>

      <AnatomyRelatedLinks sheetId={sheetId} />

      {children}

      {bibliography.length > 0 ? (
        <details className="rounded-xl border border-soma-line bg-soma-canvas/40 px-3 py-2">
          <summary className={`${previewFocus} cursor-pointer text-sm font-medium text-soma-ink`}>
            {t("bibliographyTitle")}
          </summary>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-relaxed text-soma-ink-muted">
            {bibliography.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </article>
  );
}

function AnatomyRelatedLinks({ sheetId }: { sheetId: ExploreEduSheetId }) {
  const { t, i18n } = useTranslation(["explore-edu", "explore", "organs"]);
  const base = useShellBase();
  const destinations = exploreEduAnatomyLinks(sheetId);
  if (!exploreEduAnatomyLinksVisible(i18n.resolvedLanguage ?? i18n.language)) return null;
  if (destinations.length === 0) return null;

  const links = destinations.flatMap((destination) => {
    const href = exploreEduAnatomyHref(base, destination);
    const label = anatomyDestinationLabel(destination, t);
    if (!href || !label) return [];
    return [{ href, label, key: anatomyDestinationKey(destination) }];
  });
  if (links.length === 0) return null;

  return (
    <nav
      data-edu-anatomy-links={sheetId}
      aria-label={t("anatomyLinksTitle")}
      className="min-w-0"
    >
      <p className="text-xs font-medium text-soma-ink">{t("anatomyLinksTitle")}</p>
      <ul className="mt-2 space-y-1">
        {links.map((item) => (
          <li key={item.key} className="min-w-0 max-w-full break-words">
            <Link
              to={item.href}
              className={`${previewFocus} inline-block max-w-full break-words text-soma-action hover:text-soma-action-hover`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function anatomyDestinationKey(destination: ExploreEduAnatomyDestination): string {
  return destination.kind === "organ"
    ? `organ:${destination.organId}`
    : `system:${destination.systemId}`;
}

function anatomyDestinationLabel(
  destination: ExploreEduAnatomyDestination,
  t: TFunction,
): string | null {
  if (destination.kind === "organ") {
    const fallback =
      atlasSystems
        .flatMap((system) => system.organs)
        .find((organ) => organ.id === destination.organId)?.name ?? "";
    const label = localizedCatalogLabel(
      t(destination.organId, { ns: "organs", defaultValue: fallback }),
      fallback,
      destination.organId,
    );
    return label || null;
  }
  const fallback = atlasSystems.find((system) => system.id === destination.systemId)?.name ?? "";
  const label = localizedCatalogLabel(
    t(`systems.${destination.systemId}`, { ns: "explore", defaultValue: fallback }),
    fallback,
    destination.systemId,
  );
  return label || null;
}
