/**
 * DEV-only fixture for Stratum 00. Provisional codes F00.01–F00.28 come from
 * the playable specification. Runtime ids stay in the soma:K###### shape so
 * they could later pass the public catalog checker, and they do not reuse the
 * ontology's K000xxx concepts. Nothing here is editorially authorized.
 */
import type {
  KnowledgeCatalog,
  KnowledgeConcept,
  KnowledgeConceptId,
  KnowledgeRelation,
} from "./knowledge-types.js";

export type KnowledgePrototypeState =
  | "available"
  | "researching"
  | "discovered"
  | "hinted"
  | "hidden";

export type KnowledgePrototypeScenario = "start" | "middle" | "advanced";

export type KnowledgePrototypeIllustration =
  | "root"
  | "frame"
  | "spacetime"
  | "milestone"
  | "compact"
  | "field"
  | "quantum"
  | "bridge"
  | "door"
  | "open";

export type PrototypeCluster = 1 | 2 | 3 | 4;

export type PrototypeVisualRole = "milestone" | "compact" | "convergence" | "bridge" | "door" | "open";

export type KnowledgePrototypeProgression =
  | { track: "spine"; tier: number }
  | {
      track: "branch";
      side: "left" | "right";
      anchor: KnowledgeConceptId;
      dropRows: number;
      chainDepth: number;
    };

