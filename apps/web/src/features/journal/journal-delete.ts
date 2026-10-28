export type DeleteJournalEntryOutcome = "busy" | "ok" | "error";

/**
 * Deletes one journal entry. DEMO never calls the remote function.
 * LIVE waits for DELETE to succeed before the caller reloads views.
 */
export async function runDeleteJournalEntry(input: {
  live: boolean;
  demo: boolean;
  id: string;
  inFlight: { current: boolean };
  deleteRemote: (id: string) => Promise<void>;
}): Promise<DeleteJournalEntryOutcome> {
  if (input.inFlight.current) return "busy";
  if (!input.demo && !input.live) return "busy";

  input.inFlight.current = true;
  try {
    if (input.demo) return "ok";
    await input.deleteRemote(input.id);
    return "ok";
  } catch {
    return "error";
  } finally {
    input.inFlight.current = false;
  }
}
