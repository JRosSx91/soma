import { ApiError } from "../auth/client/api.js";

/**
 * LIVE journal create/patch vs view refresh.
 *
 * A 2xx write is persistence. Reloading the list/calendar is independent.
 * This does not make POST idempotent if the HTTP response is lost after the
 * server commits — it only stops a second POST from a form that already
 * saw success.
 */

export type JournalWriteStatus = "ok" | "http" | "uncertain";
export type JournalRefreshStatus = "ok" | "failed" | "skipped";

export interface JournalLiveSaveOutcome<T extends { id: string } = { id: string }> {
  write: JournalWriteStatus;
  refresh: JournalRefreshStatus;
  closeSheet: boolean;
  entry: T | null;
  error: unknown;
}

export function beginExclusive(lock: { current: boolean }): boolean {
  if (lock.current) return false;
  lock.current = true;
  return true;
}

export function endExclusive(lock: { current: boolean }): void {
  lock.current = false;
}

export function classifyJournalWriteFailure(error: unknown): "http" | "uncertain" {
  if (error instanceof ApiError) return "http";
  return "uncertain";
}

export async function runJournalLiveSave<T extends { id: string }>(input: {
  write: () => Promise<T>;
  refresh: () => Promise<void>;
}): Promise<JournalLiveSaveOutcome<T>> {
  let saved: T;
  try {
    saved = await input.write();
  } catch (error) {
    const write = classifyJournalWriteFailure(error);
    return {
      write,
      refresh: "skipped",
      closeSheet: false,
      entry: null,
      error,
    };
  }

  try {
    await input.refresh();
    return {
      write: "ok",
      refresh: "ok",
      closeSheet: true,
      entry: saved,
      error: null,
    };
  } catch (error) {
    return {
      write: "ok",
      refresh: "failed",
      closeSheet: true,
      entry: saved,
      error,
    };
  }
}
