import { useMemo, useState } from "react";
import { useAuth } from "../../auth/index.js";
import type { AchievementWithUnlockState } from "../../achievements/types.js";
import {
  achievementCatalog,
  achievementHiddenCopy,
} from "../achievement-catalog.generated.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";
import { AchievementMedal } from "../components/AchievementMedal.js";
import { DetailSheet } from "../components/DetailSheet.js";
import { type MedalTier } from "../components/MedalMark.js";
import { PageHeading } from "../components/PageHeading.js";
import { quantifiableAchievementProgress } from "../dashboard/home-progress.js";
import { useLiveAchievements } from "../hooks/useLiveAchievements.js";

type CatalogItem = (typeof achievementCatalog)[number];
type SubstanceFilter = "all" | CatalogItem["substanceId"];
type TierFilter = "all" | MedalTier;
type StatusFilter = "all" | "unlocked" | "locked" | "indeterminate";
type LiveRow = AchievementWithUnlockState;

const tierLabel: Record<MedalTier, string> = {
  bronze: "Bronce",
  silver: "Plata",
  gold: "Oro",
  platinum: "Platino",
};

const tierOptions: { id: TierFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "bronze", label: "Bronce" },
  { id: "silver", label: "Plata" },
  { id: "gold", label: "Oro" },
  { id: "platinum", label: "Platino" },
];

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "unlocked", label: "Desbloqueados" },
  { id: "locked", label: "Bloqueados" },
  { id: "indeterminate", label: "Sin avance" },
];

const unavailableCopy = {
  not_tracked: "Esta sustancia no está en tu perfil, así que no hay avance que calcular.",
  active_use: "El consumo sigue activo. El hito mide abstinencia y todavía no tiene avance.",
  missing_date: "Falta la fecha de la última vez, así que el avance no se puede calcular.",
};

