import { useCallback, useEffect, useRef, useState } from "react";
import type { FeedbackItem } from "@soma/shared-types";
import { createMyFeedback, fetchMyFeedback } from "./feedback-api.js";
import {
  appendFeedbackPage,
  prependFeedbackItem,
  toCreateFeedbackRequest,
  validateFeedbackDraft,
  type FeedbackDraft,
  type FeedbackFieldError,
} from "./feedback-model.js";

export type FeedbackLoadState = "loading" | "ready" | "error";
export type FeedbackSubmitKind = "created" | "duplicate";

export interface FeedbackSubmitRecord {
  kind: FeedbackSubmitKind;
  item: FeedbackItem;
}

export interface FeedbackHookState {
  live: boolean;
  state: FeedbackLoadState;
  items: FeedbackItem[];
  nextCursor: string | null;
  error: string | null;
  submitError: string | null;
  fieldErrors: FeedbackFieldError[];
  submitting: boolean;
  loadingMore: boolean;
  lastSubmit: FeedbackSubmitRecord | null;
  reload: () => void;
  loadMore: () => Promise<void>;
  submit: (draft: FeedbackDraft) => Promise<FeedbackSubmitRecord | null>;
}

/**
 * LIVE (`live: true`) uses GET/POST /me/feedback. DEMO never calls those
 * endpoints, never writes, and never touches XP.
 */
export function useFeedback(options: {
  live: boolean;
  userId: string | null;
}): FeedbackHookState {
  const { live, userId } = options;
  const [state, setState] = useState<FeedbackLoadState>(live ? "loading" : "ready");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FeedbackFieldError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastSubmit, setLastSubmit] = useState<FeedbackSubmitRecord | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const pendingRef = useRef(false);
  const nextCursorRef = useRef<string | null>(null);
  nextCursorRef.current = nextCursor;

  useEffect(() => {
    if (!live || !userId) {
      setState("ready");
      setItems([]);
      setNextCursor(null);
      setError(null);
      setSubmitError(null);
      setLastSubmit(null);
      return;
    }

    let cancelled = false;
    setState("loading");
    setError(null);
    void fetchMyFeedback()
      .then((page) => {
        if (cancelled) return;
        setItems([...page.items]);
        setNextCursor(page.nextCursor);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setNextCursor(null);
        setState("error");
        setError("feedback load failed");
      });

    return () => {
      cancelled = true;
    };
  }, [live, userId, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (!live || !userId || !nextCursorRef.current || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchMyFeedback(nextCursorRef.current);
      setItems((rows) => appendFeedbackPage(rows, page.items));
      setNextCursor(page.nextCursor);
    } catch {
      setError("feedback load failed");
    } finally {
      setLoadingMore(false);
    }
  }, [live, loadingMore, userId]);

  const submit = useCallback(
    async (draft: FeedbackDraft) => {
      const payload = toCreateFeedbackRequest(draft);
      if (!payload) {
        setFieldErrors(validateFeedbackDraft(draft));
        return null;
      }
      if (!live) return null;
      if (pendingRef.current) return null;
      pendingRef.current = true;
      setSubmitting(true);
      setSubmitError(null);
      setFieldErrors([]);
      try {
        const result = await createMyFeedback(payload);
        const record: FeedbackSubmitRecord = {
          kind: result.duplicate ? "duplicate" : "created",
          item: result.item,
        };
        setLastSubmit(record);
        setItems((rows) => prependFeedbackItem(rows, result.item));
        return record;
      } catch {
        setSubmitError("feedback submit failed");
        return null;
      } finally {
        pendingRef.current = false;
        setSubmitting(false);
      }
    },
    [live],
  );

  return {
    live,
    state,
    items,
    nextCursor,
    error,
    submitError,
    fieldErrors,
    submitting,
    loadingMore,
    lastSubmit,
    reload,
    loadMore,
    submit,
  };
}
