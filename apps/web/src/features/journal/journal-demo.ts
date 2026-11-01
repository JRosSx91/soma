import { JOURNAL_MILESTONE_KIND_IDS } from "@soma/shared-types";
import {
  localCivilDate,
  shiftCivilDate,
  type JournalEntry,
  type JournalMilestone,
} from "./journal-model.js";

/**
 * Local DEMO samples only. Never sent to the journal HTTP API.
 * Civil dates are relative to the viewer's local today so streak, calendar
 * and wellbeing average can be reviewed with populated cards.
 */
function stamp(occurredOn: string, hour: number): string {
  return `${occurredOn}T${String(hour).padStart(2, "0")}:12:00.000Z`;
}

function entry(
  over: Partial<JournalEntry> & Pick<JournalEntry, "id" | "occurredOn">,
): JournalEntry {
  const at = stamp(over.occurredOn, 18);
  return {
    createdAt: at,
    updatedAt: at,
    mood: null,
    sleep: null,
    energy: null,
    anxiety: null,
    cravingIntensity: null,
    cravingSubstanceId: null,
    wellbeingRating: null,
    title: null,
    body: null,
    highlighted: false,
    learning: false,
    emotionIds: [],
    triggerIds: [],
    ...over,
  };
}

export function buildJournalDemoEntries(now = new Date()): JournalEntry[] {
  const today = localCivilDate(now);
  const d = (ago: number) => shiftCivilDate(today, -ago);
  return [
    entry({
      id: "demo-journal-1",
      occurredOn: d(0),
      mood: 4,
      sleep: 4,
      energy: 4,
      anxiety: 2,
      wellbeingRating: 8,
      title: "Un día más cerca",
      body: "Hoy me he sentido más tranquilo. He dormido mejor y tuve más claridad mental.",
      highlighted: true,
      emotionIds: ["calm", "motivated"],
    }),
    entry({
      id: "demo-journal-1b",
      occurredOn: d(0),
      createdAt: stamp(d(0), 9),
      updatedAt: stamp(d(0), 9),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 7,
      title: "Por la mañana",
      body: "Anoté cómo empecé el día. Más tarde escribí otra vez.",
      emotionIds: ["calm"],
    }),
    entry({
      id: "demo-journal-2",
      occurredOn: d(1),
      mood: 4,
      sleep: 3,
      energy: 4,
      anxiety: 2,
      wellbeingRating: 7,
      title: "Paseo al atardecer",
      body: "Caminar un rato me ayudó a bajar el ritmo. Anoté lo que me sentó bien.",
      learning: true,
      emotionIds: ["grateful", "calm"],
    }),
    entry({
      id: "demo-journal-3",
      occurredOn: d(2),
      mood: 3,
      sleep: 4,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 7,
      body: "Día estable. Pude concentrarme en una tarea que tenía aparcada.",
      learning: true,
      emotionIds: ["motivated", "optimistic"],
    }),
    entry({
      id: "demo-journal-4",
      occurredOn: d(3),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 3,
      wellbeingRating: 6,
      title: "Más energía por la tarde",
      body: "La siesta corta y un vaso de agua me sentaron mejor de lo que esperaba.",
      emotionIds: ["tired", "grateful"],
      triggerIds: ["fatigue"],
    }),
    entry({
      id: "demo-journal-5",
      occurredOn: d(4),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 7,
      body: "Conversación difícil, pero salí más claro de lo que entré.",
      highlighted: true,
      emotionIds: ["anxious", "optimistic"],
      triggerIds: ["conflict"],
    }),
    entry({
      id: "demo-journal-6",
      occurredOn: d(6),
      mood: 2,
      sleep: 2,
      energy: 2,
      anxiety: 4,
      wellbeingRating: 5,
      cravingIntensity: 2,
      cravingSubstanceId: "alcohol",
      body: "Día más denso. El deseo apareció y pasó. No hay que interpretarlo como un fallo.",
      emotionIds: ["sad", "tired"],
      triggerIds: ["stress", "loneliness"],
    }),
    entry({
      id: "demo-journal-7",
      occurredOn: d(8),
      mood: 4,
      sleep: 4,
      energy: 4,
      anxiety: 1,
      wellbeingRating: 8,
      title: "Caminar ayuda",
      body: "Salir un rato me alivió el cansancio. Quiero recordarlo.",
      learning: true,
      emotionIds: ["calm", "grateful"],
    }),
    entry({
      id: "demo-journal-8",
      occurredOn: d(10),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 6,
      body: "Me siento con más energía y con ganas de retomar proyectos.",
      highlighted: true,
      emotionIds: ["motivated", "optimistic"],
    }),
    entry({
      id: "demo-journal-9",
      occurredOn: d(14),
      mood: 2,
      sleep: 3,
      energy: 2,
      anxiety: 3,
      wellbeingRating: 5,
      title: "Noche más corta",
      body: "Dormí menos, pero anoté cómo me sentí al despertar.",
      emotionIds: ["tired"],
      triggerIds: ["fatigue"],
    }),
    entry({
      id: "demo-journal-10",
      occurredOn: d(18),
      mood: 4,
      sleep: 4,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 8,
      body: "Un día sencillo. Bastó con observarme sin pedirme más.",
      emotionIds: ["calm", "grateful", "optimistic"],
    }),
    entry({
      id: "demo-journal-11",
      occurredOn: d(21),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 7,
      title: "Claridad al mediodía",
      body: "Pude leer con atención. Eso también cuenta.",
      learning: true,
      emotionIds: ["motivated"],
    }),
    entry({
      id: "demo-journal-12",
      occurredOn: d(25),
      mood: 3,
      sleep: 2,
      energy: 2,
      anxiety: 3,
      wellbeingRating: 6,
      body: "Semana irregular. Sigo registrando sin exigirme una racha perfecta.",
      emotionIds: ["irritable", "tired"],
      triggerIds: ["fatigue"],
    }),
    entry({
      id: "demo-journal-prev-month",
      occurredOn: d(40),
      mood: 3,
      sleep: 3,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 6,
      title: "Un mes más atrás",
      body: "Esta nota queda en otro mes para poder recorrer el calendario.",
      learning: true,
      emotionIds: ["optimistic"],
    }),
    entry({
      id: "demo-journal-older-month",
      occurredOn: d(70),
      mood: 4,
      sleep: 4,
      energy: 3,
      anxiety: 2,
      wellbeingRating: 8,
      title: "Hace un par de meses",
      body: "Una nota más antigua, para ver otro mes con registro.",
      highlighted: true,
      emotionIds: ["grateful", "calm"],
    }),
  ];
}

