import { useEffect, useId, useRef, useState } from "react";
import { previewFocus } from "../focus.js";
import { PrototypeIllustration } from "./KnowledgePrototypeTree.js";
import { CURIOSITY_SPARK_URL, STRATUM_SHEET_ART } from "./knowledge-prototype-lookdev.js";
import { editorialSheetForSequence } from "./knowledge-prototype-editorial.js";
import type { PrototypeEditorialSheet } from "./knowledge-prototype-editorial.js";
import { EditorialBlocks, EditorialParagraphs } from "./knowledge-prototype-editorial-view.js";
import { KNOWLEDGE_PROTOTYPE_COPY } from "./knowledge-prototype-copy.js";
import { KNOWLEDGE_PROTOTYPE_CATALOG, KNOWLEDGE_PROTOTYPE_DEPENDENCIES, prototypeMapRequirements } from "./knowledge-prototype-fixture.js";
import type { KnowledgePrototypeScenarioNode, KnowledgePrototypeState } from "./knowledge-prototype-fixture.js";
import { formatMilliPerSecond } from "./knowledge-prototype-game-engine.js";
import type { PrototypeGeneratorOffer } from "./knowledge-prototype-game-engine.js";
import type { KnowledgeCatalog, KnowledgeConcept, KnowledgeConceptId } from "./knowledge-types.js";
type SheetTab = "details" | "examples" | "deepen";

const sheetCard = "rounded-2xl border border-[#9fd7e6]/14 bg-[#0c1828]/90 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_12px_28px_rgb(1_6_14/0.28)]";
const sheetKicker = "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8fd4e4]";

