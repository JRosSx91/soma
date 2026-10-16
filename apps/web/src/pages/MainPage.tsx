import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, User, LogOut } from "lucide-react";
import type { OrganId } from "@soma/shared-types";
import { useAuth } from "../features/auth/index.js";
import {
  useUserProfile,
  useOrganStates,
  MOCK_PROFILE,
} from "../features/profile/index.js";
import type { UserProfile } from "../features/profile/types.js";
import { BodyDiagram3D } from "../features/body-diagram-3d/index.js";
import { useCameraStore } from "../features/body-diagram-3d/store/useCamaraStore.js";
import type { OrganStateMap } from "../features/body-diagram-3d/index.js";
import {
  useNeurotransmitterState,
  NeurotransmitterPanel,
} from "../features/neurotransmitter-state/index.js";
import { LanguageSelector } from "../components/LanguageSelector.js";
import {
  useOrganNarrativeState,
  OrganNarrativePanel,
} from "../features/organ-narrative-state/index.js";
import { BottomSheet } from "../components/BottomSheet.js";
import { OrganListPanel } from "../features/organ-list/index.js";
import { useIsMobile } from "../hooks/useIsMobile.js";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soma-focus";

export function MainPage() {
  const { t } = useTranslation([
    "main",
    "common",
    "organs",
    "substances",
    "neurotransmitters",
    "neurotransmitter-phases",
    "phases",
    "organ-narrative",
    "achievements",
  ]);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profile: serverProfile,
    loading: loadingProfile,
    error: profileError,
  } = useUserProfile();
  const { entries: ntEntries } = useNeurotransmitterState();

  // Hover: drives the visual highlight in the 3D model.
  // Selected: drives the side panel content. Decoupled so the panel
  // persists when the cursor moves away from the organ to read it.
  const [hovered, setHovered] = useState<OrganId | null>(null);
  const [selected, setSelected] = useState<OrganId | null>(null);
  const [showNeurotransmitters, setShowNeurotransmitters] = useState(false);

  const { entries: narrativeEntries } = useOrganNarrativeState();
  const [showNarrative, setShowNarrative] = useState(false);

  const requestFocus = useCameraStore((state) => state.requestFocus);

  const handleSelect = (organId: OrganId | null) => {
    setSelected((prev) => (prev === organId ? null : organId));
    setShowNeurotransmitters(false);
    setShowNarrative(false);
  };

  // The resolved selection is the only camera signal. A second click toggles
  // back to null, which returns the camera to the overview instead of
  // framing the same organ again. Hover never writes this state.
  useEffect(() => {
    requestFocus(selected);
  }, [selected, requestFocus]);

  const adaptedProfile: UserProfile = useMemo(() => {
    if (!serverProfile) return MOCK_PROFILE;
    return {
      displayName: serverProfile.user.displayName,
      biologicalSex: serverProfile.user.biologicalSex,
      birthYear: serverProfile.user.birthYear,
      weightKg: serverProfile.user.weightKg ?? undefined,
      usages: serverProfile.usages.map((u) => ({
        substanceId:
          u.substanceId as UserProfile["usages"][number]["substanceId"],
        yearStarted: u.yearStarted,
        lastUseDate: u.lastUseDate,
        frequency: u.frequency,
        status: u.status,
      })),
    };
  }, [serverProfile]);

  const {
    states,
    loading: loadingStates,
    error: statesError,
    profile: organProfile,
  } = useOrganStates(adaptedProfile);

  const organStates: OrganStateMap = new Map();
  states.forEach((state, organId) => {
    organStates.set(organId, {
      progressFraction: state.progressFraction,
      active: true,
    });
  });

  const loading = loadingProfile || loadingStates;
  const error = profileError ?? statesError?.message ?? null;
  const hasNoUsages = serverProfile && serverProfile.usages.length === 0;

  // Filtered NT entries for the currently selected organ.
  const ntForSelected = selected
    ? ntEntries.filter((e) => e.organId === selected)
    : [];
  const narrativeForSelected = selected
    ? narrativeEntries.filter((e) => e.organId === selected)
    : [];
  const hasNarrativeData = narrativeForSelected.length > 0;
  const hasNtData = ntForSelected.length > 0;

  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-soma-canvas text-soma-ink">
      <header className="border-b border-soma-line px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-light tracking-wide">Soma</h1>
          <p className="text-xs text-soma-ink-muted mt-1 hidden md:block">
            {user?.displayName ?? "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSelector />
          <button
            onClick={() => navigate("/achievements")}
            aria-label={t("main:header.trophies")}
            title={t("main:header.trophies")}
            className={`
              flex items-center gap-2
              text-soma-reward hover:text-soma-ink
              transition-colors
              p-2 md:p-0
              rounded-sm
              ${focusRing}
            `}
          >
            <Trophy size={18} aria-hidden="true" />
            <span className="hidden md:inline text-xs">
              {t("main:header.trophies")}
            </span>
          </button>
          <button
            onClick={() => navigate("/onboarding")}
            aria-label={t("main:header.editProfile")}
            title={t("main:header.editProfile")}
            className={`
              flex items-center gap-2
              text-soma-ink-muted hover:text-soma-ink-secondary
              transition-colors
              p-2 md:p-0
              rounded-sm
              ${focusRing}
            `}
          >
            <User size={18} aria-hidden="true" />
            <span className="hidden md:inline text-xs">
              {t("main:header.editProfile")}
            </span>
          </button>
          <button
            onClick={logout}
            aria-label={t("common:signOut")}
            title={t("common:signOut")}
            className={`
              flex items-center gap-2
              text-soma-ink-muted hover:text-soma-ink-secondary
              transition-colors
              p-2 md:p-0
              rounded-sm
              ${focusRing}
            `}
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden md:inline text-xs">
              {t("common:signOut")}
            </span>
          </button>
        </div>
      </header>

      <main className="md:grid md:grid-cols-12 md:gap-6 md:p-8 md:max-w-7xl md:mx-auto">
        {/* 3D model area */}
        <section
          className="
            md:col-span-8
            md:bg-soma-surface md:border md:border-soma-line md:rounded md:p-2
            flex items-center justify-center
            h-[calc(100vh-73px)] md:h-auto md:min-h-[600px]
          "
        >
          {loading && (
            <p className="text-soma-ink-secondary">{t("common:loading")}</p>
          )}
          {error && <p className="text-soma-danger">{error}</p>}
          {!loading && !error && hasNoUsages && (
            <div className="text-center px-8 py-12">
              <p className="text-soma-ink-secondary mb-4">
                {t("main:empty.noSubstances")}
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className={`text-soma-action hover:text-soma-action-hover hover:underline rounded-sm ${focusRing}`}
              >
                {t("main:empty.addFirst")}
              </button>
            </div>
          )}
          {!loading && !error && !hasNoUsages && (
            <BodyDiagram3D
              biologicalSex={organProfile.biologicalSex}
              view="front"
              organStates={organStates}
              highlightedOrganId={hovered ?? selected}
              onOrganHover={setHovered}
              onOrganClick={handleSelect}
            />
          )}
        </section>

        {/* Side panel — desktop only */}
        <aside className="hidden md:block md:col-span-4 bg-soma-surface border border-soma-line rounded p-6">
          {selected === null ? (
            <>
              <h2 className="text-soma-ink-secondary text-sm uppercase tracking-wider mb-3">
                {t("main:panel.affectedOrgans")}
              </h2>
              <OrganListPanel
                organStates={organStates}
                onOrganClick={handleSelect}
                selected={selected}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => handleSelect(null)}
                className={`flex items-center gap-1 text-xs text-soma-ink-muted hover:text-soma-ink-secondary mb-4 transition-colors rounded-sm ${focusRing}`}
              >
                ← {t("main:panel.affectedOrgans")}
              </button>
              <PanelContent
                selected={selected}
                states={states}
                t={t}
                ntForSelected={ntForSelected}
                narrativeForSelected={narrativeForSelected}
                hasNtData={hasNtData}
                hasNarrativeData={hasNarrativeData}
                showNeurotransmitters={showNeurotransmitters}
                setShowNeurotransmitters={setShowNeurotransmitters}
                showNarrative={showNarrative}
                setShowNarrative={setShowNarrative}
              />
            </>
          )}
        </aside>
      </main>

      {/* Bottom sheet — mobile only. Conditionally rendered (not just
          hidden with CSS) so the body scroll lock effect doesn't run
          on desktop. */}
      {isMobile && (
        <BottomSheet
          open={selected !== null}
          onClose={() => handleSelect(null)}
        >
          <PanelContent
            selected={selected}
            states={states}
            t={t}
            ntForSelected={ntForSelected}
            narrativeForSelected={narrativeForSelected}
            hasNtData={hasNtData}
            hasNarrativeData={hasNarrativeData}
            showNeurotransmitters={showNeurotransmitters}
            setShowNeurotransmitters={setShowNeurotransmitters}
            showNarrative={showNarrative}
            setShowNarrative={setShowNarrative}
          />
        </BottomSheet>
      )}
    </div>
  );
}

