import { useTranslation } from "react-i18next";
import { previewFocus } from "../recovery-dashboard/focus.js";
import { TitleEmblem } from "./TitleEmblem.js";
import type { ProgressHookState } from "./useProgress.js";
import type { ProgressView } from "./progress-model.js";

const accentColor = { color: "rgb(var(--soma-shell-accent))" };
const fillColor = { backgroundColor: "rgb(var(--soma-shell-accent))" };

export function HomeProgressIdentity({
  live,
  state,
  progress,
  updatingTitle,
  reload,
}: Pick<ProgressHookState, "live" | "state" | "progress" | "updatingTitle" | "reload">) {
  const { t } = useTranslation("progress");

  if (state === "loading" && !progress) {
    return <IdentitySkeleton label={t("loading")} />;
  }

  if (state === "error" || (live && !progress)) {
    return (
      <div className="min-w-0 lg:col-span-2">
        <p className="text-sm text-soma-ink-secondary">{t("loadError")}</p>
        <button
          type="button"
          onClick={reload}
          className={`${previewFocus} mt-2 text-sm text-soma-action hover:text-soma-action-hover`}
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  if (!progress) {
    return <IdentitySkeleton label={t("loading")} />;
  }

  return <IdentityReady progress={progress} updatingTitle={updatingTitle} />;
}

function IdentityReady({
  progress,
  updatingTitle,
}: {
  progress: ProgressView;
  updatingTitle: boolean;
}) {
  const { t } = useTranslation(["progress", "recovery"]);
  const titleName = t(`progress:titles.${progress.equippedTitleId}`);
  const atCap = progress.xpToNextLevel === 0;
  const percent = atCap ? 100 : progress.percentToNextLevel;
  const barLabel = atCap ? t("progress:levelCap") : t("progress:nextLevel");
  const caption = atCap
    ? t("progress:levelCap")
    : t("progress:xpRemaining", {
        remaining: progress.xpToNextLevel,
        next: progress.level + 1,
      });
  const valueText = atCap
    ? t("progress:levelCap")
    : t("progress:xpProgress", {
        into: progress.xpIntoLevel,
        needed: progress.xpForNextLevel,
      });

  return (
    <>
      <span className="mx-auto shrink-0 lg:mx-0">
        <span className="inline-flex lg:hidden">
          <TitleEmblem titleId={progress.equippedTitleId} size={64} />
        </span>
        <span className="hidden lg:inline-flex">
          <TitleEmblem titleId={progress.equippedTitleId} size={80} />
        </span>
      </span>
      <div className="min-w-0" aria-busy={updatingTitle || undefined}>
        <p
          className="text-[11px] font-medium uppercase leading-snug tracking-[0.14em]"
          style={accentColor}
        >
          {t("recovery:homeExplorerIdentity")}
        </p>
        <p className="mt-1 text-lg font-semibold leading-snug text-soma-ink">{titleName}</p>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-soma-ink-secondary">
          <span>{t("progress:level", { level: progress.level })}</span>
          <span className="tabular-nums">{t("progress:totalXp", { count: progress.totalXp })}</span>
        </p>
        <div
          role="progressbar"
          aria-label={barLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={valueText}
          className="relative mt-3 h-2.5 w-full min-w-0 overflow-hidden rounded-full bg-soma-line"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${percent}%`, ...fillColor }}
          />
        </div>
        <p className="mt-1 text-[11px] leading-snug text-soma-ink-muted">{caption}</p>
        {updatingTitle ? <p className="sr-only">{t("progress:updatingTitle")}</p> : null}
      </div>
    </>
  );
}

function IdentitySkeleton({ label }: { label: string }) {
  return (
    <>
      <span
        className="mx-auto h-16 w-16 shrink-0 rounded-full bg-soma-line/80 lg:mx-0 lg:h-20 lg:w-20"
        aria-hidden="true"
      />
      <div className="min-w-0" aria-busy="true">
        <p className="text-sm text-soma-ink-secondary">{label}</p>
        <span className="mt-3 block h-2.5 w-full rounded-full bg-soma-line" aria-hidden="true" />
      </div>
    </>
  );
}