export function buildJournalDemoMilestones(now = new Date()): JournalMilestone[] {
  const today = localCivilDate(now);
  const d = (ago: number) => shiftCivilDate(today, -ago);
  const kinds = JOURNAL_MILESTONE_KIND_IDS;
  const notes = [
    "Noto más claridad al pensar con calma.",
    "He descansado mejor un par de noches.",
    "La ansiedad aparece y baja antes.",
    "Tengo más ganas de moverme.",
    "Puedo sostener la atención un rato más.",
    "El día se siente un poco más estable.",
  ];
  return kinds.map((kind, index) => {
    const occurredOn = d(3 + index * 4);
    return {
      id: `demo-milestone-${kind}`,
      kind,
      occurredOn,
      note: notes[index] ?? null,
      createdAt: stamp(occurredOn, 12),
      updatedAt: stamp(occurredOn, 12),
    };
  });
}

export const JOURNAL_DEMO_ENTRIES: readonly JournalEntry[] = buildJournalDemoEntries();
export const JOURNAL_DEMO_MILESTONES: readonly JournalMilestone[] =
  buildJournalDemoMilestones();

export type JournalDemoCopyFn = (
  key: string,
  options?: { defaultValue?: string },
) => string;

function demoEntryTitleKey(id: string): string {
  return `demo.entries.${id}.title`;
}

function demoEntryBodyKey(id: string): string {
  return `demo.entries.${id}.body`;
}

function demoMilestoneNoteKey(kind: string): string {
  return `demo.milestones.${kind}`;
}

export function isJournalDemoEntryId(id: string): boolean {
  return id.startsWith("demo-journal-");
}

export function isJournalDemoMilestoneId(id: string): boolean {
  return id.startsWith("demo-milestone-");
}

/** Overlay localized titles/bodies. LIVE rows are never passed here. */
export function presentJournalDemoEntries(
  t: JournalDemoCopyFn,
  now = new Date(),
): JournalEntry[] {
  return buildJournalDemoEntries(now).map((row) => ({
    ...row,
    title:
      row.title == null
        ? null
        : t(demoEntryTitleKey(row.id), { defaultValue: row.title }),
    body: row.body
      ? t(demoEntryBodyKey(row.id), { defaultValue: row.body })
      : row.body,
  }));
}

export function presentJournalDemoMilestones(
  t: JournalDemoCopyFn,
  now = new Date(),
): JournalMilestone[] {
  return buildJournalDemoMilestones(now).map((row) => ({
    ...row,
    note: row.note
      ? t(demoMilestoneNoteKey(row.kind), { defaultValue: row.note })
      : row.note,
  }));
}

/**
 * Relocalize sample copy in the in-memory DEMO session.
 * Does not restore deleted sample ids. Visitor-created rows stay as-is.
 */
export function relocalizeJournalDemoEntries(
  current: readonly JournalEntry[],
  seeded: readonly JournalEntry[],
): JournalEntry[] {
  const seededById = new Map(seeded.map((row) => [row.id, row]));
  return current.map((row) => {
    if (!isJournalDemoEntryId(row.id)) return row;
    const next = seededById.get(row.id);
    if (!next) return row;
    return { ...row, title: next.title, body: next.body };
  });
}

export function relocalizeJournalDemoMilestones(
  current: readonly JournalMilestone[],
  seeded: readonly JournalMilestone[],
): JournalMilestone[] {
  const seededById = new Map(seeded.map((row) => [row.id, row]));
  return current.map((row) => {
    if (!isJournalDemoMilestoneId(row.id)) return row;
    const next = seededById.get(row.id);
    if (!next) return row;
    return { ...row, note: next.note };
  });
}
