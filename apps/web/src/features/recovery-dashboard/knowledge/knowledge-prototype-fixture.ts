/**
 * Development-only fixture for GAM-03B-VISUAL-01/02 and GAME-01D (19-node demo chapter).
 *
 * These records are synthetic and deliberately use the K900xxx range. They
 * are not sourced from docs/design, are not editorially approved, and must
 * never be imported by the public knowledge catalog.
 */
import type {
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgeRelation,
  PublicKnowledgeCatalog,
} from "./knowledge-types.js";

export type KnowledgePrototypeState =
  | "available"
  | "researching"
  | "discovered"
  | "hinted"
  | "hidden";

export type KnowledgePrototypeScenario = "start" | "middle" | "advanced";

export type KnowledgePrototypeIllustration =
  | "charge"
  | "ion"
  | "gradient"
  | "membrane"
  | "channel"
  | "potential"
  | "neuron"
  | "solution"
  | "equilibrium"
  | "osmosis"
  | "pump"
  | "capacitance"
  | "impulse"
  | "dendrite"
  | "axon"
  | "synapse"
  | "neurotransmitter"
  | "receptor"
  | "network";

export type KnowledgePrototypeProgression =
  | { track: "spine"; tier: number }
  | { track: "branch"; side: "left" | "right"; anchor: KnowledgeConceptId; dropRows: number };

export interface KnowledgePrototypeNode {
  id: KnowledgeConceptId;
  illustration: KnowledgePrototypeIllustration;
  progression: KnowledgePrototypeProgression;
}

export interface KnowledgePrototypeScenarioNode extends KnowledgePrototypeNode {
  state: KnowledgePrototypeState;
  progress?: number;
}

export interface KnowledgePrototypeScenarioDefinition {
  id: KnowledgePrototypeScenario;
  sparks: number;
  productionPerMinute: number;
  states: Readonly<Record<KnowledgeConceptId, {
    state: KnowledgePrototypeState;
    progress?: number;
  }>>;
}

export interface KnowledgePrototypeDependency {
  id: string;
  from: KnowledgeConceptId;
  to: KnowledgeConceptId;
}

const concept = (
  sequence: number,
  labels: { es: string; en: string },
  definition: { es: string; en: string },
  ontologyType: string,
  families: readonly string[],
  scale: string,
  strata: readonly string[],
): KnowledgeConcept & { editorialStatus: "published" } => ({
  id: `soma:K9${String(sequence).padStart(5, "0")}`,
  labels,
  definition,
  explanation: {
    es: "Texto sintético para probar la jerarquía visual, la lectura y la apertura de fichas. No constituye contenido científico revisado ni una publicación editorial.",
    en: "Synthetic copy used to test visual hierarchy, reading and card opening. It is neither reviewed scientific content nor an editorial publication.",
  },
  ontologyType,
  families,
  scale,
  strata,
  editorialStatus: "published",
  bindings: [],
});

