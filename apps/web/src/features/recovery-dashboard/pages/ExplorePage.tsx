import { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  anatomyExplorerHref,
  anatomyExplorerHrefForOrgan,
} from "../anatomy/anatomy-explorer-query.js";
import { atlasSystems } from "../anatomy/atlas-config.js";
import { narrativeCatalogPairs } from "../anatomy/narrative-catalog.js";
import { recoveryCatalogPairs } from "../anatomy/recovery-catalog.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  atlasOrganFallbackName,
  groupEducationalOrgansByAtlasSystem,
  uniqueOrganIdsForSubstance,
} from "../explore/explore-organs.js";
import {
  localizedCatalogLabel,
  searchHaystackIncludes,
  substanceSearchHaystack,
  systemSearchHaystack,
} from "../explore/explore-search.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { ExploreNeurotransmitters } from "../components/ExploreNeurotransmitters.js";
import { PageHeading } from "../components/PageHeading.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";
import { useSubstances } from "../../substances/index.js";
import type { ApiSubstance } from "../../../shared/api/types.js";

/**
 * Educational explore surface for Soma 2.0.
 * Uses the API substance catalog and the anatomy educational indexes.
 * Does not invent personal recovery estimates from demo figures.
 */
export function ExplorePage() {
  const { t, i18n } = useTranslation("explore");
  const base = useShellBase();
  const { data: substances, loading, error } = useSubstances();
  const [query, setQuery] = useState("");
  const [openSubstance, setOpenSubstance] = useState<ApiSubstance | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);

  const educationalPairs = useMemo(
    () => [...narrativeCatalogPairs(), ...recoveryCatalogPairs()],
    [],
  );

  const filteredSubstances = useMemo(() => {
    if (!substances) return [];
    return substances.filter((item) =>
      searchHaystackIncludes(
        substanceSearchHaystack({
          localizedName: substanceName(t, item.id, item.name),
          localizedDescription: substanceDescription(t, item.id, item.shortDescription),
          catalogName: item.name,
          catalogDescription: item.shortDescription,
          category: item.category,
          categoryLabel: categoryLabel(t, item.category),
        }),
        query,
      ),
    );
  }, [i18n.language, query, substances, t]);

  const filteredSystems = useMemo(() => {
    return atlasSystems.filter((system) =>
      searchHaystackIncludes(
        systemSearchHaystack({
          localizedName: systemName(t, system.id, system.name),
          catalogName: system.name,
          organLabels: system.organs.flatMap((organ) => [
            organName(t, organ.id, organ.name),
            organ.name,
          ]),
        }),
        query,
      ),
    );
  }, [i18n.language, query, t]);

  const openSystem = atlasSystems.find((item) => item.id === openSystemId) ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-6">
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        demo={base === "/preview"}
        aside={
          <label className="relative hidden sm:block">
            <span className="sr-only">{t("searchLabel")}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className={`${previewFocus} w-56 rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
            />
          </label>
        }
      />
      <label className="sm:hidden">
        <span className="sr-only">{t("searchLabel")}</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className={`${previewFocus} w-full rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
        />
      </label>

      {loading ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-8 text-sm text-soma-ink-secondary">
          {t("loading")}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          {t("loadError")}
        </p>
      ) : null}

      {!loading && !error && filteredSubstances.length === 0 && filteredSystems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
          {t("noResults", { query: query.trim() })}
        </p>
      ) : null}

      {filteredSubstances.length > 0 ? (
        <section className="min-w-0">
          <h2 className="text-base font-semibold text-soma-ink">{t("substancesTitle")}</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">{t("substancesHint")}</p>
          <ul className="mt-3 grid grid-cols-2 items-stretch gap-3 md:grid-cols-3 xl:grid-cols-5">
            {filteredSubstances.map((item) => (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpenSubstance(item)}
                  className={`${previewFocus} flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left hover:border-soma-line-strong`}
                >
                  <span className="flex h-36 shrink-0 items-center justify-center bg-[#101820] px-3">
                    <SubstanceIllustration name={item.id} className="h-28 w-full" alt="" />
                  </span>
                  <span className="flex min-h-0 flex-1 flex-col gap-1 p-3">
                    <span className="font-semibold text-soma-ink">
                      {substanceName(t, item.id, item.name)}
                    </span>
                    <span className="text-xs leading-snug text-soma-ink-muted">
                      {substanceDescription(t, item.id, item.shortDescription)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {filteredSystems.length > 0 ? (
        <section className="min-w-0">
          <h2 className="text-base font-semibold text-soma-ink">{t("systemsTitle")}</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">{t("systemsHint")}</p>
          <ul className="mt-3 grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSystems.map((system) => (
              <li key={system.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpenSystemId(system.id)}
                  className={`${previewFocus} flex h-full w-full min-w-0 flex-col rounded-2xl border border-soma-line bg-soma-surface p-4 text-left hover:border-soma-line-strong`}
                >
                  <span className="block font-semibold text-soma-ink">
                    {systemName(t, system.id, system.name)}
                  </span>
                  {system.organs.length === 0 ? (
                    <span className="mt-1 block text-xs leading-snug text-soma-ink-muted">
                      {t("systemEmpty")}
                    </span>
                  ) : (
                    <ul className="mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs leading-snug text-soma-ink-muted">
                      {system.organs.map((organ) => (
                        <li
                          key={organ.id}
                          className="min-w-0 max-w-full break-words after:ml-2 after:text-soma-ink-muted after:content-['·'] last:after:content-none"
                        >
                          {organName(t, organ.id, organ.name)}
                        </li>
                      ))}
                    </ul>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {openSubstance ? (
        <DetailSheet
          title={substanceName(t, openSubstance.id, openSubstance.name)}
          panelClassName="max-w-lg sm:max-w-xl"
          onClose={() => setOpenSubstance(null)}
        >
          <SubstanceDetail
            substance={openSubstance}
            organIds={uniqueOrganIdsForSubstance(openSubstance.id, educationalPairs)}
            base={base}
          />
        </DetailSheet>
      ) : null}

      {openSystem ? (
        <DetailSheet
          title={systemName(t, openSystem.id, openSystem.name)}
          onClose={() => setOpenSystemId(null)}
        >
          <SystemDetail systemId={openSystem.id} base={base} />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function SubstanceDetail({
  substance,
  organIds,
  base,
}: {
  substance: ApiSubstance;
  organIds: readonly string[];
  base: "/app" | "/preview";
}) {
  const { t } = useTranslation("explore");
  const groups = groupEducationalOrgansByAtlasSystem(organIds);
  return (
    <div className="space-y-3 text-sm text-soma-ink-secondary">
      <p>{substanceDescription(t, substance.id, substance.shortDescription)}</p>
      <p>{t("catalogCategory", { category: categoryLabel(t, substance.category) })}</p>
      <ExploreNeurotransmitters substanceId={substance.id} />
      <div className="min-w-0">
        <h3 className="font-medium text-soma-ink">{t("educationalOrgansTitle")}</h3>
        <p className="mt-1 text-xs text-soma-ink-muted">{t("educationalOrgansHint")}</p>
        {organIds.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
            {t("educationalOrgansEmpty")}
          </p>
        ) : (
          <div className="mt-2 space-y-3">
            {groups.map((group) => {
              const headingId = group.systemId ? `explore-organs-${group.systemId}` : undefined;
              const systemFallback =
                atlasSystems.find((item) => item.id === group.systemId)?.name ?? "";
              return (
                <section
                  key={group.systemId ?? "ungrouped"}
                  className="min-w-0"
                  aria-labelledby={headingId}
                >
                  {group.systemId ? (
                    <h4 id={headingId} className="text-xs font-medium text-soma-ink-secondary">
                      {systemName(t, group.systemId, systemFallback)}
                    </h4>
                  ) : null}
                  <ul className={`${group.systemId ? "mt-1" : ""} space-y-1`}>
                    {group.organIds.map((organId) => (
                      <EducationalOrganItem key={organId} organId={organId} base={base} />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </div>
      <p>
        <Link
          to={`${base}/anatomy`}
          className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
        >
          {t("openAnatomy")}
        </Link>
      </p>
    </div>
  );
}

function EducationalOrganItem({
  organId,
  base,
}: {
  organId: string;
  base: "/app" | "/preview";
}) {
  const { t } = useTranslation("explore");
  const fallback = atlasOrganFallbackName(organId) ?? "";
  const label = organName(t, organId, fallback);
  if (!label || label === organId) return null;
  const href = anatomyExplorerHrefForOrgan(base, organId);
  return (
    <li className="min-w-0 max-w-full break-words">
      {href ? (
        <Link
          to={href}
          className={`${previewFocus} inline-block max-w-full break-words text-soma-action hover:text-soma-action-hover`}
        >
          {label}
        </Link>
      ) : (
        <span className="text-soma-ink">{label}</span>
      )}
    </li>
  );
}

function SystemDetail({ systemId, base }: { systemId: string; base: "/app" | "/preview" }) {
  const { t } = useTranslation("explore");
  const system = atlasSystems.find((item) => item.id === systemId);
  if (!system) return null;

  return (
    <div className="space-y-3 text-sm text-soma-ink-secondary">
      {system.organs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
          {t("systemNoOrgans")}
        </p>
      ) : (
        <ul className="space-y-2">
          {system.organs.map((organ) => {
            const href = anatomyExplorerHref(base, systemId, organ.id);
            const label = organName(t, organ.id, organ.name);
            return (
              <li
                key={organ.id}
                className="min-w-0 rounded-xl border border-soma-line bg-soma-surface/60 px-3 py-2 font-medium text-soma-ink"
              >
                <Link
                  to={href}
                  className={`${previewFocus} inline-block max-w-full break-words text-soma-action hover:text-soma-action-hover`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p>
        <Link
          to={anatomyExplorerHref(base, systemId)}
          className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
        >
          {t("viewInAnatomy")}
        </Link>
      </p>
    </div>
  );
}

function substanceName(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(
    t(`${id}.name`, { ns: "substances", defaultValue: fallback }),
    fallback,
    id,
  );
}

function substanceDescription(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(
    t(`${id}.shortDescription`, { ns: "substances", defaultValue: fallback }),
    fallback,
    id,
  );
}

function organName(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(t(id, { ns: "organs", defaultValue: fallback }), fallback, id);
}

function systemName(t: TFunction, id: string, fallback: string): string {
  return localizedCatalogLabel(t(`systems.${id}`, { defaultValue: fallback }), fallback, id);
}

function categoryLabel(t: TFunction, category: string): string {
  return localizedCatalogLabel(
    t(`categories.${category}`, { defaultValue: category }),
    category,
    category,
  );
}
