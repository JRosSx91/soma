import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { atlasSystems } from "../anatomy/atlas-config.js";
import { narrativeCatalogPairs, narrativePhases } from "../anatomy/narrative-catalog.js";
import { recoveryCatalogPairs } from "../anatomy/recovery-catalog.js";
import { listOrganSheets, systemSheetCoverage } from "../anatomy/organ-sheet.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { PageHeading } from "../components/PageHeading.js";
import { SubstanceIllustration } from "../components/SubstanceIllustration.js";
import { useSubstances } from "../../substances/index.js";
import type { ApiSubstance } from "../../../shared/api/types.js";

/**
 * Educational explore surface for Soma 2.0.
 * Uses the API substance catalog and the anatomy educational indexes.
 * Does not invent personal recovery estimates from demo figures.
 */
export function ExplorePage() {
  const base = useShellBase();
  const { data: substances, loading, error } = useSubstances();
  const [query, setQuery] = useState("");
  const [openSubstance, setOpenSubstance] = useState<ApiSubstance | null>(null);
  const [openSystemId, setOpenSystemId] = useState<string | null>(null);

  const narrativePairs = useMemo(() => narrativeCatalogPairs(), []);
  const recoveryPairs = useMemo(() => recoveryCatalogPairs(), []);

  const needle = query.trim().toLowerCase();
  const filteredSubstances = useMemo(() => {
    if (!substances) return [];
    if (!needle) return substances;
    return substances.filter((item) =>
      `${item.name} ${item.shortDescription} ${item.category}`.toLowerCase().includes(needle),
    );
  }, [needle, substances]);

  const filteredSystems = useMemo(() => {
    if (!needle) return atlasSystems;
    return atlasSystems.filter((system) => {
      const organNames = system.organs.map((organ) => organ.name).join(" ");
      return `${system.name} ${organNames}`.toLowerCase().includes(needle);
    });
  }, [needle]);

  const openSystem = atlasSystems.find((item) => item.id === openSystemId) ?? null;

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeading
        eyebrow="Explorar"
        title="Conocimiento para tu recuperación."
        description="Catálogo educativo de sustancias y sistemas a partir de los datos canónicos de Soma. No es una evaluación clínica personalizada."
        demo={base === "/preview"}
        aside={
          <label className="relative hidden sm:block">
            <span className="sr-only">Buscar en el catálogo educativo</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar sustancias o sistemas"
              className={`${previewFocus} w-56 rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
            />
          </label>
        }
      />
      <label className="sm:hidden">
        <span className="sr-only">Buscar en el catálogo educativo</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar sustancias o sistemas"
          className={`${previewFocus} w-full rounded-xl border border-soma-line bg-soma-surface px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
        />
      </label>

      {loading ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-8 text-sm text-soma-ink-secondary">
          Cargando el catálogo de sustancias…
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          No se ha podido cargar el catálogo de sustancias. Los sistemas anatómicos del atlas
          siguen disponibles más abajo.
        </p>
      ) : null}

      {!loading && !error && filteredSubstances.length === 0 && filteredSystems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
          Ningún resultado del catálogo para «{query.trim()}».
        </p>
      ) : null}

      {filteredSubstances.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-soma-ink">Sustancias</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">
            Descripciones y cobertura educativa del catálogo Soma.
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {filteredSubstances.map((item) => {
              const narrativeCount = narrativePairs.filter(
                (pair) => pair.substanceId === item.id,
              ).length;
              const recoveryCount = recoveryPairs.filter(
                (pair) => pair.substanceId === item.id,
              ).length;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenSubstance(item)}
                    className={`${previewFocus} flex h-full w-full flex-col overflow-hidden rounded-2xl border border-soma-line bg-soma-surface text-left hover:border-soma-line-strong`}
                  >
                    <span className="flex h-36 items-center justify-center bg-[#101820] px-3">
                      <SubstanceIllustration name={item.id} className="h-28 w-full" alt="" />
                    </span>
                    <span className="flex flex-1 flex-col gap-1 p-3">
                      <span className="font-semibold text-soma-ink">{item.name}</span>
                      <span className="text-xs leading-snug text-soma-ink-muted">
                        {narrativeCount} narrativas · {recoveryCount} curvas
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {filteredSystems.length > 0 ? (
        <section>
          <h2 className="text-base font-semibold text-soma-ink">Sistemas anatómicos</h2>
          <p className="mt-0.5 text-xs text-soma-ink-muted">
            Los doce sistemas del atlas. Abre el explorador para ver láminas y fichas disponibles.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredSystems.map((system) => {
              const coverage = systemSheetCoverage(system);
              return (
                <li key={system.id}>
                  <button
                    type="button"
                    onClick={() => setOpenSystemId(system.id)}
                    className={`${previewFocus} h-full w-full rounded-2xl border border-soma-line bg-soma-surface p-4 text-left hover:border-soma-line-strong`}
                  >
                    <span className="block font-semibold text-soma-ink">{system.name}</span>
                    <span className="mt-1 block text-xs leading-snug text-soma-ink-muted">
                      {coverage.emptySystem
                        ? "Sistema sin órganos asociados en el catálogo."
                        : `${coverage.organCount} órganos · ${coverage.organsWithPlate} con ilustración · ${coverage.organsWithEducation} con ficha anatómica`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {openSubstance ? (
        <DetailSheet title={openSubstance.name} onClose={() => setOpenSubstance(null)}>
          <SubstanceDetail
            substance={openSubstance}
            narrativeCount={
              narrativePairs.filter((pair) => pair.substanceId === openSubstance.id).length
            }
            recoveryCount={
              recoveryPairs.filter((pair) => pair.substanceId === openSubstance.id).length
            }
            anatomyHref={`${base}/anatomy`}
          />
        </DetailSheet>
      ) : null}

      {openSystem ? (
        <DetailSheet title={openSystem.name} onClose={() => setOpenSystemId(null)}>
          <SystemDetail systemId={openSystem.id} base={base} />
        </DetailSheet>
      ) : null}
    </div>
  );
}

function SubstanceDetail({
  substance,
  narrativeCount,
  recoveryCount,
  anatomyHref,
}: {
  substance: ApiSubstance;
  narrativeCount: number;
  recoveryCount: number;
  anatomyHref: string;
}) {
  return (
    <div className="space-y-3 text-sm text-soma-ink-secondary">
      <p>{substance.shortDescription}</p>
      <p>
        Categoría del catálogo: {substance.category}. Perfiles de daño:{" "}
        {substance.damageProfiles.length}. Logros asociados: {substance.achievements.length}.
      </p>
      <p>
        Cobertura educativa indexada: {narrativeCount} pares órgano×sustancia con narrativa (
        {narrativePhases.length} fases cada uno cuando existen) y {recoveryCount} curvas de
        recuperación en el catálogo. Son datos del modelo, no una predicción clínica personal.
      </p>
      {narrativeCount === 0 && recoveryCount === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
          Todavía no hay narrativas ni curvas educativas indexadas para esta sustancia en el
          explorador.
        </p>
      ) : null}
      <p>
        <Link
          to={anatomyHref}
          className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
        >
          Abrir el explorador anatómico
        </Link>
      </p>
    </div>
  );
}

function SystemDetail({ systemId, base }: { systemId: string; base: "/app" | "/preview" }) {
  const system = atlasSystems.find((item) => item.id === systemId);
  if (!system) return null;
  const sheets = listOrganSheets(system);

  return (
    <div className="space-y-3 text-sm text-soma-ink-secondary">
      {sheets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-soma-line px-3 py-2 text-soma-ink-muted">
          Este sistema todavía no tiene órganos asociados en el catálogo del atlas.
        </p>
      ) : (
        <ul className="space-y-2">
          {sheets.map((sheet) => (
            <li key={sheet.organId} className="rounded-xl border border-soma-line bg-soma-surface/60 px-3 py-2">
              <p className="font-medium text-soma-ink">{sheet.name}</p>
              <p className="mt-1 text-xs text-soma-ink-muted">
                {sheet.availability.hasPlate
                  ? "Ilustración individual disponible."
                  : "Sin ilustración individual."}{" "}
                {sheet.availability.hasEducation
                  ? "Ficha anatómica disponible."
                  : "Sin ficha anatómica todavía."}{" "}
                {sheet.availability.narrativeSubstanceIds.length} narrativas ·{" "}
                {sheet.availability.recoverySubstanceIds.length} curvas.
              </p>
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link
          to={`${base}/anatomy`}
          className={`${previewFocus} text-soma-action hover:text-soma-action-hover`}
        >
          Ver en el explorador anatómico
        </Link>
      </p>
    </div>
  );
}