export interface KnowledgePrototypeNode {
  id: KnowledgeConceptId;
  provisionalCode: string;
  sequence: number;
  cluster: PrototypeCluster;
  visualRole: PrototypeVisualRole;
  essential: boolean;
  generator: boolean;
  /** Visual only. Field stays in cluster IV and keeps its playable parent. */
  visualCue?: "forward-field";
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

/** Playable parents. Every multi-parent gate is AND. This is not the scientific graph. */
export const STRATUM_PLAYABLE_PARENTS: Readonly<Record<number, readonly number[]>> = {
  1: [],
  2: [1],
  3: [1],
  4: [2, 3],
  5: [2, 3],
  6: [5],
  7: [5],
  8: [6, 7],
  9: [8],
  10: [2, 3],
  11: [10],
  12: [10],
  13: [10],
  14: [13],
  15: [14],
  16: [14, 11],
  17: [14, 11],
  18: [15],
  19: [18],
  20: [19],
  21: [19],
  22: [19, 20],
  23: [2],
  24: [4, 23],
  25: [19, 23],
  26: [6, 19, 23],
  27: [8, 26],
  28: [7],
};

const ESSENTIAL = new Set([1, 2, 3, 5, 6, 10, 13, 14, 15, 18, 19, 23, 26]);

export function stratumRuntimeId(sequence: number): KnowledgeConceptId {
  return `soma:K9${String(100 + sequence).padStart(5, "0")}` as KnowledgeConceptId;
}

export function stratumProvisionalCode(sequence: number) {
  return `F00.${String(sequence).padStart(2, "0")}`;
}

interface NodeSeed {
  sequence: number;
  es: string;
  en: string;
  definitionEs: string;
  definitionEn: string;
  cluster: PrototypeCluster;
  visualRole: PrototypeVisualRole;
  illustration: KnowledgePrototypeIllustration;
  progression:
    | { track: "spine"; tier: number }
    | { track: "branch"; side: "left" | "right"; anchor: number; dropRows: number; chainDepth: number };
}

const SEEDS: readonly NodeSeed[] = [
  {
    sequence: 1,
    es: "Universo físico",
    en: "Physical universe",
    definitionEs: "Punto de partida del juego: la física estudia regularidades del mundo físico con magnitudes, modelos y límites de validez. No explica el origen del universo.",
    definitionEn: "The game's starting point: physics studies regularities of the physical world with quantities, models and limits of validity. It does not explain the origin of the universe.",
    cluster: 1,
    visualRole: "milestone",
    illustration: "root",
    progression: { track: "spine", tier: 0 },
  },
  {
    sequence: 2,
    es: "Espacio",
    en: "Space",
    definitionEs: "Sirve para situar distancias y posiciones.",
    definitionEn: "It is used to locate distances and positions.",
    cluster: 1,
    visualRole: "compact",
    illustration: "frame",
    progression: { track: "branch", side: "left", anchor: 1, dropRows: 0, chainDepth: 0 },
  },
  {
    sequence: 3,
    es: "Tiempo",
    en: "Time",
    definitionEs: "Ordena los cambios y permite hablar de antes y después.",
    definitionEn: "It orders change and makes before and after meaningful.",
    cluster: 1,
    visualRole: "compact",
    illustration: "frame",
    progression: { track: "branch", side: "right", anchor: 1, dropRows: 0, chainDepth: 0 },
  },
  {
    sequence: 4,
    es: "Causalidad",
    en: "Causality",
    definitionEs: "Dos sucesos solo pueden influirse si el orden entre ellos lo permite. No es un requisito del espacio-tiempo.",
    definitionEn: "Two events can influence each other only when the order between them allows it. It is not a requirement for spacetime.",
    cluster: 1,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "right", anchor: 3, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 5,
    es: "Espacio-tiempo",
    en: "Spacetime",
    definitionEs: "Espacio y tiempo se describen juntos. La separación entre sucesos depende del movimiento de quien mide.",
    definitionEn: "Space and time are described together. The separation between events depends on the motion of whoever measures.",
    cluster: 2,
    visualRole: "convergence",
    illustration: "spacetime",
    progression: { track: "spine", tier: 1 },
  },
  {
    sequence: 6,
    es: "Relatividad especial",
    en: "Special relativity",
    definitionEs: "Las leyes adoptan la misma forma para observadores en movimiento uniforme, con un límite invariante para la luz en el vacío.",
    definitionEn: "The laws take the same form for observers in uniform motion, with an invariant limit for light in vacuum.",
    cluster: 2,
    visualRole: "milestone",
    illustration: "milestone",
    progression: { track: "spine", tier: 2 },
  },
  {
    sequence: 7,
    es: "Gravitación",
    en: "Gravitation",
    definitionEs: "Los cuerpos se atraen. Es un hecho medido, anterior al modelo que lo explica.",
    definitionEn: "Bodies attract one another. That is a measured fact, prior to the model that explains it.",
    cluster: 2,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "right", anchor: 5, dropRows: 1, chainDepth: 0 },
  },
  {
    sequence: 8,
    es: "Relatividad general",
    en: "General relativity",
    definitionEs: "El modelo vigente describe la gravitación como geometría del espacio-tiempo. No es un requisito para estudiar partículas.",
    definitionEn: "The current model describes gravitation as spacetime geometry. It is not a requirement for studying particles.",
    cluster: 2,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 6, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 9,
    es: "Geometría del espacio-tiempo",
    en: "Spacetime geometry",
    definitionEs: "Cerca de una masa, relojes y trayectorias siguen una geometría distinta de la del aula.",
    definitionEn: "Near a mass, clocks and trajectories follow a geometry unlike the one of a classroom.",
    cluster: 2,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 8, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 10,
    es: "Simetría",
    en: "Symmetry",
    definitionEs: "Un cambio deja las leyes con la misma forma.",
    definitionEn: "A change leaves the laws in the same form.",
    cluster: 3,
    visualRole: "milestone",
    illustration: "milestone",
    progression: { track: "spine", tier: 3 },
  },
  {
    sequence: 11,
    es: "Simetrías espaciales",
    en: "Spatial symmetries",
    definitionEs: "Trasladar o girar el experimento no cambia las leyes.",
    definitionEn: "Translating or rotating the experiment does not change the laws.",
    cluster: 3,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "right", anchor: 10, dropRows: 0, chainDepth: 0 },
  },
  {
    sequence: 12,
    es: "Simetría temporal",
    en: "Time symmetry",
    definitionEs: "Desplazar el instante de inicio no cambia las leyes.",
    definitionEn: "Shifting the starting instant does not change the laws.",
    cluster: 3,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 10, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 13,
    es: "Teorema de Noether",
    en: "Noether's theorem",
    definitionEs: "Si la acción tiene una simetría continua, y las condiciones de contorno son las adecuadas, hay una magnitud que se conserva. No cubre cualquier parecido informal.",
    definitionEn: "If the action has a continuous symmetry, and the boundary conditions are suitable, a quantity is conserved. It does not cover every informal resemblance.",
    cluster: 3,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 10, dropRows: 0, chainDepth: 0 },
  },
  {
    sequence: 14,
    es: "Conservación",
    en: "Conservation",
    definitionEs: "En el dominio de aplicación de esa simetría, la magnitud asociada se mantiene.",
    definitionEn: "Within the domain where that symmetry applies, the associated quantity is unchanged.",
    cluster: 3,
    visualRole: "milestone",
    illustration: "milestone",
    progression: { track: "spine", tier: 4 },
  },
  {
    sequence: 15,
    es: "Energía",
    en: "Energy",
    definitionEs: "Cuando las leyes no cambian al desplazar el tiempo, la energía de un sistema aislado se conserva y puede cambiar de forma.",
    definitionEn: "When the laws do not change under a shift in time, the energy of an isolated system is conserved and can change form.",
    cluster: 3,
    visualRole: "compact",
    illustration: "field",
    progression: { track: "branch", side: "left", anchor: 14, dropRows: 0, chainDepth: 1 },
  },
  {
    sequence: 16,
    es: "Momento",
    en: "Momentum",
    definitionEs: "La invariancia ante traslaciones espaciales se corresponde con la conservación del momento.",
    definitionEn: "Invariance under spatial translations corresponds to conservation of momentum.",
    cluster: 3,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "right", anchor: 11, dropRows: 1, chainDepth: 2 },
  },
  {
    sequence: 17,
    es: "Momento angular",
    en: "Angular momentum",
    definitionEs: "La invariancia ante giros se corresponde con la conservación del momento angular. No es una rotación literal de una partícula puntual.",
    definitionEn: "Invariance under rotations corresponds to conservation of angular momentum. It is not the literal spinning of a point particle.",
    cluster: 3,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 14, dropRows: 1, chainDepth: 2 },
  },
  {
    sequence: 18,
    es: "Cuantización",
    en: "Quantization",
    definitionEs: "En muchos sistemas ligados, o al emitir y absorber luz, la energía cambia en cuantos. Un sistema libre puede tener un espectro continuo.",
    definitionEn: "In many bound systems, or when light is emitted and absorbed, energy changes in quanta. A free system can have a continuous spectrum.",
    cluster: 4,
    visualRole: "compact",
    illustration: "quantum",
    progression: { track: "branch", side: "left", anchor: 15, dropRows: 1, chainDepth: 2 },
  },
  {
    sequence: 19,
    es: "Estado cuántico",
    en: "Quantum state",
    definitionEs: "El estado permite calcular probabilidades de resultados. No asigna a la vez una trayectoria clásica segura.",
    definitionEn: "The state lets us calculate probabilities of outcomes. It does not also assign one certain classical trajectory.",
    cluster: 4,
    visualRole: "milestone",
    illustration: "quantum",
    progression: { track: "spine", tier: 5 },
  },
  {
    sequence: 20,
    es: "Superposición",
    en: "Superposition",
    definitionEs: "El estado puede combinar posibilidades que la experiencia cotidiana presenta por separado.",
    definitionEn: "The state can combine possibilities that everyday experience presents separately.",
    cluster: 4,
    visualRole: "compact",
    illustration: "quantum",
    progression: { track: "branch", side: "left", anchor: 19, dropRows: 0, chainDepth: 0 },
  },
  {
    sequence: 21,
    es: "Incertidumbre",
    en: "Uncertainty",
    definitionEs: "Ciertos pares de magnitudes no quedan tan determinados a la vez como en la física clásica.",
    definitionEn: "Certain pairs of quantities are not jointly as definite as in classical physics.",
    cluster: 4,
    visualRole: "compact",
    illustration: "quantum",
    progression: { track: "branch", side: "left", anchor: 19, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 22,
    es: "Probabilidad de los resultados",
    en: "Outcome probability",
    definitionEs: "La teoría predice probabilidades. Cómo hablar de lo que ocurre entre la preparación y el resultado admite interpretaciones distintas.",
    definitionEn: "The theory predicts probabilities. How to talk about what happens between preparation and outcome allows different interpretations.",
    cluster: 4,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 20, dropRows: 1, chainDepth: 2 },
  },
  {
    sequence: 23,
    es: "Campo físico",
    en: "Physical field",
    definitionEs: "Un campo asigna una magnitud a cada lugar y describe una influencia sin exigir un contacto instantáneo a distancia.",
    definitionEn: "A field assigns a quantity to each place and describes an influence without requiring instantaneous contact at a distance.",
    cluster: 4,
    visualRole: "milestone",
    illustration: "field",
    progression: { track: "branch", side: "left", anchor: 2, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 24,
    es: "Interacción",
    en: "Interaction",
    definitionEs: "Un sistema cambia el comportamiento posible de otro solo dentro del orden causal permitido.",
    definitionEn: "One system changes what another can do only within the causal order that is allowed.",
    cluster: 4,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "left", anchor: 23, dropRows: 1, chainDepth: 2 },
  },
  {
    sequence: 25,
    es: "Teoría cuántica de campos",
    en: "Quantum field theory",
    definitionEs: "Las partículas se describen como excitaciones de campos cuánticos. Este marco no se deduce del espacio-tiempo y no es una teoría de gravedad cuántica.",
    definitionEn: "Particles are described as excitations of quantum fields. This framework is not deduced from spacetime and is not a theory of quantum gravity.",
    cluster: 4,
    visualRole: "bridge",
    illustration: "bridge",
    progression: { track: "branch", side: "right", anchor: 19, dropRows: 1, chainDepth: 0 },
  },
  {
    sequence: 26,
    es: "Hacia el mundo subatómico",
    en: "Toward the subatomic world",
    definitionEs: "Puerta del estrato. Relatividad y física cuántica están bien comprobadas en sus dominios, y un marco único con la gravedad no está establecido. El estrato siguiente todavía no se puede jugar.",
    definitionEn: "The stratum door. Relativity and quantum physics are well tested in their domains, and a single framework that includes gravity is not established. The next stratum cannot be played yet.",
    cluster: 4,
    visualRole: "door",
    illustration: "door",
    progression: { track: "spine", tier: 6 },
  },
  {
    sequence: 27,
    es: "Gravedad cuántica",
    en: "Quantum gravity",
    definitionEs: "Nombre de un problema teórico abierto. Esta ficha no contiene una solución.",
    definitionEn: "The name of an open theoretical problem. This card does not contain a solution.",
    cluster: 4,
    visualRole: "open",
    illustration: "open",
    progression: { track: "branch", side: "right", anchor: 26, dropRows: 1, chainDepth: 1 },
  },
  {
    sequence: 28,
    es: "Principio de equivalencia",
    en: "Equivalence principle",
    definitionEs: "Caer en un campo gravitatorio y estar acelerado se parecen localmente.",
    definitionEn: "Falling in a gravitational field and being accelerated are locally alike.",
    cluster: 2,
    visualRole: "compact",
    illustration: "compact",
    progression: { track: "branch", side: "right", anchor: 7, dropRows: 1, chainDepth: 1 },
  },
];

