import {
  KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
  KNOWLEDGE_PROTOTYPE_NODES,
  type KnowledgePrototypeIllustration,
  type KnowledgePrototypeScenarioNode,
} from "./knowledge-prototype-fixture.js";
import { buildPrototypeLayout, type PrototypeCanvasMetrics } from "./knowledge-prototype-layout.js";
import type { KnowledgeConceptId } from "./knowledge-types.js";

export type PrototypeStratumId =
  | "physics_fundamentals"
  | "chemistry_gradients"
  | "cell_biology"
  | "neurophysiology";

export const PROTOTYPE_STRATUM_ORDER: readonly PrototypeStratumId[] = [
  "physics_fundamentals",
  "chemistry_gradients",
  "cell_biology",
  "neurophysiology",
];

const STRATUM_BY_ILLUSTRATION: Record<KnowledgePrototypeIllustration, PrototypeStratumId> = {
  charge: "physics_fundamentals",
  gradient: "physics_fundamentals",
  capacitance: "physics_fundamentals",
  impulse: "physics_fundamentals",
  ion: "chemistry_gradients",
  solution: "chemistry_gradients",
  equilibrium: "chemistry_gradients",
  osmosis: "chemistry_gradients",
  neurotransmitter: "chemistry_gradients",
  membrane: "cell_biology",
  channel: "cell_biology",
  pump: "cell_biology",
  dendrite: "cell_biology",
  axon: "cell_biology",
  potential: "neurophysiology",
  neuron: "neurophysiology",
  synapse: "neurophysiology",
  receptor: "neurophysiology",
  network: "neurophysiology",
};

export interface PrototypeStratumZone {
  id: PrototypeStratumId;
  y0: number;
  y1: number;
  accent: string;
  veilTop: string;
  veilBottom: string;
  glow: string;
  opacity: number;
}

const STRATUM_PALETTE: Record<
  PrototypeStratumId,
  Pick<PrototypeStratumZone, "accent" | "veilTop" | "veilBottom" | "glow">
> = {
  physics_fundamentals: {
    accent: "#3d9ec4",
    veilTop: "#0a1c2b",
    veilBottom: "#07131e",
    glow: "#256f94",
  },
  chemistry_gradients: {
    accent: "#68d8c0",
    veilTop: "#0b1b24",
    veilBottom: "#0d1628",
    glow: "#6b5fa8",
  },
  cell_biology: {
    accent: "#4fa88a",
    veilTop: "#0a1f22",
    veilBottom: "#0c1824",
    glow: "#3d8f78",
  },
  neurophysiology: {
    accent: "#a78bfa",
    veilTop: "#121528",
    veilBottom: "#160f22",
    glow: "#7c5fd8",
  },
};

const ILLUSTRATION_BY_ID = new Map(
  KNOWLEDGE_PROTOTYPE_NODES.map((node) => [node.id, node.illustration]),
);

export function prototypeStratumForNode(node: Pick<KnowledgePrototypeScenarioNode, "id" | "illustration">) {
  return STRATUM_BY_ILLUSTRATION[node.illustration];
}

export function referenceLayoutNodes(): readonly KnowledgePrototypeScenarioNode[] {
  return KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({ ...node, state: "discovered" }));
}

export function buildStratumZones(
  metrics: PrototypeCanvasMetrics,
  frontierY: number,
  canvasHeight: number,
): PrototypeStratumZone[] {
  const layout = buildPrototypeLayout(
    referenceLayoutNodes(),
    KNOWLEDGE_PROTOTYPE_DEPENDENCIES,
    metrics,
  );
  const padding = metrics.cardHalfHeight + 52;
  const blend = 72;

  const byStratum = new Map<PrototypeStratumId, number[]>();
  for (const item of layout.nodes) {
    const stratum = prototypeStratumForNode(item.node);
    byStratum.set(stratum, [...(byStratum.get(stratum) ?? []), item.y]);
  }

  const zones: PrototypeStratumZone[] = [];
  for (const id of PROTOTYPE_STRATUM_ORDER) {
    const yValues = byStratum.get(id);
    if (!yValues?.length) continue;
    const y0 = Math.max(0, Math.min(...yValues) - padding);
    const y1 = Math.min(canvasHeight, Math.max(...yValues) + padding);
    const center = (y0 + y1) / 2;
    const palette = STRATUM_PALETTE[id];
    const opacity = stratumZoneOpacity(center, frontierY);
    zones.push({ id, y0, y1, ...palette, opacity });
  }

  for (let index = 1; index < zones.length; index += 1) {
    const previous = zones[index - 1]!;
    const current = zones[index]!;
    const seam = (previous.y1 + current.y0) / 2;
    previous.y1 = seam + blend / 2;
    current.y0 = seam - blend / 2;
  }

  if (zones[0]) zones[0].y0 = 0;
  const last = zones.at(-1);
  if (last) last.y1 = canvasHeight;

  return zones;
}

