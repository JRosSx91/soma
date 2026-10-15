import { useTranslation } from "react-i18next";
import type { OrganId } from "@soma/shared-types";
import type { OrganStateMap } from "../../body-diagram-3d/types.js";

interface OrganListPanelProps {
  organStates: OrganStateMap;
  onOrganClick: (organId: OrganId) => void;
  selected: OrganId | null;
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soma-focus";

export function OrganListPanel({
  organStates,
  onOrganClick,
  selected,
}: OrganListPanelProps) {
  const { t } = useTranslation(["organs", "main"]);

  const activeOrgans = Array.from(organStates.entries()).filter(
    ([, state]) => state.active,
  );

  if (activeOrgans.length === 0) {
    return (
      <p className="text-xs text-soma-ink-muted italic">
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
            }}
            className={`
              w-full text-left px-3 py-2 rounded border transition-colors
              ${focusRing}
              ${
                isSelected
                  ? "border-soma-action bg-soma-raised"
                  : "border-soma-line bg-soma-canvas/40 hover:border-soma-action/50 hover:bg-soma-raised/50"
              }
            `}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-soma-ink">
                {t(`organs:${organId}`, { defaultValue: organId })}
              </span>
              <span className="text-[10px] text-soma-physiology tabular-nums">
                {pct}%
              </span>
            </div>
            <div className="relative h-1 rounded-full overflow-hidden bg-soma-raised">
              <div
                className="h-full transition-all duration-500 bg-soma-physiology"
                style={{ width: `${pct}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
