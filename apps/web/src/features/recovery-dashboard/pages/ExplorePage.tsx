import { useMemo, useState, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { EducationalNeurotransmitter } from "../anatomy/neurotransmitter-education.js";
import {
  anatomyExplorerHref,
  anatomyExplorerHrefForOrgan,
} from "../anatomy/anatomy-explorer-query.js";
import { atlasSystems } from "../anatomy/atlas-config.js";
import { narrativeCatalogPairs } from "../anatomy/narrative-catalog.js";
import { recoveryCatalogPairs } from "../anatomy/recovery-catalog.js";
import { signalingMarkClassName } from "../anatomy/signaling-presentation.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import {
  pickDailyMessage,
  readDailyMessages,
} from "../dashboard/home-daily-message.js";
import {
  atlasOrganFallbackName,
  groupEducationalOrgansByAtlasSystem,
  uniqueOrganIdsForSubstance,
} from "../explore/explore-organs.js";
import {
  exploreScopes,
  scopeShowsComingSoonPanels,
  scopeShowsNeurotransmitters,
  scopeShowsSubstances,
  scopeShowsSystems,
  type ExploreScope,
} from "../explore/explore-filters.js";
import {
  localizedCatalogLabel,
  neurotransmitterSearchHaystack,
  searchHaystackIncludes,
  substanceSearchHaystack,
  systemSearchHaystack,
} from "../explore/explore-search.js";
import {
  exploreNeurotransmitters,
  featuredExploreNeurotransmitters,
  substancesForEducationalNeurotransmitter,
} from "../explore/explore-neurotransmitters.js";
import {
  exploreMissionsArt,
  exploreProcessArt,
  exploreProcessTopics,
} from "../explore/explore-art.js";
import {
  canExpandExploreList,
  collapseExploreIds,
  exploreSystemCardSources,
  featuredExploreSystemIds,
  firstEducationalSentence,
} from "../explore/explore-systems.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { ExploreNeurotransmitterIndex } from "../components/ExploreNeurotransmitterIndex.js";
import { ExploreNeurotransmitters } from "../components/ExploreNeurotransmitters.js";
import { RecoveryHero } from "../components/RecoveryHero.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";
import { useSubstances } from "../../substances/index.js";
import type { ApiSubstance } from "../../../shared/api/types.js";

