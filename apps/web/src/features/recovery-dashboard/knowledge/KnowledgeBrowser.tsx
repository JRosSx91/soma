import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resolveInterfaceLanguage } from "../../../i18n/interface-languages.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { PageHeading } from "../components/PageHeading.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import {
  createKnowledgeCatalogIndexes,
  incomingRelations,
  outgoingRelations,
} from "./knowledge-catalog.js";
import {
  EMPTY_KNOWLEDGE_FILTERS,
  filterKnowledgeConcepts,
  KNOWLEDGE_CONCEPT_QUERY_KEY,
  KNOWLEDGE_FILTER_ALL,
  knowledgeFilterOptions,
  resolveKnowledgeConceptParam,
  sanitizeKnowledgeSearchParams,
  writeKnowledgeConceptSearchParams,
} from "./knowledge-browser-model.js";
import { resolveKnowledgeBinding } from "./knowledge-bindings.js";
import { KnowledgeContextMap } from "./KnowledgeContextMap.js";
import type {
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgePredicate,
  KnowledgeRelation,
  KnowledgeCatalog,
  PublicKnowledgeCatalog,
} from "./knowledge-types.js";

export function KnowledgeBrowser({
  catalog,
}: {
  catalog: PublicKnowledgeCatalog;
}) {
  const { t, i18n } = useTranslation("knowledge");
  const base = useShellBase();
  const language = resolveInterfaceLanguage(i18n.resolvedLanguage ?? i18n.language);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(EMPTY_KNOWLEDGE_FILTERS);
  const conceptParam = searchParams.get(KNOWLEDGE_CONCEPT_QUERY_KEY);
  const selectedId = resolveKnowledgeConceptParam(catalog, conceptParam);
  const invalidSelection = conceptParam !== null && selectedId === null;
  const indexes = useMemo(() => createKnowledgeCatalogIndexes(catalog), [catalog]);
  const options = useMemo(() => knowledgeFilterOptions(catalog), [catalog]);
  const results = useMemo(
    () => filterKnowledgeConcepts(catalog, filters, language),
    [catalog, filters, language],
  );
  const selected = selectedId ? indexes.conceptsById.get(selectedId) ?? null : null;

  useEffect(() => {
    const sanitized = sanitizeKnowledgeSearchParams(searchParams, catalog);
    if (sanitized.toString() === searchParams.toString()) return;
    setSearchParams(sanitized, { replace: true });
  }, [catalog, searchParams, setSearchParams]);

  function selectConcept(id: KnowledgeConceptId | null) {
    setSearchParams(
      (current) => writeKnowledgeConceptSearchParams(current, id, catalog),
      { replace: true },
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 pb-6">
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        demo={base === "/preview"}
      />

      {invalidSelection ? (
        <p role="status" className="rounded-xl border border-soma-line px-4 py-3 text-sm text-soma-ink-secondary">
          {t("invalidConcept")}
        </p>
      ) : null}

      {catalog.concepts.length === 0 ? (
        <section
          aria-labelledby="knowledge-unavailable-title"
          className="rounded-2xl border border-dashed border-soma-line bg-soma-surface/70 px-5 py-8"
        >
          <h2 id="knowledge-unavailable-title" className="text-base font-semibold text-soma-ink">
            {t("unavailableTitle")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-soma-ink-secondary">
            {t("unavailableBody")}
          </p>
        </section>
      ) : (
        <>
          <KnowledgeFilters
            filters={filters}
            options={options}
            onChange={setFilters}
          />
          <section aria-labelledby="knowledge-results-title" className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="knowledge-results-title" className="text-base font-semibold text-soma-ink">
                {t("resultsTitle")}
              </h2>
              <p aria-live="polite" className="text-xs text-soma-ink-muted">
                {t("resultsCount", { count: results.length })}
              </p>
            </div>
            {results.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
                {t("noResults")}
              </p>
            ) : (
              <ul className="mt-3 grid min-w-0 gap-3 md:grid-cols-2">
                {results.map((concept) => {
                  const active = concept.id === selectedId;
                  return (
                    <li key={concept.id} className="min-w-0">
                      <button
                        type="button"
                        aria-current={active ? "true" : undefined}
                        onClick={() => selectConcept(concept.id)}
                        className={`${previewFocus} flex h-full w-full min-w-0 items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors motion-reduce:transition-none ${
                          active
                            ? "border-soma-action bg-soma-raised/60"
                            : "border-soma-line bg-soma-surface hover:border-soma-line-strong"
                        }`}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-soma-ink">
                            {concept.labels[language]}
                          </span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-soma-ink-secondary">
                            {concept.definition[language]}
                          </span>
                          <span className="mt-2 block text-[11px] text-soma-ink-muted">
                            {vocabularyLabel(t, "ontologyTypes", concept.ontologyType)}
                          </span>
                        </span>
                        <ChevronRight aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-soma-action" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}

      {selected ? (
        <DetailSheet
          title={selected.labels[language]}
          size="article"
          onClose={() => selectConcept(null)}
        >
          <KnowledgeConceptDetail
            concept={selected}
            catalog={catalog}
            language={language}
            onSelect={selectConcept}
          />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function KnowledgeFilters({
  filters,
  options,
  onChange,
}: {
  filters: typeof EMPTY_KNOWLEDGE_FILTERS;
  options: ReturnType<typeof knowledgeFilterOptions>;
  onChange: (next: typeof EMPTY_KNOWLEDGE_FILTERS) => void;
}) {
  const { t } = useTranslation("knowledge");
  return (
    <section aria-labelledby="knowledge-filters-title" className="rounded-2xl border border-soma-line bg-soma-surface p-4">
      <h2 id="knowledge-filters-title" className="text-sm font-semibold text-soma-ink">
        {t("filters.title")}
      </h2>
      <label className="relative mt-3 block min-w-0">
        <span className="sr-only">{t("searchLabel")}</span>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soma-ink-muted" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder={t("searchPlaceholder")}
          className={`${previewFocus} min-h-11 w-full rounded-xl border border-soma-line bg-soma-canvas py-2 pl-9 pr-3 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
        />
      </label>
      <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
        <KnowledgeSelect
          label={t("filters.family")}
          value={filters.family}
          values={options.families}
          vocabulary="families"
          onChange={(family) => onChange({ ...filters, family })}
        />
        <KnowledgeSelect
          label={t("filters.stratum")}
          value={filters.stratum}
          values={options.strata}
          vocabulary="strata"
          onChange={(stratum) => onChange({ ...filters, stratum })}
        />
        <KnowledgeSelect
          label={t("filters.ontologyType")}
          value={filters.ontologyType}
          values={options.ontologyTypes}
          vocabulary="ontologyTypes"
          onChange={(ontologyType) => onChange({ ...filters, ontologyType })}
        />
      </div>
    </section>
  );
}

function KnowledgeSelect({
  label,
  value,
  values,
  vocabulary,
  onChange,
}: {
  label: string;
  value: string;
  values: readonly string[];
  vocabulary: "families" | "strata" | "ontologyTypes";
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation("knowledge");
  return (
    <label className="min-w-0 text-xs font-medium text-soma-ink-secondary">
      <span className="mb-1 block">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${previewFocus} min-h-11 w-full min-w-0 rounded-xl border border-soma-line bg-soma-canvas px-3 py-2 text-sm text-soma-ink`}
      >
        <option value={KNOWLEDGE_FILTER_ALL}>{t("filters.all")}</option>
        {values.map((option) => (
          <option key={option} value={option}>
            {vocabularyLabel(t, vocabulary, option)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function KnowledgeConceptDetail({
  concept,
  catalog,
  language,
  onSelect,
  illustration,
  devFixture,
}: {
  concept: KnowledgeConcept;
  catalog: KnowledgeCatalog;
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
  illustration?: ReactNode;
  devFixture?: { code: string; codeLabel: string; note: string };
}) {
  const { t } = useTranslation("knowledge");
  const base = useShellBase();
  const bodyRef = useRef<HTMLDivElement>(null);
  const indexes = useMemo(() => createKnowledgeCatalogIndexes(catalog), [catalog]);
  const outgoing = outgoingRelations(indexes, concept.id);
  const incoming = incomingRelations(indexes, concept.id);
  const prerequisites = indexes.prerequisitesByConceptId.get(concept.id) ?? [];
  const bindings = concept.bindings
    .map((binding) => resolveKnowledgeBinding(binding, base))
    .filter((binding): binding is NonNullable<typeof binding> => Boolean(binding));

  useEffect(() => {
    bodyRef.current?.closest<HTMLElement>("[role='dialog']")?.focus();
  }, [concept.id]);

  return (
    <div ref={bodyRef} className="space-y-5" data-knowledge-concept={concept.id}>
      {illustration ? (
        <div className="overflow-hidden rounded-xl border border-soma-line bg-soma-canvas">
          {illustration}
        </div>
      ) : concept.illustration ? (
        <section
          aria-labelledby={`knowledge-illustration-${concept.id}`}
          data-knowledge-illustration={concept.illustration.kind}
          className="rounded-xl border border-dashed border-soma-line bg-gradient-to-br from-soma-canvas to-soma-raised/40 p-4"
        >
          <h3 id={`knowledge-illustration-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.futureIllustration")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">
            {t("detail.futureIllustrationBody")}
          </p>
        </section>
      ) : null}
      <p className="break-words text-sm leading-relaxed text-soma-ink-secondary">
        {concept.definition[language]}
      </p>

      {concept.explanation ? (
        <section aria-labelledby={`knowledge-explanation-${concept.id}`}>
          <h3 id={`knowledge-explanation-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.explanation")}
          </h3>
          <p className="mt-2 break-words text-sm leading-7 text-soma-ink-secondary">
            {concept.explanation[language]}
          </p>
        </section>
      ) : null}

      {concept.example ? (
        <section aria-labelledby={`knowledge-example-${concept.id}`}>
          <h3 id={`knowledge-example-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.example")}
          </h3>
          <blockquote className="mt-2 break-words rounded-xl border-l-2 border-soma-action bg-soma-canvas/60 px-4 py-3 text-sm leading-7 text-soma-ink-secondary">
            {concept.example[language]}
          </blockquote>
        </section>
      ) : null}

      {concept.clarifications && concept.clarifications.length > 0 ? (
        <section aria-labelledby={`knowledge-clarifications-${concept.id}`} className="rounded-xl border border-soma-line bg-soma-raised/30 p-4">
          <h3 id={`knowledge-clarifications-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.clarifications")}
          </h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-soma-ink-secondary">
            {concept.clarifications.map((clarification, index) => (
              <li key={`${concept.id}:clarification:${index}`} className="break-words">
                {clarification[language]}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {devFixture ? (
        <dl className="grid gap-3 rounded-xl border border-dashed border-soma-warning/40 bg-soma-canvas/40 p-3" data-knowledge-dev-fixture="true">
          <Metadata label={devFixture.codeLabel} value={devFixture.code} />
          <p className="text-xs leading-relaxed text-soma-ink-muted">{devFixture.note}</p>
        </dl>
      ) : (
        <dl className="grid gap-3 rounded-xl border border-soma-line bg-soma-canvas/40 p-3 sm:grid-cols-2">
          <Metadata label={t("detail.type")} value={vocabularyLabel(t, "ontologyTypes", concept.ontologyType)} />
          <Metadata label={t("detail.scale")} value={vocabularyLabel(t, "scales", concept.scale)} />
          <Metadata label={t("detail.families")} value={concept.families.map((id) => vocabularyLabel(t, "families", id)).join(", ")} />
          <Metadata label={t("detail.strata")} value={concept.strata.map((id) => vocabularyLabel(t, "strata", id)).join(", ")} />
        </dl>
      )}

      <KnowledgeContextMap
        key={concept.id}
        catalog={catalog}
        rootId={concept.id}
        language={language}
        onSelect={onSelect}
      />

      {concept.references && concept.references.length > 0 ? (
        <section aria-labelledby={`knowledge-sources-${concept.id}`}>
          <h3 id={`knowledge-sources-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.sources")}
          </h3>
          <ul className="mt-2 space-y-2">
            {concept.references.map((reference) => (
              <li key={reference.id}>
                <a
                  href={reference.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`${previewFocus} block min-h-11 break-words rounded-xl border border-soma-line px-3 py-2 text-sm text-soma-action hover:border-soma-line-strong`}
                >
                  <span className="block font-medium">{reference.title}</span>
                  <span className="mt-1 block text-xs text-soma-ink-muted">{reference.publisher}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <RelationSection
        title={t("detail.outgoing")}
        empty={t("detail.noOutgoing")}
        relations={outgoing.map((relation) => ({ relation, otherId: relation.object }))}
        catalog={catalog}
        language={language}
        onSelect={onSelect}
      />
      <RelationSection
        title={t("detail.incoming")}
        empty={t("detail.noIncoming")}
        relations={incoming.map((relation) => ({ relation, otherId: relation.subject }))}
        catalog={catalog}
        language={language}
        onSelect={onSelect}
      />

      <section aria-labelledby={`knowledge-prerequisites-${concept.id}`}>
        <h3 id={`knowledge-prerequisites-${concept.id}`} className="text-sm font-semibold text-soma-ink">
          {t("detail.prerequisites")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">
          {t("detail.prerequisitesNotice")}
        </p>
        {prerequisites.length === 0 ? (
          <p className="mt-2 text-sm text-soma-ink-muted">{t("detail.noPrerequisites")}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {prerequisites.map((item) => {
              const prerequisite = indexes.conceptsById.get(item.prerequisite);
              if (!prerequisite) return null;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(prerequisite.id)}
                    className={`${previewFocus} w-full rounded-xl border border-soma-line px-3 py-2 text-left hover:border-soma-line-strong`}
                  >
                    <span className="block text-sm font-medium text-soma-ink">{prerequisite.labels[language]}</span>
                    <span className="mt-1 block text-xs text-soma-ink-muted">{item.rationale[language]}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {bindings.length > 0 ? (
        <section aria-labelledby={`knowledge-bindings-${concept.id}`}>
          <h3 id={`knowledge-bindings-${concept.id}`} className="text-sm font-semibold text-soma-ink">
            {t("detail.relatedSoma")}
          </h3>
          <ul className="mt-2 space-y-2">
            {bindings.map((binding) => (
              <li key={`${binding.surface}:${binding.id}`}>
                <Link
                  to={binding.href}
                  className={`${previewFocus} flex min-h-11 items-center justify-between gap-3 rounded-xl border border-soma-line px-3 py-2 text-sm text-soma-action hover:border-soma-line-strong`}
                >
                  <span>{t(`bindings.${binding.surface}`, { defaultValue: t("bindings.related") })}</span>
                  <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function RelationSection({
  title,
  empty,
  relations,
  catalog,
  language,
  onSelect,
}: {
  title: string;
  empty: string;
  relations: readonly {
    relation: KnowledgeRelation;
    otherId: KnowledgeConceptId;
  }[];
  catalog: KnowledgeCatalog;
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
}) {
  const { t } = useTranslation("knowledge");
  const concepts = new Map(catalog.concepts.map((item) => [item.id, item]));
  return (
    <section>
      <h3 className="text-sm font-semibold text-soma-ink">{title}</h3>
      {relations.length === 0 ? (
        <p className="mt-2 text-sm text-soma-ink-muted">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {relations.map(({ relation, otherId }) => {
            const other = concepts.get(otherId);
            if (!other) return null;
            return (
              <li key={relation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(other.id)}
                  className={`${previewFocus} flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-soma-line px-3 py-2 text-left hover:border-soma-line-strong`}
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-soma-ink-muted">{predicateLabel(t, relation.predicate)}</span>
                    <span className="block truncate text-sm font-medium text-soma-ink">{other.labels[language]}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-soma-action" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Metadata({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-soma-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm text-soma-ink-secondary">{value}</dd>
    </div>
  );
}

function predicateLabel(t: ReturnType<typeof useTranslation>["t"], predicate: KnowledgePredicate): string {
  return t(`predicates.${predicate}`);
}

function vocabularyLabel(
  t: ReturnType<typeof useTranslation>["t"],
  group: "families" | "strata" | "ontologyTypes" | "scales",
  id: string,
): string {
  return t(`${group}.${id}`, { defaultValue: humanize(id) });
}

function humanize(value: string): string {
  return value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
