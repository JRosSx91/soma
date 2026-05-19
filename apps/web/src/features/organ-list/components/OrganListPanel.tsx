import { useTranslation } from "react-i18next";
import type { OrganId } from "@soma/shared-types";
import { useCameraStore } from "../../body-diagram-3d/store/useCamaraStore";
import type { OrganStateMap } from "../../body-diagram-3d/types.js";

interface OrganListPanelProps {
  organStates: OrganStateMap;
  onOrganClick: (organId: OrganId) => void;
  selected: OrganId | null;
}

const PROGRESS_COLOR = (fraction: number): string => {
  if (fraction < 0.33) return "bg-soma-organ-damaged";
  if (fraction < 0.66) return "bg-soma-organ-mid";
  return "bg-soma-organ-healthy";
};

export function OrganListPanel({
  organStates,
  onOrganClick,
  selected,
}: OrganListPanelProps) {
  const { t } = useTranslation(["organs", "main"]);
  const focusOrgan = useCameraStore((s) => s.focusOrgan);

  const activeOrgans = Array.from(organStates.entries()).filter(
    ([, state]) => state.active,
  );

  if (activeOrgans.length === 0) {
    return (
      <p className="text-xs text-soma-fg-muted italic">
        {t("main:panel.noOrgansAffected")}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {activeOrgans.map(([organId, state]) => {
        const isSelected = organId === selected;
        const pct = Math.round(state.progressFraction * 100);

        return (
          <button
            key={organId}
            onClick={() => {
              onOrganClick(organId);
              focusOrgan(organId);
            }}
            className={`
              w-full text-left px-3 py-2 rounded border transition-colors
              ${
                isSelected
                  ? "border-soma-accent bg-soma-bg-elevated"
                  : "border-soma-border-subtle bg-soma-bg-base/40 hover:border-soma-accent/50 hover:bg-soma-bg-elevated/50"
              }
            `}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-soma-fg-primary">
                {t(`organs:${organId}`, { defaultValue: organId })}
              </span>
              <span className="text-[10px] text-soma-fg-muted tabular-nums">
                {pct}%
              </span>
            </div>
            <div className="relative h-1 rounded-full overflow-hidden bg-soma-bg-elevated">
              <div
                className={`h-full transition-all duration-500 ${PROGRESS_COLOR(state.progressFraction)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