const concepts = [
  concept(
    1,
    { es: "Carga eléctrica", en: "Electric charge" },
    {
      es: "Concepto ilustrativo para iniciar el recorrido visual de prueba.",
      en: "Illustrative concept used to start the prototype visual path.",
    },
    "physical_quantity",
    ["physics"],
    "scale_independent",
    ["S1"],
  ),
  concept(
    2,
    { es: "Ion", en: "Ion" },
    {
      es: "Entidad sintética para comprobar una primera bifurcación del mapa.",
      en: "Synthetic entity used to test the first branch of the map.",
    },
    "chemical_entity",
    ["chemistry"],
    "atomic",
    ["S3"],
  ),
  concept(
    3,
    { es: "Gradiente", en: "Gradient" },
    {
      es: "Estado ilustrativo que forma la segunda rama del prototipo.",
      en: "Illustrative state forming the second branch of the prototype.",
    },
    "quality_or_state",
    ["physics", "chemistry"],
    "scale_independent",
    ["S1"],
  ),
  concept(
    4,
    { es: "Membrana", en: "Membrane" },
    {
      es: "Estructura sintética utilizada para visualizar la convergencia de ramas.",
      en: "Synthetic structure used to visualise branches converging.",
    },
    "cellular_component",
    ["cell_biology"],
    "subcellular",
    ["S6"],
  ),
  concept(
    5,
    { es: "Canal iónico", en: "Ion channel" },
    {
      es: "Componente ilustrativo disponible para probar estados interactivos.",
      en: "Illustrative component available for testing interactive states.",
    },
    "cellular_component",
    ["biochemistry", "cell_biology"],
    "molecular",
    ["S7"],
  ),
  concept(
    6,
    { es: "Potencial de membrana", en: "Membrane potential" },
    {
      es: "Estado sintético pendiente dentro del recorrido visual.",
      en: "Synthetic pending state within the visual path.",
    },
    "quality_or_state",
    ["physics", "physiology"],
    "cellular",
    ["S7"],
  ),
  concept(
    7,
    { es: "Neurona", en: "Neuron" },
    {
      es: "Nodo ilustrativo de convergencia bioeléctrica en la demo.",
      en: "Illustrative bioelectric convergence node in the demo.",
    },
    "cell_type",
    ["histology", "physiology"],
    "cellular",
    ["S8"],
  ),
  concept(
    8,
    { es: "Solución iónica", en: "Ionic solution" },
    {
      es: "Mezcla demostrativa para ampliar la rama química del capítulo.",
      en: "Demonstration mixture extending the chapter's chemistry branch.",
    },
    "chemical_entity",
    ["chemistry"],
    "molecular",
    ["S3"],
  ),
  concept(
    9,
    { es: "Equilibrio iónico", en: "Ionic equilibrium" },
    {
      es: "Estado ilustrativo de transición entre ramas convergentes.",
      en: "Illustrative transition state between converging branches.",
    },
    "quality_or_state",
    ["chemistry", "physics"],
    "molecular",
    ["S4"],
  ),
  concept(
    10,
    { es: "Ósmosis", en: "Osmosis" },
    {
      es: "Proceso sintético para enlazar gradientes y membranas en la demo.",
      en: "Synthetic process linking gradients and membranes in the demo.",
    },
    "biological_process",
    ["cell_biology", "chemistry"],
    "cellular",
    ["S5"],
  ),
  concept(
    11,
    { es: "Bomba iónica", en: "Ion pump" },
    {
      es: "Mecanismo demostrativo de transporte activo en el árbol.",
      en: "Demonstration active-transport mechanism on the tree.",
    },
    "cellular_component",
    ["cell_biology", "biochemistry"],
    "molecular",
    ["S7"],
  ),
  concept(
    12,
    { es: "Capacitancia", en: "Capacitance" },
    {
      es: "Magnitud ilustrativa que une electrónica y membrana en la demo.",
      en: "Illustrative quantity linking electronics and membrane in the demo.",
    },
    "physical_quantity",
    ["physics", "physiology"],
    "cellular",
    ["S2"],
  ),
  concept(
    13,
    { es: "Impulso eléctrico", en: "Electrical impulse" },
    {
      es: "Evento sintético para probar picos visuales tardíos.",
      en: "Synthetic event for testing late visual peaks.",
    },
    "quality_or_state",
    ["physiology", "physics"],
    "cellular",
    ["S8"],
  ),
  concept(
    14,
    { es: "Dendrita", en: "Dendrite" },
    {
      es: "Extensión neuronal demostrativa en la rama de comunicación.",
      en: "Demonstration neuronal extension on the communication branch.",
    },
    "cellular_component",
    ["histology"],
    "cellular",
    ["S8"],
  ),
  concept(
    15,
    { es: "Axón", en: "Axon" },
    {
      es: "Vía conductora ilustrativa hacia sinapsis en el capítulo demo.",
      en: "Illustrative conducting path towards synapses in the demo chapter.",
    },
    "cellular_component",
    ["histology", "physiology"],
    "cellular",
    ["S8"],
  ),
  concept(
    16,
    { es: "Sinapsis", en: "Synapse" },
    {
      es: "Zona de contacto sintética entre canales y vías neurales.",
      en: "Synthetic contact zone between channels and neural paths.",
    },
    "cellular_component",
    ["physiology", "cell_biology"],
    "subcellular",
    ["S9"],
  ),
  concept(
    17,
    { es: "Neurotransmisor", en: "Neurotransmitter" },
    {
      es: "Mensajero químico demostrativo; no constituye fármaco ni consejo clínico.",
      en: "Demonstration chemical messenger; not a drug or clinical advice.",
    },
    "chemical_entity",
    ["biochemistry", "physiology"],
    "molecular",
    ["S9"],
  ),
  concept(
    18,
    { es: "Receptor", en: "Receptor" },
    {
      es: "Componente ilustrativo de acoplamiento en la fase tardía del capítulo.",
      en: "Illustrative coupling component in the late chapter phase.",
    },
    "cellular_component",
    ["biochemistry", "physiology"],
    "molecular",
    ["S9"],
  ),
  concept(
    19,
    { es: "Red neuronal", en: "Neural network" },
    {
      es: "Cierre demostrativo del cuaderno de 19 descubrimientos del prototipo.",
      en: "Demonstration finale of the prototype's 19-discovery notebook.",
    },
    "anatomical_structure",
    ["physiology", "neuroscience"],
    "organ",
    ["S10"],
  ),
] as const;