const DISCLAIMER = {
  es: "Texto de prototipo DEV. No es una publicación editorial autorizada.",
  en: "DEV prototype copy. This is not an authorized editorial publication.",
};

/**
 * KnowledgeConcept requires these slots. They are compatibility values for the
 * DEV fixture, not editorial or ontological decisions. The public catalog
 * builder admits only editorialStatus "published", so these records stay out
 * of PUBLIC_KNOWLEDGE_CATALOG. The detail sheet hides them and shows F00.
 */
const DEV_FIXTURE_COMPATIBILITY = {
  ontologyType: "dev_fixture",
  families: ["dev_fixture"],
  scale: "dev_fixture",
  strata: ["DEV-S00"],
  editorialStatus: "candidate",
} as const;

function toConcept(seed: NodeSeed): KnowledgeConcept {
  return {
    id: stratumRuntimeId(seed.sequence),
    labels: { es: seed.es, en: seed.en },
    definition: { es: seed.definitionEs, en: seed.definitionEn },
    explanation: DISCLAIMER,
    ...DEV_FIXTURE_COMPATIBILITY,
    families: DEV_FIXTURE_COMPATIBILITY.families,
    strata: DEV_FIXTURE_COMPATIBILITY.strata,
    bindings: [],
  };
}

function toNode(seed: NodeSeed): KnowledgePrototypeNode {
  const id = stratumRuntimeId(seed.sequence);
  const progression: KnowledgePrototypeProgression =
    seed.progression.track === "spine"
      ? { track: "spine", tier: seed.progression.tier }
      : {
          track: "branch",
          side: seed.progression.side,
          anchor: stratumRuntimeId(seed.progression.anchor),
          dropRows: seed.progression.dropRows,
          chainDepth: seed.progression.chainDepth,
        };
  return {
    id,
    provisionalCode: stratumProvisionalCode(seed.sequence),
    sequence: seed.sequence,
    cluster: seed.cluster,
    visualRole: seed.visualRole,
    essential: ESSENTIAL.has(seed.sequence),
    generator: seed.sequence === 1 || seed.sequence === 5 || seed.sequence === 15 || seed.sequence === 23,
    visualCue: seed.sequence === 23 ? "forward-field" : undefined,
    illustration: seed.illustration,
    progression,
  };
}

