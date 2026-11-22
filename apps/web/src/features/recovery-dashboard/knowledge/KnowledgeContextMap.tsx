import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../focus.js";
import { buildKnowledgeMapModel } from "./knowledge-map-model.js";
import type {
  KnowledgeConceptId,
  KnowledgePredicate,
  KnowledgeCatalog,
} from "./knowledge-types.js";

export function KnowledgeContextMap({
  catalog,
  rootId,
  language,
  onSelect,
}: {
  catalog: KnowledgeCatalog;
  rootId: KnowledgeConceptId;
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
}) {
  const { t } = useTranslation("knowledge");
  const [depth, setDepth] = useState<1 | 2>(1);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const model = useMemo(
    () => buildKnowledgeMapModel(catalog, rootId, depth),
    [catalog, depth, rootId],
  );
  const concepts = useMemo(
    () => new Map(model.nodes.map((node) => [node.concept.id, node.concept])),
    [model.nodes],
  );

  function resetView() {
    setDepth(1);
    setMobileMapOpen(false);
  }

  return (
    <section aria-labelledby={`knowledge-map-title-${rootId}`} className="rounded-xl border border-soma-line bg-soma-canvas/35 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id={`knowledge-map-title-${rootId}`} className="text-sm font-semibold text-soma-ink">
            {t("map.title")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-soma-ink-muted">
            {t("map.description")}
          </p>
        </div>
        <button
          type="button"
          aria-expanded={mobileMapOpen}
          aria-controls={`knowledge-map-visual-${rootId}`}
          onClick={() => setMobileMapOpen((open) => !open)}
          className={`${previewFocus} min-h-11 rounded-xl border border-soma-line px-3 py-2 text-xs font-medium text-soma-action lg:hidden`}
        >
          {mobileMapOpen ? t("map.hideVisual") : t("map.showVisual")}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="text-xs font-medium text-soma-ink-secondary">
            {t("map.depthLegend")}
          </legend>
          <div className="mt-1 flex flex-wrap gap-2">
            {([1, 2] as const).map((value) => (
              <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-soma-line px-3 py-2 text-xs text-soma-ink-secondary has-[:checked]:border-soma-action has-[:checked]:text-soma-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-soma-focus">
                <input
                  type="radio"
                  name={`knowledge-map-depth-${rootId}`}
                  value={value}
                  checked={depth === value}
                  onChange={() => setDepth(value)}
                  className="accent-soma-action"
                />
                {t(value === 1 ? "map.oneHop" : "map.twoHops")}
              </label>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          onClick={resetView}
          disabled={depth === 1 && !mobileMapOpen}
          className={`${previewFocus} min-h-11 rounded-xl border border-soma-line px-3 py-2 text-xs text-soma-ink-secondary disabled:opacity-40`}
        >
          {t("map.reset")}
        </button>
      </div>

      {model.truncated ? (
        <p role="status" className="mt-3 rounded-lg border border-soma-line px-3 py-2 text-xs text-soma-ink-secondary">
          {t("map.truncated", { count: model.maxNodes })}
        </p>
      ) : null}

      <div
        id={`knowledge-map-visual-${rootId}`}
        className={`${mobileMapOpen ? "block" : "hidden"} mt-3 min-w-0 lg:block`}
      >
        <KnowledgeMapSvg
          model={model}
          language={language}
          onSelect={onSelect}
        />
      </div>

      <section aria-labelledby={`knowledge-map-list-${rootId}`} className="mt-4">
        <h4 id={`knowledge-map-list-${rootId}`} className="text-xs font-semibold uppercase tracking-wide text-soma-ink-muted">
          {t("map.textAlternative")}
        </h4>
        {model.edges.length === 0 ? (
          <p className="mt-2 text-sm text-soma-ink-muted">{t("map.noRelations")}</p>
        ) : (
          <ol className="mt-2 space-y-2">
            {model.edges.map((edge) => {
              const subject = concepts.get(edge.relation.subject);
              const object = concepts.get(edge.relation.object);
              if (!subject || !object) return null;
              return (
                <li key={edge.relation.id} className="rounded-lg border border-soma-line/70 px-3 py-2 text-xs leading-relaxed text-soma-ink-secondary">
                  <button type="button" onClick={() => onSelect(subject.id)} className={`${previewFocus} rounded font-medium text-soma-action`}>
                    {subject.labels[language]}
                  </button>{" "}
                  <span className="font-semibold text-soma-ink">{predicateLabel(t, edge.relation.predicate)}</span>{" "}
                  <button type="button" onClick={() => onSelect(object.id)} className={`${previewFocus} rounded font-medium text-soma-action`}>
                    {object.labels[language]}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </section>
  );
}

function KnowledgeMapSvg({
  model,
  language,
  onSelect,
}: {
  model: ReturnType<typeof buildKnowledgeMapModel>;
  language: "es" | "en";
  onSelect: (id: KnowledgeConceptId) => void;
}) {
  const { t } = useTranslation("knowledge");
  const markerPrefix = useId().replace(/:/g, "");
  return (
    <div className="overflow-hidden rounded-xl border border-soma-line bg-[#081018]">
      <svg
        data-knowledge-map="contextual"
        viewBox="0 0 1200 900"
        role="group"
        aria-label={t("map.ariaLabel")}
        className="block h-auto max-h-[32rem] w-full"
      >
        <defs>
          {(["incoming", "outgoing", "context"] as const).map((kind) => (
            <marker key={kind} id={`${markerPrefix}-${kind}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className={arrowClass(kind)} />
            </marker>
          ))}
        </defs>
        <rect width="1200" height="900" fill="#081018" />
        <g aria-hidden="true">
          {model.edges.map((edge) => (
            <g key={edge.relation.id}>
              <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                markerEnd={`url(#${markerPrefix}-${edge.kind})`}
                className={`${edgeClass(edge.kind)} motion-safe:transition-opacity motion-reduce:transition-none`}
              />
              <rect x={edge.labelX - 62} y={edge.labelY - 14} width="124" height="22" rx="8" fill="#0c1824" stroke="#294055" />
              <text x={edge.labelX} y={edge.labelY + 1} textAnchor="middle" fill="#c5d3de" fontSize="12">
                {shorten(predicateLabel(t, edge.relation.predicate), 19)}
              </text>
            </g>
          ))}
        </g>
        {model.nodes.map((node) => (
          <MapNode
            key={node.concept.id}
            node={node}
            label={node.concept.labels[language]}
            onSelect={onSelect}
          />
        ))}
      </svg>
      <MapLegend />
    </div>
  );
}

function MapNode({
  node,
  label,
  onSelect,
}: {
  node: ReturnType<typeof buildKnowledgeMapModel>["nodes"][number];
  label: string;
  onSelect: (id: KnowledgeConceptId) => void;
}) {
  const { t } = useTranslation("knowledge");
  const lines = labelLines(label);
  function onKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(node.concept.id);
  }
  return (
    <g
      role="button"
      tabIndex={0}
      aria-current={node.central ? "true" : undefined}
      aria-label={node.central ? t("map.centralNode", { name: label }) : t("map.openNode", { name: label })}
      data-knowledge-map-node={node.concept.id}
      data-central={node.central ? "true" : undefined}
      transform={`translate(${node.x} ${node.y})`}
      onClick={() => onSelect(node.concept.id)}
      onKeyDown={onKeyDown}
      className="cursor-pointer outline-none focus-visible:[&>rect]:stroke-white focus-visible:[&>rect]:stroke-[4]"
    >
      <rect
        x="-72"
        y="-27"
        width="144"
        height="54"
        rx="16"
        className={node.central ? "fill-[#142839] stroke-[#68d8c0] stroke-[4]" : "fill-[#101e2b] stroke-[#7659ad] stroke-[2]"}
      />
      {node.central ? <circle cx="-58" cy="-14" r="5" fill="#68d8c0" /> : null}
      <text textAnchor="middle" fill="#edf4f8" fontSize="13" fontWeight={node.central ? "700" : "600"} pointerEvents="none">
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x="0" dy={index === 0 ? (lines.length === 1 ? "0.35em" : "-0.2em") : "1.15em"}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function MapLegend() {
  const { t } = useTranslation("knowledge");
  return (
    <ul className="grid gap-2 border-t border-soma-line px-3 py-2 text-[11px] text-soma-ink-secondary sm:grid-cols-3">
      {(["outgoing", "incoming", "context"] as const).map((kind) => (
        <li key={kind} className="flex items-center gap-2">
          <span aria-hidden="true" className={`block w-8 border-t-2 ${legendClass(kind)}`} />
          {t(`map.legend.${kind}`)}
        </li>
      ))}
    </ul>
  );
}

function edgeClass(kind: "incoming" | "outgoing" | "context"): string {
  if (kind === "outgoing") return "stroke-[#68d8c0] stroke-[3]";
  if (kind === "incoming") return "stroke-[#9b7bd1] stroke-[3] stroke-dasharray-[10_7]";
  return "stroke-[#70879a] stroke-2 stroke-dasharray-[3_7]";
}

function arrowClass(kind: "incoming" | "outgoing" | "context"): string {
  if (kind === "outgoing") return "fill-[#68d8c0]";
  if (kind === "incoming") return "fill-[#9b7bd1]";
  return "fill-[#70879a]";
}

function legendClass(kind: "incoming" | "outgoing" | "context"): string {
  if (kind === "outgoing") return "border-[#68d8c0]";
  if (kind === "incoming") return "border-dashed border-[#9b7bd1]";
  return "border-dotted border-[#70879a]";
}

function predicateLabel(
  t: ReturnType<typeof useTranslation>["t"],
  predicate: KnowledgePredicate,
): string {
  return t(`predicates.${predicate}`);
}

function labelLines(label: string): readonly string[] {
  if (label.length <= 18) return [label];
  const words = label.split(/\s+/);
  let first = "";
  let second = "";
  for (const word of words) {
    if (!second && `${first} ${word}`.trim().length <= 18) {
      first = `${first} ${word}`.trim();
    } else {
      second = `${second} ${word}`.trim();
    }
  }
  return [shorten(first, 18), shorten(second, 18)].filter(Boolean);
}

function shorten(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}