const relation = (
  sequence: number,
  subject: KnowledgeConceptId,
  object: KnowledgeConceptId,
): KnowledgeRelation & { editorialStatus: "published" } => ({
  id: `soma:R9${String(sequence).padStart(5, "0")}`,
  subject,
  predicate: "related_to",
  object,
  editorialStatus: "published",
});

const bySequence = (sequence: number) => concepts[sequence - 1]!.id;

export const KNOWLEDGE_PROTOTYPE_CATALOG = {
  concepts,
  relations: [
    relation(1, bySequence(1), bySequence(2)),
    relation(2, bySequence(1), bySequence(3)),
    relation(3, bySequence(1), bySequence(12)),
    relation(4, bySequence(2), bySequence(4)),
    relation(5, bySequence(2), bySequence(8)),
    relation(6, bySequence(3), bySequence(10)),
    relation(7, bySequence(3), bySequence(4)),
    relation(8, bySequence(4), bySequence(5)),
    relation(9, bySequence(4), bySequence(11)),
    relation(10, bySequence(4), bySequence(6)),
    relation(11, bySequence(5), bySequence(16)),
    relation(12, bySequence(6), bySequence(7)),
    relation(13, bySequence(6), bySequence(13)),
    relation(14, bySequence(6), bySequence(12)),
    relation(15, bySequence(5), bySequence(7)),
    relation(16, bySequence(7), bySequence(14)),
    relation(17, bySequence(7), bySequence(15)),
    relation(18, bySequence(8), bySequence(9)),
    relation(19, bySequence(9), bySequence(10)),
    relation(20, bySequence(10), bySequence(11)),
    relation(21, bySequence(12), bySequence(13)),
    relation(22, bySequence(14), bySequence(15)),
    relation(23, bySequence(15), bySequence(16)),
    relation(24, bySequence(16), bySequence(17)),
    relation(25, bySequence(17), bySequence(18)),
    relation(26, bySequence(13), bySequence(19)),
    relation(27, bySequence(15), bySequence(19)),
    relation(28, bySequence(18), bySequence(19)),
    relation(29, bySequence(11), bySequence(6)),
    relation(30, bySequence(16), bySequence(18)),
  ],
  prerequisites: [],
  prerequisitePolicy: {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  },
} satisfies PublicKnowledgeCatalog;

export const KNOWLEDGE_PROTOTYPE_SPINE_IDS: readonly KnowledgeConceptId[] = [
  bySequence(1),
  bySequence(2),
  bySequence(3),
  bySequence(4),
  bySequence(5),
  bySequence(6),
  bySequence(7),
  bySequence(14),
  bySequence(15),
  bySequence(16),
  bySequence(17),
  bySequence(18),
  bySequence(19),
];

