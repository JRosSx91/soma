import { useEffect, useId, useRef, useState } from "react";
import { previewFocus } from "../focus.js";
import { PrototypeIllustration } from "./KnowledgePrototypeTree.js";
import { CURIOSITY_SPARK_URL, STRATUM_SHEET_ART } from "./knowledge-prototype-lookdev.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "./knowledge-prototype-copy.js";
import { KNOWLEDGE_PROTOTYPE_CATALOG, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, prototypeMapRequirements } from "./knowledge-prototype-fixture.js";
import type { KnowledgePrototypeScenarioNode } from "./knowledge-prototype-fixture.js";
import { formatMilliPerSecond } from "./knowledge-prototype-game-engine.js";
import type { PrototypeGeneratorOffer } from "./knowledge-prototype-game-engine.js";
import type { KnowledgeCatalog, KnowledgeConcept, KnowledgeConceptId } from "./knowledge-types.js";
type SheetTab = "details" | "examples" | "deepen";

export function PrototypePlayableRequirements({
  sequence,
  language,
  onLocate,
  nodes,
}: {
  sequence: number;
  language: "es" | "en";
  onLocate?: (id: KnowledgeConceptId) => void;
  nodes?: readonly KnowledgePrototypeScenarioNode[];
}) {
  const requirements = prototypeMapRequirements(sequence);
  if (requirements.length === 0) return null;
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const concepts = new Map(KNOWLEDGE_PROTOTYPE_CATALOG.concepts.map((concept) => [concept.id, concept]));
  const incomplete = requirements.some((item) => !item.onMap);
  return (
    <section aria-labelledby={`prototype-requirements-${sequence}`} data-prototype-playable-requirements="true" className="rounded-xl border border-white/10 bg-[#071018] p-3">
      <h3 id={`prototype-requirements-${sequence}`} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soma-ink-muted">
        {copy.game.playableRequirements}
        {nodes ? ` (${requirements.filter((item) => nodes.find((node) => node.id === item.id)?.state === "discovered").length}/${requirements.length})` : ""}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {requirements.map((item) => {
          const name = concepts.get(item.id)?.labels[language];
          const met = nodes?.find((node) => node.id === item.id)?.state === "discovered";
          return (
            <li key={item.id} data-prototype-requirement={item.code} data-prototype-requirement-on-map={item.onMap ? "true" : "false"} className="text-sm text-soma-ink-secondary">
              {onLocate ? (
                <button type="button" onClick={() => onLocate(item.id)} className={`${previewFocus} flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-xs text-soma-ink hover:bg-white/5`}>
                  <span aria-hidden="true" className={met ? "text-[#7ddec8]" : "text-white/30"}>{met ? "✓" : "○"}</span>
                  {name}
                </button>
              ) : (
                <span className="font-medium text-soma-ink">{name}</span>
              )}
              {onLocate ? null : <span className="ml-1 text-xs text-soma-ink-muted">{item.code}</span>}
              {item.onMap ? null : <span className="mt-0.5 block text-xs text-[#c4b5fd]">{copy.game.requirementOffMap}</span>}
            </li>
          );
        })}
      </ul>
      {incomplete ? <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">{copy.game.requirementsIncomplete}</p> : null}
    </section>
  );
}

export function PrototypeConceptSheet({
  variant,
  concept,
  node,
  catalog,
  nodes,
  language,
  onSelect,
  onClose,
  generator,
  playing,
  onBuyGenerator,
}: {
  variant: "panel" | "sheet";
  concept: KnowledgeConcept;
  node: KnowledgePrototypeScenarioNode;
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
  onClose: () => void;
  generator: PrototypeGeneratorOffer | null;
  playing: boolean;
  onBuyGenerator: (id: PrototypeGeneratorOffer["id"]) => void;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const opened = useRef(false);
  const art = STRATUM_SHEET_ART[node.sequence];

  useEffect(() => {
    if (variant !== "panel" || opened.current) return;
    opened.current = true;
    panelRef.current?.focus();
  }, [concept.id, variant]);

  const body = (
    <PrototypeConceptBody
      concept={concept}
      node={node}
      catalog={catalog}
      nodes={nodes}
      language={language}
      onSelect={onSelect}
      showTitle={variant === "panel"}
      titleId={titleId}
      generator={generator}
      playing={playing}
      onBuyGenerator={onBuyGenerator}
      art={art}
    />
  );

  if (variant === "sheet") return body;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-prototype-concept-panel="true"
      data-prototype-map-ignore="true"
      data-knowledge-concept={concept.id}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        onClose();
      }}
      className="flex h-full w-[clamp(21.25rem,26%,25rem)] shrink-0 flex-col border-l border-white/10 bg-[#071422]/90 text-soma-ink shadow-[-16px_0_40px_rgb(2_6_12/0.28)] outline-none backdrop-blur-md"
    >
      <div className="flex items-start justify-between gap-3 px-4 pb-1 pt-3">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7ee0f0]">
          {node.provisionalCode}
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-soma-ink-secondary">{copy.states[node.state]}</span>
        </p>
        <button type="button" onClick={onClose} className={`${previewFocus} shrink-0 rounded-lg px-2 py-1 text-sm text-soma-ink-secondary hover:bg-white/5 hover:text-soma-ink`}>
          {language === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
      {body}
    </aside>
  );
}