export const KNOWLEDGE_PROTOTYPE_NODES: readonly KnowledgePrototypeNode[] = SEEDS.map(toNode);

export const KNOWLEDGE_PROTOTYPE_SPINE_IDS: readonly KnowledgeConceptId[] = KNOWLEDGE_PROTOTYPE_NODES.filter(
  (node) => node.progression.track === "spine",
).sort((left, right) => {
  const leftTier = left.progression.track === "spine" ? left.progression.tier : 0;
  const rightTier = right.progression.track === "spine" ? right.progression.tier : 0;
  return leftTier - rightTier;
}).map((node) => node.id);

const concepts = SEEDS.map(toConcept);

export const KNOWLEDGE_PROTOTYPE_CATALOG: KnowledgeCatalog = {
  concepts,
  relations: [
    relation(1, 2, 5),
    relation(2, 1, 2),
    relation(3, 12, 15),
    relation(4, 28, 8),
    relation(5, 23, 25),
  ],
  prerequisites: [],
  prerequisitePolicy: {
    blocksAccess: false,
    grantsXp: false,
    incomingAreCumulative: false,
  },
};

function relation(index: number, subject: number, object: number): KnowledgeRelation {
  return {
    id: `soma:R9${String(100 + index).padStart(5, "0")}` as KnowledgeRelation["id"],
    subject: stratumRuntimeId(subject),
    predicate: "related_to",
    object: stratumRuntimeId(object),
    editorialStatus: "candidate",
  };
}