function stratumZoneOpacity(centerY: number, frontierY: number) {
  if (centerY > frontierY + 100) return 0.42;
  if (centerY > frontierY - 20) return 0.68;
  return 0.92;
}

export function stratumPatternNodes(
  zone: PrototypeStratumZone,
  layoutWidth: number,
  prefix: string,
): Array<{ key: string; element: "circle" | "path" | "ellipse"; attrs: Record<string, string | number> }> {
  const cx = layoutWidth / 2;
  const cy = (zone.y0 + zone.y1) / 2;
  const h = zone.y1 - zone.y0;

  if (zone.id === "physics_fundamentals") {
    return [56, 92, 128].map((radius, index) => ({
      key: `${prefix}-physics-ring-${index}`,
      element: "circle" as const,
      attrs: { cx, cy, r: radius, fill: "none", stroke: zone.accent, strokeWidth: 1, opacity: 0.1 - index * 0.02 },
    }));
  }

  if (zone.id === "chemistry_gradients") {
    const dots: Array<{ key: string; element: "circle"; attrs: Record<string, string | number> }> = [];
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 7; column += 1) {
        dots.push({
          key: `${prefix}-chem-dot-${row}-${column}`,
          element: "circle",
          attrs: {
            cx: 80 + column * ((layoutWidth - 160) / 6),
            cy: zone.y0 + 36 + row * (h / 4.5),
            r: 2.4 + (column % 2) * 0.8,
            fill: column % 3 === 0 ? zone.accent : zone.glow,
            opacity: 0.09,
          },
        });
      }
    }
    return dots;
  }

  if (zone.id === "cell_biology") {
    return [
      {
        key: `${prefix}-cell-membrane-a`,
        element: "path",
        attrs: {
          d: `M ${layoutWidth * 0.12} ${cy - 18} C ${layoutWidth * 0.35} ${cy - 42}, ${layoutWidth * 0.65} ${cy + 30}, ${layoutWidth * 0.88} ${cy - 10}`,
          fill: "none",
          stroke: zone.accent,
          strokeWidth: 2,
          opacity: 0.12,
        },
      },
      {
        key: `${prefix}-cell-membrane-b`,
        element: "path",
        attrs: {
          d: `M ${layoutWidth * 0.16} ${cy + 28} C ${layoutWidth * 0.4} ${cy + 8}, ${layoutWidth * 0.62} ${cy + 52}, ${layoutWidth * 0.84} ${cy + 22}`,
          fill: "none",
          stroke: zone.glow,
          strokeWidth: 1.5,
          opacity: 0.1,
        },
      },
      {
        key: `${prefix}-cell-vesicle`,
        element: "ellipse",
        attrs: {
          cx: layoutWidth * 0.28,
          cy: cy + 8,
          rx: 34,
          ry: 18,
          fill: zone.glow,
          opacity: 0.06,
        },
      },
    ];
  }

  const pulses = [0.22, 0.42, 0.58, 0.78].map((ratio, index) => ({
    key: `${prefix}-neuro-pulse-${index}`,
    element: "path" as const,
    attrs: {
      d: `M ${layoutWidth * (ratio - 0.08)} ${zone.y0 + 40 + index * 22} Q ${layoutWidth * ratio} ${cy - 8 + (index % 2) * 16} ${layoutWidth * (ratio + 0.08)} ${zone.y1 - 48 - index * 18}`,
      fill: "none",
      stroke: index % 2 === 0 ? zone.accent : "#68d8c0",
      strokeWidth: 1.6,
      opacity: 0.11,
    },
  }));
  return pulses;
}

export function stratumLabelForTests(id: PrototypeStratumId) {
  return id;
}

export function stratumForConceptId(id: KnowledgeConceptId) {
  const illustration = ILLUSTRATION_BY_ID.get(id);
  return illustration ? STRATUM_BY_ILLUSTRATION[illustration] : null;
}