export const KNOWLEDGE_PROTOTYPE_NODES: readonly KnowledgePrototypeNode[] = [
  { id: bySequence(1), illustration: "charge", progression: { track: "spine", tier: 0 } },
  { id: bySequence(2), illustration: "ion", progression: { track: "spine", tier: 1 } },
  { id: bySequence(3), illustration: "gradient", progression: { track: "spine", tier: 2 } },
  { id: bySequence(4), illustration: "membrane", progression: { track: "spine", tier: 3 } },
  { id: bySequence(5), illustration: "channel", progression: { track: "spine", tier: 4 } },
  { id: bySequence(6), illustration: "potential", progression: { track: "spine", tier: 5 } },
  { id: bySequence(7), illustration: "neuron", progression: { track: "spine", tier: 6 } },
  {
    id: bySequence(8),
    illustration: "solution",
    progression: { track: "branch", side: "left", anchor: bySequence(4), dropRows: 0.55 },
  },
  {
    id: bySequence(9),
    illustration: "equilibrium",
    progression: { track: "branch", side: "left", anchor: bySequence(8), dropRows: 0.55 },
  },
  {
    id: bySequence(10),
    illustration: "osmosis",
    progression: { track: "branch", side: "left", anchor: bySequence(9), dropRows: 0.55 },
  },
  {
    id: bySequence(11),
    illustration: "pump",
    progression: { track: "branch", side: "left", anchor: bySequence(10), dropRows: 0.55 },
  },
  {
    id: bySequence(12),
    illustration: "capacitance",
    progression: { track: "branch", side: "right", anchor: bySequence(6), dropRows: 0.55 },
  },
  {
    id: bySequence(13),
    illustration: "impulse",
    progression: { track: "branch", side: "right", anchor: bySequence(12), dropRows: 0.55 },
  },
  { id: bySequence(14), illustration: "dendrite", progression: { track: "spine", tier: 7 } },
  { id: bySequence(15), illustration: "axon", progression: { track: "spine", tier: 8 } },
  { id: bySequence(16), illustration: "synapse", progression: { track: "spine", tier: 9 } },
  { id: bySequence(17), illustration: "neurotransmitter", progression: { track: "spine", tier: 10 } },
  { id: bySequence(18), illustration: "receptor", progression: { track: "spine", tier: 11 } },
  { id: bySequence(19), illustration: "network", progression: { track: "spine", tier: 12 } },
];

/** Game-only prerequisites: spine chain plus delayed lateral branches. */
export const KNOWLEDGE_PROTOTYPE_DEPENDENCIES: readonly KnowledgePrototypeDependency[] = [
  { id: "game-spine-01", from: bySequence(1), to: bySequence(2) },
  { id: "game-spine-02", from: bySequence(2), to: bySequence(3) },
  { id: "game-spine-03", from: bySequence(3), to: bySequence(4) },
  { id: "game-spine-04", from: bySequence(4), to: bySequence(5) },
  { id: "game-spine-05", from: bySequence(5), to: bySequence(6) },
  { id: "game-spine-06", from: bySequence(6), to: bySequence(7) },
  { id: "game-spine-07", from: bySequence(7), to: bySequence(14) },
  { id: "game-spine-08", from: bySequence(14), to: bySequence(15) },
  { id: "game-spine-09", from: bySequence(15), to: bySequence(16) },
  { id: "game-spine-10", from: bySequence(16), to: bySequence(17) },
  { id: "game-spine-11", from: bySequence(17), to: bySequence(18) },
  { id: "game-spine-12", from: bySequence(18), to: bySequence(19) },
  { id: "game-branch-01", from: bySequence(4), to: bySequence(8) },
  { id: "game-branch-02", from: bySequence(8), to: bySequence(9) },
  { id: "game-branch-03", from: bySequence(4), to: bySequence(10) },
  { id: "game-branch-04", from: bySequence(9), to: bySequence(10) },
  { id: "game-branch-05", from: bySequence(10), to: bySequence(11) },
  { id: "game-branch-06", from: bySequence(6), to: bySequence(12) },
  { id: "game-branch-07", from: bySequence(12), to: bySequence(13) },
  { id: "game-branch-08", from: bySequence(7), to: bySequence(13) },
];

function scenarioStates(
  values: readonly (KnowledgePrototypeState | { state: KnowledgePrototypeState; progress: number })[],
): KnowledgePrototypeScenarioDefinition["states"] {
  return Object.fromEntries(
    KNOWLEDGE_PROTOTYPE_NODES.map((node, index) => {
      const value = values[index]!;
      return [node.id, typeof value === "string" ? { state: value } : value];
    }),
  );
}

export const KNOWLEDGE_PROTOTYPE_SCENARIOS: Readonly<
  Record<KnowledgePrototypeScenario, KnowledgePrototypeScenarioDefinition>