export const KNOWLEDGE_PROTOTYPE_DEPENDENCIES: readonly KnowledgePrototypeDependency[] = Object.entries(
  STRATUM_PLAYABLE_PARENTS,
).flatMap(([child, parents]) =>
  parents.map((parent) => ({
    id: `proto-j-${parent}-${child}`,
    from: stratumRuntimeId(parent),
    to: stratumRuntimeId(Number(child)),
  })),
);

function visibilityStates(discovered: readonly number[]) {
  const owned = new Set(discovered.map((sequence) => stratumRuntimeId(sequence)));
  const states = {} as Record<KnowledgeConceptId, { state: KnowledgePrototypeState; progress?: number }>;
  for (const sequence of Object.keys(STRATUM_PLAYABLE_PARENTS).map(Number)) {
    const id = stratumRuntimeId(sequence);
    const parents = STRATUM_PLAYABLE_PARENTS[sequence] ?? [];
    const parentIds = parents.map((parent) => stratumRuntimeId(parent));
    if (owned.has(id)) states[id] = { state: "discovered" };
    else if (parentIds.every((parent) => owned.has(parent))) states[id] = { state: "available" };
    else if (parentIds.some((parent) => owned.has(parent))) states[id] = { state: "hinted" };
    else states[id] = { state: "hidden" };
  }
  return states;
}