const EXPLORE_HERO_IMAGE = "/images/decoration/nature-4.png";
const EXPLORE_HERO_OVERLAY =
  "linear-gradient(90deg, rgb(var(--soma-shell-rail) / 0.72) 0%, rgb(var(--soma-shell-rail) / 0.28) 40%, transparent 72%)";

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
  const [scope, setScope] = useState<ExploreScope>("all");
  const [openSubstance, setOpenSubstance] = useState<ApiSubstance | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);
  const [openNt, setOpenNt] = useState<EducationalNeurotransmitter | null>(null);
  const [showAllSystems, setShowAllSystems] = useState(false);
  const [showAllNeurotransmitters, setShowAllNeurotransmitters] = useState(false);
  const quote = pickDailyMessage(readDailyMessages(t("quotes", { returnObjects: true })));

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

  const filteredNeurotransmitters = useMemo(() => {
    return exploreNeurotransmitters.filter((id) =>
      searchHaystackIncludes(
        neurotransmitterSearchHaystack({
          id,
          localizedName: t(`${id}.name`, { ns: "neurotransmitters", defaultValue: id }),
          localizedDescription: t(`${id}.shortDescription`, {
            ns: "neurotransmitters",
            defaultValue: "",
          }),
          catalogName: id,
          catalogDescription: "",
          relatedLabels: substancesForEducationalNeurotransmitter(id).flatMap((substanceId) => {
            const api = substances?.find((item) => item.id === substanceId);
            return [
              substanceName(t, substanceId, api?.name ?? substanceId),
              api?.name ?? "",
            ];
          }),
        }),
        query,
      ),
    );
  }, [i18n.language, query, substances, t]);

  const showSubstances = scopeShowsSubstances(scope);
  const showSystems = scopeShowsSystems(scope);
  const showNeurotransmitters = scopeShowsNeurotransmitters(scope);
  const showComingSoon = scopeShowsComingSoonPanels(scope, query);
  const visibleSubstances = showSubstances ? filteredSubstances : [];
  const listedSystems = showSystems
    ? collapseExploreIds(
        filteredSystems.map((system) => system.id),
        featuredExploreSystemIds,
        showAllSystems || scope === "systems",
        query,
      )
        .map((id) => filteredSystems.find((system) => system.id === id))
        .filter((system): system is (typeof filteredSystems)[number] => Boolean(system))
    : [];
  const listedNeurotransmitters = showNeurotransmitters
    ? collapseExploreIds(
        filteredNeurotransmitters,
        featuredExploreNeurotransmitters,
        showAllNeurotransmitters || scope === "neurotransmitters",
        query,
      )
    : [];
  const canShowAllSystems = showSystems
    ? canExpandExploreList(
        filteredSystems.length,
        listedSystems.length,
        showAllSystems || scope === "systems",
        query,
      )
    : false;
  const canShowAllNeurotransmitters = showNeurotransmitters
    ? canExpandExploreList(
        filteredNeurotransmitters.length,
        listedNeurotransmitters.length,
        showAllNeurotransmitters || scope === "neurotransmitters",
        query,
      )
    : false;
  const openSystem = atlasSystems.find((item) => item.id === openSystemId) ?? null;
  const hasVisibleResults =
    visibleSubstances.length > 0 ||
    listedSystems.length > 0 ||
    listedNeurotransmitters.length > 0 ||
    showComingSoon;
  const waitingOnSubstances = loading && showSubstances && !query.trim();

  function openSubstanceById(substanceId: string) {
    const match = substances?.find((item) => item.id === substanceId) ?? null;
    setOpenNt(null);
    if (match) setOpenSubstance(match);
  }

  return (
    <div className="flex min-w-0 flex-col gap-8 pb-6">
      <RecoveryHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        quote={quote}
        demo={base === "/preview"}
        imageSrc={EXPLORE_HERO_IMAGE}
        objectPosition="center 48%"
        overlay={EXPLORE_HERO_OVERLAY}
      />

      <div className="flex min-w-0 flex-col gap-3">
        <label className="relative min-w-0">
          <span className="sr-only">{t("searchLabel")}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-soma-ink-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className={`${previewFocus} w-full rounded-full border border-soma-line bg-soma-surface py-2 pr-3 pl-9 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
          />
        </label>
        <ScopeFilter value={scope} onChange={setScope} t={t} />
      </div>

      {waitingOnSubstances ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-8 text-sm text-soma-ink-secondary">
          {t("loading")}
        </p>
      ) : null}

      {error && showSubstances ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          {t("loadError")}
        </p>
      ) : null}

      {!waitingOnSubstances && !hasVisibleResults ? (
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
          {t("noResults", { query: query.trim() || t(`filters.${scope}`) })}
        </p>
      ) : null}

      {visibleSubstances.length > 0 ? (
        <section className="min-w-0">
          <h2 className="text-base font-semibold text-soma-ink">{t("substancesTitle")}</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">{t("substancesHint")}</p>
          <ul className="mt-3 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibleSubstances.map((item) => (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => setOpenSubstance(item)}
                  className={`${previewFocus} flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left hover:border-soma-line-strong`}
                >
                  <span className="flex h-40 shrink-0 items-center justify-center bg-[#101820] px-3">
                    <SubstanceIllustration name={item.id} className="h-32 w-full" alt="" />
                  </span>
                  <span className="flex min-h-0 flex-1 flex-col gap-1 p-3">
                    <span className="font-semibold text-soma-ink">
                      {substanceName(t, item.id, item.name)}
                    </span>
                    <span className="line-clamp-3 text-xs leading-snug text-soma-ink-muted">
                      {substanceDescription(t, item.id, item.shortDescription)}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-soma-action">
                      {t("exploreCta")}
                      <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {listedSystems.length > 0 ? (
        <section id="explore-featured-systems" className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-soma-ink">{t("systemsTitle")}</h2>
              <p className="mt-0.5 text-xs text-soma-ink-muted">{t("systemsHint")}</p>
            </div>
            {canShowAllSystems ? (
              <button
                type="button"
                onClick={() => setShowAllSystems(true)}
                className={`${previewFocus} inline-flex shrink-0 items-center gap-1 text-xs font-medium text-soma-action`}
              >
                {t("systemsSeeAll")}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <ul className="mt-3 grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {listedSystems.map((system) => {
              const sources = exploreSystemCardSources(system.id, system.plates.anterior?.src);
              return (
                <li key={system.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setOpenSystemId(system.id)}
                    className={`${previewFocus} flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left hover:border-soma-line-strong`}
                  >
                    <span className="flex h-28 shrink-0 items-center justify-center bg-[#101820] px-2 sm:h-[7.25rem]">
                      {sources.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          width={320}
                          height={320}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="max-h-[6.25rem] w-auto max-w-full object-contain"
                        />
                      ))}
                    </span>
                    <span className="flex min-h-0 flex-1 flex-col gap-1 p-2.5">
                      <span className="font-semibold leading-snug text-soma-ink">
                        {systemName(t, system.id, system.name)}
                      </span>
                      <span className="text-xs leading-snug text-soma-ink-muted">
                        {systemCardCopy(t, system.id, system.organs.length === 0)}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-1.5 text-xs font-medium text-soma-action">
                        {t("exploreCta")}
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {showComingSoon ? (
        <div id="explore-index-row" className="grid min-w-0 items-stretch gap-3 lg:grid-cols-3">
          <ExploreIndexPanel
            title={t("ntIndexTitle")}
            action={
              canShowAllNeurotransmitters ? (
                <button
                  type="button"
                  onClick={() => setShowAllNeurotransmitters(true)}
                  className={`${previewFocus} inline-flex items-center gap-1 text-xs font-medium text-soma-action`}
                >
                  {t("ntSeeAll")}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null
            }
          >
            {listedNeurotransmitters.length > 0 ? (
              <ExploreNeurotransmitterIndex
                ids={listedNeurotransmitters}
                onOpen={setOpenNt}
              />
            ) : (
              <p className="mt-3 text-xs text-soma-ink-muted">{t("ntIndexNoMatches")}</p>
            )}
          </ExploreIndexPanel>
          <ExploreIndexPanel title={t("processesTitle")}>
            <ul className="mt-2 grid grid-cols-2 gap-1.5 min-[360px]:grid-cols-3">
              {exploreProcessTopics.map((id) => (
                <li key={id} className="min-w-0">
                  <div className="flex h-full min-w-0 flex-col items-center gap-1 rounded-xl border border-soma-line bg-[#101820] px-1 py-2">
                    <span className="flex h-20 w-full items-center justify-center">
                      <img
                        src={exploreProcessArt[id]}
                        alt=""
                        width={120}
                        height={180}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="max-h-full w-auto max-w-full object-contain"
                      />
                    </span>
                    <span className="w-full px-0.5 text-center text-[10px] font-medium leading-snug hyphens-auto text-soma-ink sm:text-[11px]">
                      {t(`processTopics.${id}`)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-center text-[11px] text-soma-ink-muted">{t("processesPreparing")}</p>
          </ExploreIndexPanel>
          <section className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface p-3">
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-2.5">
              <span className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#101820] sm:h-40 lg:h-44">
                <img
                  src={exploreMissionsArt}
                  alt=""
                  width={1024}
                  height={576}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-contain"
                />
              </span>
              <div className="flex min-w-0 flex-col gap-1 text-left">
                <h2 className="text-base font-semibold text-soma-ink">{t("missionsTitle")}</h2>
                <p className="text-xs leading-relaxed text-soma-ink-muted">{t("missionsBlurb")}</p>
                <p className="text-[11px] font-medium text-soma-action">{t("missionsPreparing")}</p>
              </div>
            </div>
          </section>
        </div>
      ) : listedNeurotransmitters.length > 0 ? (
        <section className="@container min-w-0 rounded-2xl border border-soma-line bg-soma-surface p-3">
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
            <h2 className="text-base font-semibold text-soma-ink">{t("ntIndexTitle")}</h2>
            {canShowAllNeurotransmitters ? (
              <button
                type="button"
                onClick={() => setShowAllNeurotransmitters(true)}
                className={`${previewFocus} inline-flex shrink-0 items-center gap-1 text-xs font-medium text-soma-action`}
              >
                {t("ntSeeAll")}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </div>
          <ExploreNeurotransmitterIndex ids={listedNeurotransmitters} onOpen={setOpenNt} />
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

      {openNt ? (
        <DetailSheet
          title={t(`${openNt}.name`, { ns: "neurotransmitters", defaultValue: openNt })}
          onClose={() => setOpenNt(null)}
        >
          <NeurotransmitterDetail
            neurotransmitter={openNt}
            substances={substances ?? []}
            onOpenSubstance={openSubstanceById}
          />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function ExploreIndexPanel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="@container flex h-full min-w-0 flex-col rounded-2xl border border-soma-line bg-soma-surface p-3">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <h2 className="text-base font-semibold text-soma-ink">{title}</h2>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center">{children}</div>
    </section>
  );
}

function ScopeFilter({
  value,
  onChange,
  t,
}: {
  value: ExploreScope;
  onChange: (value: ExploreScope) => void;
  t: TFunction;
}) {
  return (
    <div role="group" aria-label={t("filterLabel")} className="flex min-w-0 flex-wrap gap-2">
      {exploreScopes.map((id) => {
        const selected = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(id)}
            className={`${previewFocus} rounded-full px-3 py-1.5 text-sm ${
              selected
                ? "bg-soma-action text-[#081018]"
                : "bg-soma-surface text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink"
            }`}
          >
            {t(`filters.${id}`)}
          </button>
        );
      })}
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

function NeurotransmitterDetail({
  neurotransmitter,
  substances,
  onOpenSubstance,
}: {
  neurotransmitter: EducationalNeurotransmitter;
  substances: readonly ApiSubstance[];
  onOpenSubstance: (id: string) => void;
}) {
  const { t } = useTranslation(["explore", "neurotransmitters"]);
  const role = t(`neurotransmitters:${neurotransmitter}.shortDescription`, { defaultValue: "" });
  const related = substancesForEducationalNeurotransmitter(neurotransmitter);

  return (
    <div className="space-y-3 text-sm text-soma-ink-secondary">
      <div className="flex items-start gap-2.5">
        <span
          role="img"
          aria-label={t("explore:ntMarkAria", {
            name: t(`neurotransmitters:${neurotransmitter}.name`, { defaultValue: neurotransmitter }),
          })}
          className={`mt-1 h-3 w-3 shrink-0 rounded-full ${signalingMarkClassName(neurotransmitter)}`}
        />
        <p className="min-w-0">{role || t("explore:ntIndexRoleFallback")}</p>
      </div>
      <p className="text-xs leading-relaxed text-soma-ink-muted">{t("explore:ntIndexSheetNotice")}</p>
      <div>
        <h3 className="font-medium text-soma-ink">{t("explore:ntIndexSubstancesTitle")}</h3>
        {related.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
            {t("explore:ntIndexEmpty")}
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {related.map((substanceId) => {
              const api = substances.find((item) => item.id === substanceId);
              const label = substanceName(t, substanceId, api?.name ?? substanceId);
              return (
                <li key={substanceId}>
                  {api ? (
                    <button
                      type="button"
                      onClick={() => onOpenSubstance(substanceId)}
                      className={`${previewFocus} w-full rounded-xl border border-soma-line bg-soma-surface/60 px-3 py-2 text-left font-medium text-soma-action hover:border-soma-line-strong`}
                    >
                      {label}
                    </button>
                  ) : (
                    <span className="block rounded-xl border border-soma-line bg-soma-surface/60 px-3 py-2 font-medium text-soma-ink">
                      {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
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

function systemCardCopy(t: TFunction, id: string, empty: boolean): string {
  const intro = firstEducationalSentence(
    t(`systemIntro.${id}`, { ns: "anatomy", defaultValue: "" }),
  );
  if (intro) return intro;
  return empty ? t("systemEmpty") : "";
}

function categoryLabel(t: TFunction, category: string): string {
  return localizedCatalogLabel(
    t(`categories.${category}`, { defaultValue: category }),
    category,
    category,
  );
}