interface PanelContentProps {
  selected: OrganId | null;
  states: ReturnType<typeof useOrganStates>["states"];
  t: ReturnType<typeof useTranslation>["t"];
  ntForSelected: ReturnType<typeof useNeurotransmitterState>["entries"];
  narrativeForSelected: ReturnType<typeof useOrganNarrativeState>["entries"];
  hasNtData: boolean;
  hasNarrativeData: boolean;
  showNeurotransmitters: boolean;
  setShowNeurotransmitters: (fn: (prev: boolean) => boolean) => void;
  showNarrative: boolean;
  setShowNarrative: (fn: (prev: boolean) => boolean) => void;
}

function PanelContent({
  selected,
  states,
  t,
  ntForSelected,
  narrativeForSelected,
  hasNtData,
  hasNarrativeData,
  showNeurotransmitters,
  setShowNeurotransmitters,
  showNarrative,
  setShowNarrative,
}: PanelContentProps) {
  return (
    <>
      <h2 className="text-soma-ink-secondary text-sm uppercase tracking-wider mb-3">
        {selected ? t("main:panel.selectedOrgan") : t("main:panel.clickPrompt")}
      </h2>
      {selected &&
        states.has(selected) &&
        (() => {
          const state = states.get(selected)!;
          const isActive = state.dominantStatus === "active";
          return (
            <div className="space-y-2 text-sm">
              <p className="text-soma-ink text-base">
                {t(`organs:${selected}`, { defaultValue: state.organName })}
              </p>

              {/* Active consumption badge */}
              {isActive && (
                <div className="my-3 p-2 rounded border border-soma-warning/40 bg-soma-warning/10">
                  <p className="text-xs text-soma-warning font-semibold uppercase tracking-wider">
                    {t("main:panel.activeConsumption")}
                  </p>
                  <p className="text-xs text-soma-ink-secondary mt-1 leading-relaxed">
                    {(() => {
                      const activeSubstances = state.contributingSubstances
                        .filter((c) => c.status === 'active')
                        .map((c) => t(`substances:${c.substanceId}.name`, { defaultValue: c.substanceId }))
                        .join(', ');
                      return t('main:panel.activeConsumptionDescription', { substance: activeSubstances });
                    })()}
                  </p>
                </div>
              )}

              <p className="text-soma-ink-muted">
                {t("main:panel.affectedBy")}:{" "}
                <span className="text-soma-ink-secondary capitalize">
                  {state.contributingSubstances
                    .map((c) =>
                      t(`substances:${c.substanceId}.name`, {
                        defaultValue: c.substanceId,
                      }),
                    )
                    .join(", ")}
                </span>
              </p>

              {/* Days abstinent / recovery — only meaningful for abstinent state */}
              {state.progressFraction > 0 && (
                <>
                  <p className="text-soma-ink-muted">
                    {t("main:panel.daysAbstinent")}:{" "}
                    <span className="text-soma-physiology tabular-nums">
                      {Math.floor(state.daysAbstinent)}
                    </span>
                  </p>
                  <p className="text-soma-ink-muted">
                    {t("main:panel.recovery")}:{" "}
                    <span className="text-soma-physiology tabular-nums">
                      {(state.progressFraction * 100).toFixed(1)}%
                    </span>
                  </p>
                </>
              )}
            </div>
          );
        })()}

      {selected && hasNtData && (
        <div className="mt-4 pt-4 border-t border-soma-line">
          <button
            onClick={() => setShowNeurotransmitters((prev) => !prev)}
            className={`text-xs text-soma-physiology hover:underline rounded-sm ${focusRing}`}
          >
            {showNeurotransmitters
              ? t("main:panel.hideNeurotransmitterState")
              : t("main:panel.showNeurotransmitterState")}
          </button>
          {showNeurotransmitters && (
            <NeurotransmitterPanel entries={ntForSelected} />
          )}
        </div>
      )}

      {selected && hasNarrativeData && (
        <div className="mt-4 pt-4 border-t border-soma-line">
          <button
            onClick={() => setShowNarrative((prev) => !prev)}
            className={`text-xs text-soma-physiology hover:underline rounded-sm ${focusRing}`}
          >
            {showNarrative
              ? t("main:panel.hideRecoveryProcess")
              : t("main:panel.showRecoveryProcess")}
          </button>
          {showNarrative && (
            <OrganNarrativePanel entries={narrativeForSelected} />
          )}
        </div>
      )}
    </>
  );
}