function PrototypeConceptBody({
  concept,
  node,
  catalog,
  nodes,
  language,
  onSelect,
  showTitle,
  titleId,
  generator,
  playing,
  onBuyGenerator,
  art,
}: {
  concept: KnowledgeConcept;
  node: KnowledgePrototypeScenarioNode;
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
  showTitle: boolean;
  titleId: string;
  generator: PrototypeGeneratorOffer | null;
  playing: boolean;
  onBuyGenerator: (id: PrototypeGeneratorOffer["id"]) => void;
  art: string | undefined;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  const [tabState, setTabState] = useState<{ id: string; tab: SheetTab }>({ id: concept.id, tab: "details" });
  const tab = tabState.id === concept.id ? tabState.tab : "details";
  const label = concept.labels[language];
  const tabs: readonly SheetTab[] = ["details", "examples", "deepen"];
  const successors = KNOWLEDGE_PROTOTYPE_DEPENDENCIES.filter((item) => item.from === concept.id);

  return (
    <div className={showTitle ? "flex min-h-0 flex-1 flex-col" : "space-y-4"} data-knowledge-concept={showTitle ? undefined : concept.id}>
      {showTitle ? (
        <h2 id={titleId} className="px-4 text-2xl font-semibold leading-tight text-soma-ink">{label}</h2>
      ) : (
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7ee0f0]">
          {node.provisionalCode}
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-soma-ink-secondary">{copy.states[node.state]}</span>
        </p>
      )}
      <div className={`${showTitle ? "mt-3 min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-5" : "space-y-4"}`}>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050b14]">
          {art ? (
            <img src={art} alt={label} width={960} height={540} data-prototype-sheet-art={node.provisionalCode} className="aspect-[16/9] max-h-44 w-full object-cover" />
          ) : (
            <PrototypeIllustration kind={node.illustration} label={label} language={language} />
          )}
        </div>
        <p className="text-sm leading-7 text-[#d5e2ea]">{concept.definition[language]}</p>

        <div role="tablist" aria-label={label} data-prototype-sheet-tabs="true" className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#071018] p-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              id={`prototype-tab-${node.sequence}-${item}`}
              aria-selected={tab === item}
              aria-controls={`prototype-tabpanel-${node.sequence}-${item}`}
              onClick={() => setTabState({ id: concept.id, tab: item })}
              className={`${previewFocus} min-h-9 rounded-lg px-2 text-xs font-semibold ${tab === item ? "bg-[#123044] text-[#d7f6ff]" : "text-soma-ink-muted hover:text-soma-ink"}`}
            >
              {copy.game.sheetTabs[item]}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`prototype-tabpanel-${node.sequence}-${tab}`}
          aria-labelledby={`prototype-tab-${node.sequence}-${tab}`}
          className="text-sm leading-relaxed text-soma-ink-secondary"
        >
          <SheetTabPanel tab={tab} concept={concept} language={language} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <PrototypePlayableRequirements sequence={node.sequence} language={language} onLocate={onSelect} nodes={nodes} />
          <SuccessorList successors={successors} catalog={catalog} nodes={nodes} language={language} onSelect={onSelect} />
        </div>

        {node.generator && generator ? (
          <section className="rounded-xl border border-[#f5c16c]/35 bg-[#161106] p-3" aria-labelledby={`prototype-generator-${node.sequence}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 id={`prototype-generator-${node.sequence}`} className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#f5c16c]"><path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" /></svg>
                {copy.game.generatorMark}
              </h3>
              <p className="text-sm font-semibold text-[#7ddec8]">{copy.game.rateNow(formatMilliPerSecond(generator.rateMilliPerSecond))}</p>
            </div>
            <p className="mt-2 text-xs text-soma-ink-secondary">{copy.game.level(generator.level, generator.maxLevel)}</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={generator.maxLevel} aria-valuenow={generator.level}>
              <div className="h-full rounded-full bg-[#f5c16c]" style={{ width: `${Math.round((generator.level / generator.maxLevel) * 100)}%` }} />
            </div>
            {playing && generator.discovered ? (
              <button
                type="button"
                disabled={generator.maxed || !generator.affordable}
                onClick={() => onBuyGenerator(generator.id)}
                className={`${previewFocus} mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0e7490] px-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-soma-ink-muted`}
              >
                {generator.maxed || generator.costSparks === null ? (generator.maxed ? copy.game.owned : copy.game.locked) : (
                  <>
                    {copy.game.improve}
                    <img src={CURIOSITY_SPARK_URL} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                    {generator.costSparks}
                  </>
                )}
              </button>
            ) : null}
          </section>
        ) : null}

        <details data-knowledge-dev-fixture="true" className="rounded-lg border border-dashed border-white/15 px-3 py-2">
          <summary className={`${previewFocus} cursor-pointer text-xs font-semibold text-soma-ink-muted`}>{copy.game.prototypeNotes}</summary>
          <p className="mt-2 text-xs text-soma-ink-secondary">{copy.game.fixtureCodeLabel}: {node.provisionalCode}</p>
          <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">{copy.game.fixtureMetadataNote}</p>
        </details>
      </div>
    </div>
  );
}

function SheetTabPanel({
  tab,
  concept,
  language,
}: {
  tab: SheetTab;
  concept: KnowledgeConcept;
  language: "es" | "en";
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  if (tab === "examples") {
    return concept.example ? <p>{concept.example[language]}</p> : <p>{copy.game.sheetTabEmpty}</p>;
  }
  if (tab === "deepen") {
    if (!concept.clarifications || concept.clarifications.length === 0) return <p>{copy.game.sheetTabEmpty}</p>;
    return (
      <ul className="list-disc space-y-2 pl-5">
        {concept.clarifications.map((item, index) => <li key={`${concept.id}:${index}`}>{item[language]}</li>)}
      </ul>
    );
  }
  return <p className="text-sm leading-6 text-soma-ink-secondary">{copy.game.sheetTabEmpty}</p>;
}

function SuccessorList({
  successors,
  catalog,
  nodes,
  language,
  onSelect,
}: {
  successors: readonly { id: string; to: KnowledgeConceptId }[];
  catalog: KnowledgeCatalog;
  nodes: readonly KnowledgePrototypeScenarioNode[];
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
}) {
  const copy = KNOWLEDGE_PROTOTYPE_COPY[language];
  return (
    <section aria-labelledby="prototype-successors" className="rounded-xl border border-white/10 bg-[#071018] p-3">
      <h3 id="prototype-successors" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-soma-ink-muted">{copy.game.successors}</h3>
      {successors.length === 0 ? <p className="mt-2 text-xs text-soma-ink-muted">{copy.game.noSuccessors}</p> : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {successors.map((item) => {
            const name = catalog.concepts.find((concept) => concept.id === item.to)?.labels[language];
            const discovered = nodes.find((node) => node.id === item.to)?.state === "discovered";
            return (
              <li key={item.id}>
                {discovered ? (
                  <button type="button" onClick={() => onSelect(item.to)} className={`${previewFocus} rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-soma-ink hover:border-[#7ee0f0]/50`}>
                    {name}
                  </button>
                ) : (
                  <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-soma-ink-muted">{name}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