function stateBadgeClass(state: KnowledgePrototypeState) {
  if (state === "discovered") return "border-[#7ddec8]/40 bg-[#10352c] text-[#c8f6e8]";
  if (state === "available" || state === "researching") return "border-[#7ee0f0]/40 bg-[#0d2c38] text-[#d7f6ff]";
  return "border-white/15 bg-white/[0.04] text-[#9eb0bd]";
}

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
    <section aria-labelledby={`prototype-requirements-${sequence}`} data-prototype-playable-requirements="true" className={`${sheetCard} p-3.5`}>
      <h3 id={`prototype-requirements-${sequence}`} className={sheetKicker}>
        {copy.game.playableRequirements}
        {nodes ? ` (${requirements.filter((item) => nodes.find((node) => node.id === item.id)?.state === "discovered").length}/${requirements.length})` : ""}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {requirements.map((item) => {
          const name = concepts.get(item.id)?.labels[language];
          const met = nodes?.find((node) => node.id === item.id)?.state === "discovered";
          return (
            <li key={item.id} data-prototype-requirement={item.code} data-prototype-requirement-on-map={item.onMap ? "true" : "false"} className="text-sm text-[#c5d4de]">
              {onLocate ? (
                <button type="button" onClick={() => onLocate(item.id)} className={`${previewFocus} flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left text-sm text-[#e7eef4] hover:bg-white/5`}>
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
      className="relative flex h-full w-[clamp(18rem,32%,26rem)] shrink-0 flex-col overflow-hidden border-l border-[#8fd8ea]/30 bg-[#06101c] text-[#e7eef4] shadow-[-28px_0_72px_rgb(1_6_14/0.62)] outline-none"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_46%_at_50%_-10%,rgb(126_224_240/0.16),transparent_48%),radial-gradient(70%_32%_at_100%_100%,rgb(168_140_250/0.12),transparent_46%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-8 left-0 w-px bg-gradient-to-b from-transparent via-[#9ee7f5]/80 to-transparent" />
      <div className="relative z-10 flex items-center justify-between gap-3 px-5 pb-1 pt-4">
        <p className={`flex min-w-0 items-center gap-2 ${sheetKicker}`}>
          <span className="shrink-0">{node.provisionalCode}</span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal ${stateBadgeClass(node.state)}`}>{copy.states[node.state]}</span>
        </p>
        <button type="button" onClick={onClose} className={`${previewFocus} shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-xs text-[#c5d4de] hover:border-[#8fd8ea]/40 hover:text-white`}>
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
  const editorial = editorialSheetForSequence(node.sequence);
  const playable = (
    <>
      <div className={showTitle ? "grid grid-cols-2 gap-2" : "grid gap-3 sm:grid-cols-2"}>
        <PrototypePlayableRequirements sequence={node.sequence} language={language} onLocate={onSelect} nodes={nodes} />
        <SuccessorList successors={successors} catalog={catalog} nodes={nodes} language={language} onSelect={onSelect} />
      </div>
      {node.generator && generator ? (
        <section className="rounded-2xl border border-[#7ee0f0]/25 bg-[linear-gradient(180deg,rgb(14_32_48/0.95),rgb(8_16_28/0.95))] p-3.5 shadow-[0_0_24px_rgb(126_224_240/0.08)]" aria-labelledby={`prototype-generator-${node.sequence}`}>
          <div className="flex items-start justify-between gap-3">
            <h3 id={`prototype-generator-${node.sequence}`} className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#f5c16c]"><path d="M13 2 4 14h7l-1 8 10-14h-7l0-6Z" /></svg>
              {copy.game.generatorMark}
            </h3>
            <p className="text-sm font-semibold text-[#9cf0dc]">{copy.game.rateNow(formatMilliPerSecond(generator.rateMilliPerSecond))}</p>
          </div>
          <p className="mt-3 text-xs text-[#c5d4de]">{copy.game.level(generator.level, generator.maxLevel)}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={generator.maxLevel} aria-valuenow={generator.level}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#7ee0f0] to-[#f5c16c]" style={{ width: `${Math.round((generator.level / generator.maxLevel) * 100)}%` }} />
          </div>
          {playing && generator.discovered ? (
            <button
              type="button"
              disabled={generator.maxed || !generator.affordable}
              onClick={() => onBuyGenerator(generator.id)}
              className={`${previewFocus} mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0e7490] to-[#155e75] px-3 text-sm font-semibold text-white shadow-[0_8px_22px_rgb(14_116_144/0.35)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/10 disabled:text-[#8ea3b0] disabled:shadow-none`}
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
    </>
  );

  return (
    <div className={showTitle ? "relative z-10 flex min-h-0 flex-1 flex-col" : "space-y-5"} data-knowledge-concept={showTitle ? undefined : concept.id}>
      {showTitle ? (
        <h2 id={titleId} className="relative px-5 text-[1.7rem] font-semibold leading-tight tracking-tight text-white">{label}</h2>
      ) : (
        <p className={`flex min-w-0 items-center gap-2 ${sheetKicker}`}>
          <span className="shrink-0">{node.provisionalCode}</span>
          <span className={`truncate rounded-full border px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal ${stateBadgeClass(node.state)}`}>{copy.states[node.state]}</span>
        </p>
      )}
      <div className={`${showTitle ? "relative mt-3 min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto px-5 pb-5" : "min-w-0 space-y-4"}`} data-prototype-editorial={editorial?.code}>
        <div className="overflow-hidden rounded-2xl border border-[#9fd7e6]/25 bg-[#050b14] shadow-[0_0_28px_rgb(126_224_240/0.14),0_16px_36px_rgb(2_6_16/0.4)]">
          {art ? (
            <img src={art} alt={label} width={960} height={540} data-prototype-sheet-art={node.provisionalCode} className="aspect-[16/9] w-full object-cover" />
          ) : (
            <PrototypeIllustration kind={node.illustration} label={label} language={language} />
          )}
        </div>
        {editorial ? (
          <>
            <section data-prototype-hook="true" className="rounded-2xl border border-[#f5c16c]/40 bg-[#161106] px-3.5 py-3.5 shadow-[0_0_22px_rgb(245_193_108/0.08)]">
              <p className="flex gap-3 text-[15px] font-medium leading-7 text-[#f8e7c4]">
                <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#f5c16c]/60 text-sm font-semibold text-[#f5c16c]">?</span>
                {editorial.hookQuestion}
              </p>
            </section>
            <div data-prototype-intro="true">
              <EditorialParagraphs paragraphs={editorial.intro} />
            </div>
            <section data-prototype-summary="true" className="rounded-2xl border border-[#f5c16c]/30 bg-[#120e08] px-3.5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#f5c16c]">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-[#f5c16c]"><path d="M9 21h6v-1H9v1Zm3-19a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" /></svg>
                {copy.game.inFewWords}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#f3ead8]">{editorial.shortSummary}</p>
              {language === "en" ? <p className="mt-2 text-xs leading-5 text-[#d8c7a2]">{copy.game.candidateSpanishNote}</p> : null}
            </section>
          </>
        ) : (
          <p className={`${sheetCard} px-4 py-3.5 text-[15px] leading-7 text-[#d7e4ec]`}>{concept.definition[language]}</p>
        )}

        <div role="tablist" aria-label={label} data-prototype-sheet-tabs="true" className="grid grid-cols-3 gap-1 rounded-2xl border border-[#9fd7e6]/16 bg-[#08131f] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              id={`prototype-tab-${node.sequence}-${item}`}
              aria-selected={tab === item}
              aria-controls={`prototype-tabpanel-${node.sequence}-${item}`}
              onClick={() => setTabState({ id: concept.id, tab: item })}
              className={`${previewFocus} min-h-10 rounded-xl px-1.5 text-center text-[11px] font-semibold leading-tight sm:text-xs ${tab === item ? "bg-[#12384a] text-[#e9fbff] shadow-[0_0_18px_rgb(126_224_240/0.28)]" : "text-[#8ea3b0] hover:text-[#e7eef4]"}`}
            >
              {copy.game.sheetTabs[item]}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`prototype-tabpanel-${node.sequence}-${tab}`}
          aria-labelledby={`prototype-tab-${node.sequence}-${tab}`}
          className={`${sheetCard} px-4 py-3 text-sm leading-relaxed text-[#c5d4de]`}
        >
          {editorial ? <EditorialTab tab={tab} sheet={editorial} /> : <SheetTabPanel tab={tab} concept={concept} language={language} />}
        </div>

        {playable}

        <details data-knowledge-dev-fixture="true" className="rounded-xl border border-dashed border-white/15 px-3.5 py-2">
          <summary className={`${previewFocus} cursor-pointer text-xs font-semibold text-[#8ea3b0]`}>{copy.game.prototypeNotes}</summary>
          <p className="mt-2 text-xs text-soma-ink-secondary">{copy.game.fixtureCodeLabel}: {node.provisionalCode}</p>
          <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">{copy.game.fixtureMetadataNote}</p>
        </details>
      </div>
    </div>
  );
}

function EditorialTab({ tab, sheet }: { tab: SheetTab; sheet: PrototypeEditorialSheet }) {
  if (tab === "examples") {
    return (
      <div className="space-y-3">
        {sheet.examples.map((example) => (
          <article key={example.title} data-prototype-example={example.title} className="rounded-xl border border-white/10 bg-[#08131f]/80 px-3.5 py-3">
            <h3 className="text-sm font-semibold text-white">{example.title}</h3>
            <div className="mt-2">
              <EditorialParagraphs paragraphs={example.paragraphs} />
            </div>
          </article>
        ))}
      </div>
    );
  }
  if (tab === "deepen") return <EditorialBlocks blocks={sheet.deepDive} />;
  return (
    <div className="space-y-4">
      <EditorialParagraphs paragraphs={sheet.details} />
      <section>
        <h3 className="text-sm font-semibold text-[#f5c16c]">{sheet.narrativeTitle}</h3>
        <div className="mt-2">
          <EditorialParagraphs paragraphs={sheet.narrative} />
        </div>
      </section>
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
    <section aria-labelledby="prototype-successors" className={`${sheetCard} p-3.5`}>
      <h3 id="prototype-successors" className={sheetKicker}>{copy.game.successors}</h3>
      {successors.length === 0 ? <p className="mt-2 text-xs text-soma-ink-muted">{copy.game.noSuccessors}</p> : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {successors.map((item) => {
            const name = catalog.concepts.find((concept) => concept.id === item.to)?.labels[language];
            const discovered = nodes.find((node) => node.id === item.to)?.state === "discovered";
            return (
              <li key={item.id}>
                {discovered ? (
                  <button type="button" onClick={() => onSelect(item.to)} className={`${previewFocus} rounded-full border border-[#7ee0f0]/35 bg-[#102838] px-2.5 py-1 text-xs text-[#e7eef4] shadow-[0_0_12px_rgb(126_224_240/0.12)] hover:border-[#7ee0f0]/70`}>
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
