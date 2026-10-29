import { useCallback, useEffect, useRef, useState } from "react";
import type { MissionAnswerResponse, MissionCatalogItem } from "@soma/shared-types";
import { fetchMyMissions, postMissionAnswer } from "./missions-api.js";
import { buildDemoMissions, evaluateDemoAnswer } from "./missions-demo.js";
import { applyAnswerToCatalog, shouldBlockMissionSubmit } from "./missions-model.js";

export type MissionsLoadState = "loading" | "ready" | "error";

export interface MissionAnswerRecord {
  missionId: string;
  result: MissionAnswerResponse;
}

export interface MissionsHookState {
  live: boolean;
  state: MissionsLoadState;
  missions: MissionCatalogItem[] | null;
  error: string | null;
  submitError: string | null;
  submittingMissionId: string | null;
  lastAnswer: MissionAnswerRecord | null;
  reload: () => void;
  submitAnswer: (
    missionId: string,
    optionId: string,
  ) => Promise<MissionAnswerResponse | null>;
}

/**
 * LIVE (`live: true`) uses GET/POST /me/missions. DEMO never calls those
 * endpoints and never touches GAM-01 progress XP.
 * A LIVE load error stays empty — it does not fall back to the DEMO catalog.
 */
export function useMissions(options: {
  live: boolean;
  userId: string | null;
}): MissionsHookState {
  const { live, userId } = options;
  const [state, setState] = useState<MissionsLoadState>(live ? "loading" : "ready");
  const [missions, setMissions] = useState<MissionCatalogItem[] | null>(
    live ? null : buildDemoMissions(new Set()),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittingMissionId, setSubmittingMissionId] = useState<string | null>(null);
  const [lastAnswer, setLastAnswer] = useState<MissionAnswerRecord | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const pendingRef = useRef(new Set<string>());
  const missionsRef = useRef(missions);
  missionsRef.current = missions;

  useEffect(() => {
    if (!live) {
      setState("ready");
      setMissions(buildDemoMissions(new Set()));
      setError(null);
      setSubmitError(null);
      setLastAnswer(null);
      return;
    }
    if (!userId) {
      setState("ready");
      setMissions(null);
      setError(null);
      setSubmitError(null);
      return;
    }

    let cancelled = false;
    setState("loading");
    setError(null);
    void fetchMyMissions()
      .then((row) => {
        if (cancelled) return;
        setMissions([...row.missions]);
        setState("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setMissions(null);
        setState("error");
        setError(err instanceof Error ? err.message : "missions load failed");
      });

    return () => {
      cancelled = true;
    };
  }, [live, userId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const submitAnswer = useCallback(
    async (missionId: string, optionId: string) => {
      if (shouldBlockMissionSubmit(pendingRef.current, missionId)) {
        return null;
      }
      pendingRef.current.add(missionId);
      setSubmittingMissionId(missionId);
      setSubmitError(null);
      try {
        let result: MissionAnswerResponse;
        if (!live) {
          const current = missionsRef.current?.find((row) => row.id === missionId);
          result = evaluateDemoAnswer(
            missionId,
            optionId,
            current?.state === "completed",
          );
        } else {
          result = await postMissionAnswer(missionId, optionId);
        }
        setLastAnswer({ missionId, result });
        setSubmitError(null);
        if (result.completed) {
          const stamp = new Date().toISOString();
          setMissions((rows) =>
            rows ? applyAnswerToCatalog(rows, missionId, result, stamp) : rows,
          );
        }
        return result;
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : "missions submit failed");
        throw err;
      } finally {
        pendingRef.current.delete(missionId);
        setSubmittingMissionId((current) => (current === missionId ? null : current));
      }
    },
    [live],
  );

  return {
    live,
    state,
    missions,
    error,
    submitError,
    submittingMissionId,
    lastAnswer,
    reload,
    submitAnswer,
  };
}
