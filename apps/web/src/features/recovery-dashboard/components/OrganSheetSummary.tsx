import { previewFocus } from "../focus.js";
import type { OrganAnatomicalSheet } from "../anatomy/organ-sheet.js";

/**
 * Resumen tab content for an atlas organ sheet.
 * Renders education when present; otherwise explicit empty states.
 * Does not invent prose, plates, narratives, or recovery figures.
 */
export function OrganSheetSummary({
  sheet,
  intro,
  onEffects,
  onRecovery,
}: {
  sheet: OrganAnatomicalSheet;
  /** System/organ-specific lead sentence from the explorer. */
  intro: string;
  onEffects: () => void;
  onRecovery: () => void;
}) {
  const { availability, education } = sheet;

  return (
    <div className="space-y-3">
      <p>{intro}</p>

      {!availability.hasPlate ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs text-soma-ink-muted">
          Sin ilustración individual todavía.
        </p>
      ) : null}

      {education ? (
        <div className="space-y-3">
          {sheet.location ? <AnatomyNote title="Localización" text={sheet.location} /> : null}
          <AnatomyNote title="Anatomía" text={education.anatomy} />
          <AnatomyNote title="Función" text={education.physiology} />
          <AnatomyNote title="Relación" text={education.relations} />
          {education.sources.length > 0 ? (
            <div>
              <h3 className="text-xs font-semibold text-soma-ink">Fuentes</h3>
              <ul className="mt-1 space-y-1">
                {education.sources.map((source) => (
                  <li key={source.href} className="text-[11px] leading-relaxed text-soma-ink-muted">
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
                    >
                      {source.citation}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs leading-relaxed text-soma-ink-muted">
          Todavía no hay una descripción anatómica en español para esta ficha.
        </p>
      )}

      <AvailabilityNotes sheet={sheet} />

      {availability.hasNarratives || availability.hasRecoveryCurves ? (
        <div className="flex flex-wrap gap-3">
          {availability.hasNarratives ? (
            <button
              type="button"
              onClick={onEffects}
              className={`${previewFocus} text-xs text-soma-action hover:text-soma-action-hover`}
            >
              Ver efectos
            </button>
          ) : null}
          {availability.hasRecoveryCurves ? (
            <button
              type="button"
              onClick={onRecovery}
              className={`${previewFocus} text-xs text-soma-action hover:text-soma-action-hover`}
            >
              Ver recuperación
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * System-level resumen when no organ is selected.
 * Does not invent organ sheets for empty systems.
 */
export function SystemSheetSummary({
  intro,
  emptySystem,
}: {
  intro: string;
  emptySystem: boolean;
}) {
  return (
    <div className="space-y-3">
      <p>{intro}</p>
      {emptySystem ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-xs text-soma-ink-muted">
          Este sistema todavía no tiene órganos asociados en el catálogo.
        </p>
      ) : null}
    </div>
  );
}

function AvailabilityNotes({ sheet }: { sheet: OrganAnatomicalSheet }) {
  const { availability } = sheet;
  const notes: string[] = [];

  // Only surface legitimate gaps. Complete sheets (e.g. respiratory) stay quiet.
  if (!availability.hasNarratives) {
    notes.push("Sin narrativas de sustancias indexadas para este órgano.");
  }
  if (!availability.hasRecoveryCurves) {
    notes.push("Sin curva de recuperación catalogada (puede ser una ausencia científica legítima).");
  }

  if (notes.length === 0) return null;

  return (
    <ul className="space-y-1 text-[11px] leading-relaxed text-soma-ink-muted">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

function AnatomyNote({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-1">
      <h3 className="text-xs font-semibold text-soma-ink">{title}</h3>
      <p>{text}</p>
    </section>
  );
}