> = {
  start: {
    id: "start",
    sparks: 120,
    productionPerMinute: 0,
    states: scenarioStates([
      "discovered",
      "available",
      "hidden",
      ...Array.from({ length: 16 }, () => "hidden" as const),
    ]),
  },
  middle: {
    id: "middle",
    sparks: 2480,
    productionPerMinute: 34,
    states: scenarioStates([
      "discovered",
      "discovered",
      "discovered",
      "discovered",
      "discovered",
      "discovered",
      "discovered",
      "hidden",
      "hidden",
      "hidden",
      "hidden",
      "hidden",
      "hidden",
      { state: "researching", progress: 58 },
      "available",
      "hinted",
      ...Array.from({ length: 3 }, () => "hidden" as const),
    ]),
  },
  advanced: {
    id: "advanced",
    sparks: 14800,
    productionPerMinute: 112,
    states: scenarioStates([
      ...Array.from({ length: 17 }, () => "discovered" as const),
      { state: "researching", progress: 76 },
      "hinted",
    ]),
  },
};

export function prototypeNodesForScenario(
  scenario: KnowledgePrototypeScenario,
): readonly KnowledgePrototypeScenarioNode[] {
  const definition = KNOWLEDGE_PROTOTYPE_SCENARIOS[scenario];
  return KNOWLEDGE_PROTOTYPE_NODES.map((node) => ({
    ...node,
    ...definition.states[node.id],
  }));
}

export function prototypeCatalogForScenario(
  scenario: KnowledgePrototypeScenario,
): PublicKnowledgeCatalog {
  const identifiable = new Set(
    prototypeNodesForScenario(scenario)
      .filter((node) => node.state !== "hinted" && node.state !== "hidden")
      .map((node) => node.id),
  );
  return {
    ...KNOWLEDGE_PROTOTYPE_CATALOG,
    concepts: KNOWLEDGE_PROTOTYPE_CATALOG.concepts.filter((concept) => identifiable.has(concept.id)),
    relations: KNOWLEDGE_PROTOTYPE_CATALOG.relations.filter(
      (relation) => identifiable.has(relation.subject) && identifiable.has(relation.object),
    ),
  };
}

export function validatePrototypeChapterGraph() {
  const nodeIds = new Set(KNOWLEDGE_PROTOTYPE_NODES.map((node) => node.id));
  if (nodeIds.size !== 19) {
    throw new Error(`Expected 19 prototype nodes, found ${nodeIds.size}`);
  }
  const indegree = new Map<KnowledgeConceptId, number>();
  const outgoing = new Map<KnowledgeConceptId, KnowledgeConceptId[]>();
  for (const id of nodeIds) {
    indegree.set(id, 0);
    outgoing.set(id, []);
  }
  for (const edge of KNOWLEDGE_PROTOTYPE_DEPENDENCIES) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(`Dependency references unknown node: ${edge.id}`);
    }
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
    outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  }
  const root = KNOWLEDGE_PROTOTYPE_NODES[0]!.id;
  if ((indegree.get(root) ?? 0) !== 0) {
    throw new Error("Chapter root must have zero incoming game dependencies");
  }
  for (const node of KNOWLEDGE_PROTOTYPE_NODES.slice(1)) {
    if ((indegree.get(node.id) ?? 0) === 0) {
      throw new Error(`Unreachable or floating node without prerequisites: ${node.id}`);
    }
  }
  const visited = new Set<KnowledgeConceptId>();
  const queue: KnowledgeConceptId[] = [root];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    for (const next of outgoing.get(id) ?? []) {
      queue.push(next);
    }
  }
  if (visited.size !== nodeIds.size) {
    throw new Error("Not all prototype nodes are reachable from the chapter root");
  }
  const ordering: KnowledgeConceptId[] = [];
  const scratch = new Map(indegree);
  const ready = [...nodeIds].filter((id) => (scratch.get(id) ?? 0) === 0);
  while (ready.length > 0) {
    const id = ready.shift()!;
    ordering.push(id);
    for (const next of outgoing.get(id) ?? []) {
      scratch.set(next, (scratch.get(next) ?? 1) - 1);
      if (scratch.get(next) === 0) ready.push(next);
    }
  }
  if (ordering.length !== nodeIds.size) {
    throw new Error("Cycle detected in prototype game dependencies");
  }
  return { ordering, edgeCount: KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length };
}