const middleStates = visibilityStates([1, 2, 3, 5, 6, 10]);
middleStates[stratumRuntimeId(7)] = { state: "researching", progress: 58 };

export const KNOWLEDGE_PROTOTYPE_SCENARIOS: Readonly<Record<KnowledgePrototypeScenario, KnowledgePrototypeScenarioDefinition>> = {
  start: {
    id: "start",
    sparks: 0,
    productionPerMinute: 0,
    states: visibilityStates([1]),
  },
  middle: {
    id: "middle",
    sparks: 0,
    productionPerMinute: 0,
    states: middleStates,
  },
  advanced: {
    id: "advanced",
    sparks: 0,
    productionPerMinute: 0,
    states: visibilityStates([1, 2, 3, 5, 6, 10, 13, 14, 15, 18, 19, 23, 26]),
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
): KnowledgeCatalog {
  const identifiable = new Set(
    prototypeNodesForScenario(scenario)
      .filter((node) => node.state !== "hinted" && node.state !== "hidden")
      .map((node) => node.id),
  );
  return {
    ...KNOWLEDGE_PROTOTYPE_CATALOG,
    concepts: KNOWLEDGE_PROTOTYPE_CATALOG.concepts.filter((concept) => identifiable.has(concept.id)),
    relations: KNOWLEDGE_PROTOTYPE_CATALOG.relations.filter(
      (item) => identifiable.has(item.subject) && identifiable.has(item.object),
    ),
  };
}

export function validatePrototypeChapterGraph() {
  const nodeIds = new Set(KNOWLEDGE_PROTOTYPE_NODES.map((node) => node.id));
  if (nodeIds.size !== 28) {
    throw new Error(`Expected 28 prototype nodes, found ${nodeIds.size}`);
  }
  const indegree = new Map<KnowledgeConceptId, number>();
  const outgoing = new Map<KnowledgeConceptId, KnowledgeConceptId[]>();
  for (const id of nodeIds) {
    indegree.set(id, 0);
    outgoing.set(id, []);
  }
  for (const edge of KNOWLEDGE_PROTOTYPE_DEPENDENCIES) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(`Playable edge ${edge.id} leaves the fixture.`);
    }
    outgoing.get(edge.from)?.push(edge.to);
    indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
  }
  const queue = [...nodeIds].filter((id) => indegree.get(id) === 0);
  const ordering: KnowledgeConceptId[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    ordering.push(current);
    for (const next of outgoing.get(current) ?? []) {
      const remaining = (indegree.get(next) ?? 0) - 1;
      indegree.set(next, remaining);
      if (remaining === 0) queue.push(next);
    }
  }
  if (ordering.length !== nodeIds.size) {
    throw new Error("The playable Stratum 00 graph has a cycle.");
  }
  return { ordering, edgeCount: KNOWLEDGE_PROTOTYPE_DEPENDENCIES.length };
}