export function AchievementsPage() {
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const sessionPending = authLoading;
  /** Live unlock state only under /app — /preview stays catalog/demo. */
  const liveEnabled = Boolean(user) && base === "/app";
  const live = useLiveAchievements(liveEnabled ? (user?.id ?? null) : null);
  const [substance, setSubstance] = useState<SubstanceFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const liveById = useMemo(() => {
    const map = new Map<string, LiveRow>();
    for (const row of live.rows ?? []) map.set(row.id, row);
    return map;
  }, [live.rows]);

  const showingLive = liveEnabled && live.rows !== null;
  const awaitingAccount =
    sessionPending || (liveEnabled && live.loading);
  const reviewCount = achievementCatalog.filter((item) => item.ruleReview).length;
  const unlockedCount = showingLive
    ? achievementCatalog.filter((item) => liveById.get(item.id)?.unlocked).length
    : 0;
  const catalogOnly = !showingLive && !awaitingAccount && !live.error;

  const substanceOptions = useMemo(() => {
    const seen = new Map<CatalogItem["substanceId"], string>();
    for (const item of achievementCatalog) {
      if (!seen.has(item.substanceId)) seen.set(item.substanceId, item.substanceName);
    }
    const options: { id: SubstanceFilter; label: string }[] = [
      { id: "all", label: "Todas" },
    ];
    for (const [id, label] of seen) options.push({ id, label });
    return options;
  }, []);

  const items = useMemo(
    () =>
      achievementCatalog.filter((item) => {
        if (substance !== "all" && item.substanceId !== substance) return false;
        if (tier !== "all" && item.tier !== tier) return false;
        if (status === "all") return true;
        if (!showingLive) return status === "locked";
        const liveRow = liveById.get(item.id) ?? null;
        const bucket = statusBucket(item, liveRow);
        return bucket === status;
      }),
    [substance, tier, status, showingLive, liveById],
  );

  const open = achievementCatalog.find((item) => item.id === openId) ?? null;
  const openLive = open ? liveById.get(open.id) : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-5 pb-6">
      <PageHeading
        eyebrow="Logros"
        title="Pequeños pasos, grandes cambios."
        demo={catalogOnly && base === "/preview"}
        description={
          showingLive
            ? "Avance hacia el umbral de cada hito, con tus fechas de abstinencia. Es una estimación del modelo de curvas, no una medición clínica ni un porcentaje de salud recuperada."
            : awaitingAccount
              ? "Comprobando la sesión para mostrar el avance guardado en tu cuenta."
              : base === "/preview"
                ? "Catálogo original de Soma. Vista pública: no hay logros desbloqueados ni fechas de cuenta."
                : "Catálogo de 106 logros. Inicia sesión para ver desbloqueos y progreso real."
        }
      />

      {awaitingAccount ? (
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-8 text-sm text-soma-ink-secondary">
          Cargando tus logros…
        </p>
      ) : null}

      {user && live.error ? (
        <div className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          <p>No se han podido cargar tus logros. El catálogo público sigue disponible al salir de la sesión.</p>
          <button
            type="button"
            onClick={live.reload}
            className={`${previewFocus} mt-3 rounded-full bg-soma-action px-3 py-1.5 text-sm font-semibold text-[#081018]`}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!awaitingAccount && !(user && live.error) ? (
        <>
          <dl className="grid grid-cols-3 gap-2">
            <Stat label="En el catálogo" value={String(achievementCatalog.length)} />
            <Stat label="Desbloqueados" value={String(unlockedCount)} />
            <Stat label="Revisión pendiente" value={String(reviewCount)} />
          </dl>

          <FilterGroup
            label="Filtrar por sustancia"
            value={substance}
            options={substanceOptions}
            onChange={setSubstance}
          />
          <FilterGroup
            label="Filtrar por nivel"
            value={tier}
            options={tierOptions}
            onChange={setTier}
          />
          {showingLive ? (
            <FilterGroup
              label="Filtrar por estado"
              value={status}
              options={statusOptions}
              onChange={setStatus}
            />
          ) : null}

          <section className="min-w-0">
            <h2 className="text-base font-semibold text-soma-ink">
              {items.length === achievementCatalog.length
                ? "Todos los logros"
                : "Logros del filtro"}
              <span className="ml-2 text-sm font-normal tabular-nums text-soma-ink-muted">
                {items.length}
              </span>
            </h2>
            {items.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-soma-line px-4 py-8 text-sm text-soma-ink-muted">
                Ningún logro del catálogo coincide con estos filtros.
              </p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((item) => (
                  <li key={item.id} className="min-w-0">
                    <AchievementCard
                      item={item}
                      live={showingLive ? (liveById.get(item.id) ?? null) : undefined}
                      onOpen={setOpenId}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}

      {open && !awaitingAccount && !(user && live.error) ? (
        <AchievementDetail
          item={open}
          live={showingLive ? (openLive ?? null) : undefined}
          onClose={() => setOpenId(null)}
        />
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-soma-line bg-soma-surface px-2 py-2 text-center sm:px-3">
      <dt className="text-[10px] uppercase leading-tight tracking-[0.08em] text-soma-ink-muted">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums text-soma-ink">{value}</dd>
    </div>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`${previewFocus} rounded-full px-3 py-1.5 text-sm ${
              selected
                ? "bg-soma-action text-[#081018]"
                : "bg-soma-surface text-soma-ink-secondary hover:bg-soma-raised hover:text-soma-ink"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function AchievementCard({
  item,
  live,
  onOpen,
}: {
  item: CatalogItem;
  live: LiveRow | null | undefined;
  onOpen: (id: string) => void;
}) {
  const view = describeCard(item, live);
  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      aria-label={view.label}
      className={`${previewFocus} flex h-full w-full min-w-0 flex-col items-center gap-2 rounded-2xl border bg-soma-surface p-3 text-center ${
        view.review ? "border-dashed border-soma-line-strong" : "border-solid border-soma-line"
      }`}
    >
      <AchievementMedal
        substanceId={item.substanceId}
        tier={item.tier}
        sealed={view.sealed}
        locked={!view.unlocked}
      />
      <span className="line-clamp-3 text-sm font-semibold leading-snug text-soma-ink" aria-hidden="true">
        {view.title}
      </span>
      <span className="text-[11px] text-soma-ink-secondary" aria-hidden="true">
        {item.substanceName}
        {" · "}
        {view.status}
      </span>
      {view.progress ? (
        <span className="flex w-full flex-col gap-1" aria-hidden="true">
          <span className="text-[11px] tabular-nums text-soma-ink">
            {view.progress.currentPercent}% / {view.progress.thresholdPercent}%
          </span>
          <span className="h-1 w-full overflow-hidden rounded-full bg-soma-line">
            <span
              className="block h-full rounded-full bg-soma-action"
              style={{ width: `${view.progress.towardPercent}%` }}
            />
          </span>
        </span>
      ) : null}
    </button>
  );
}

function AchievementDetail({
  item,
  live,
  onClose,
}: {
  item: CatalogItem;
  live: LiveRow | null | undefined;
  onClose: () => void;
}) {
  const view = describeCard(item, live);
  const thresholdPercent = Math.round(item.threshold * 100);

  if (view.sealed) {
    return (
      <DetailSheet title={achievementHiddenCopy.title} accessibleTitle="Logro oculto" onClose={onClose}>
        <div className="mb-3 flex justify-center">
          <AchievementMedal substanceId={item.substanceId} tier={item.tier} sealed locked size="detail" />
        </div>
        <p>Bloqueado. {tierLabel[item.tier]}.</p>
        <p className="mt-2">{achievementHiddenCopy.description}</p>
      </DetailSheet>
    );
  }

  return (
    <DetailSheet title={view.title} onClose={onClose}>
      <div className="mb-3 flex justify-center">
        <AchievementMedal
          substanceId={item.substanceId}
          tier={item.tier}
          locked={!view.unlocked}
          size="detail"
        />
      </div>
      <p>
        {view.status}. {item.substanceName}. {tierLabel[item.tier]}.
      </p>
      {view.unlocked && view.unlockedOn ? <p className="mt-2">Conseguido el {view.unlockedOn}.</p> : null}
      {view.review ? (
        <p className="mt-2">
          El catálogo guarda un umbral del {thresholdPercent}% en {item.organName}. No hay una curva de
          recuperación para este par, así que esta ficha no lo presenta como un objetivo alcanzable.
        </p>
      ) : (
        <p className="mt-2">
          Umbral del modelo: {thresholdPercent}% de avance de la curva en {item.organName}. No es una
          medición clínica.
        </p>
      )}
      {view.progress ? (
        <p className="mt-2">
          Avance actual {view.progress.currentPercent}% hacia el umbral del{" "}
          {view.progress.thresholdPercent}%. Es una estimación del modelo, no salud recuperada.
        </p>
      ) : null}
      {view.note ? <p className="mt-2">{view.note}</p> : null}
      {view.unlocked || !item.hidden ? <p className="mt-2">{item.description}</p> : null}
    </DetailSheet>
  );
}

interface CardView {
  title: string;
  status: string;
  label: string;
  sealed: boolean;
  unlocked: boolean;
  review: boolean;
  progress: ReturnType<typeof quantifiableAchievementProgress>;
  unlockedOn: string | null;
  note: string | null;
}

function statusBucket(
  item: CatalogItem,
  live: LiveRow | null,
): Exclude<StatusFilter, "all"> {
  if (live?.unlocked) return "unlocked";
  const view = describeCard(item, live);
  if (view.review || view.note !== null || live === null) return "indeterminate";
  return "locked";
}

function describeCard(item: CatalogItem, live: LiveRow | null | undefined): CardView {
  const unlocked = Boolean(live?.unlocked);
  const sealed = item.hidden && !unlocked;
  const review = !unlocked && (item.ruleReview || live?.progressAvailability === "pending_review");
  const unlockedOn = unlocked ? formatUnlockedAt(live?.unlockedAt ?? null) : null;
  const progress = quantifiableAchievementProgress({
    unlocked,
    hidden: sealed,
    review,
    progressAvailability: live?.progressAvailability,
    achievementProgress: live?.achievementProgress,
    threshold: item.threshold,
  });
  const gap = !sealed && !review && !unlocked ? gapCopy(live) : null;
  const note = gap?.note ?? null;

  const title = sealed ? achievementHiddenCopy.title : item.title;
  const status = unlocked
    ? unlockedOn
      ? `Desbloqueado el ${unlockedOn}`
      : "Desbloqueado"
    : review
      ? "Revisión pendiente"
      : (gap?.status ?? "Bloqueado");
  const progressLabel = progress
    ? ` Avance ${progress.currentPercent}% / umbral ${progress.thresholdPercent}%.`
    : "";
  const noteLabel = note ? ` ${note}` : "";
  const label = sealed
    ? `Logro oculto. Bloqueado. ${item.substanceName}. ${tierLabel[item.tier]}.`
    : `${title}. ${status}.${progressLabel}${noteLabel} ${item.substanceName}. ${tierLabel[item.tier]}.`;

  return { title, status, label, sealed, unlocked, review, progress, unlockedOn, note };
}

function gapCopy(
  live: LiveRow | null | undefined,
): { status: string; note: string } | null {
  if (live === undefined) return null;
  if (live === null) {
    return {
      status: "Sin datos",
      note: "Este logro no ha llegado en la respuesta, así que no se muestra un porcentaje.",
    };
  }
  if (live.progressAvailability === "ready") return null;
  if (live.progressAvailability === "not_tracked") {
    return { status: "Sin perfil", note: unavailableCopy.not_tracked ?? "" };
  }
  if (live.progressAvailability === "active_use") {
    return { status: "Consumo activo", note: unavailableCopy.active_use ?? "" };
  }
  if (live.progressAvailability === "missing_date") {
    return { status: "Sin fecha", note: unavailableCopy.missing_date ?? "" };
  }
  return {
    status: "Sin datos",
    note: "No hay datos suficientes para calcular el avance.",
  };
}

function formatUnlockedAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);
}
