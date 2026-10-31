import type { CreateFeedbackRequest, FeedbackItem, FeedbackListResponse } from "@soma/shared-types";
import {
  ApiError,
  apiRequest,
  getAccessToken,
  refreshAccessSession,
} from "../auth/client/api.js";
import { parseFeedbackItem, parseFeedbackList } from "./feedback-model.js";

const API_BASE_URL =
  (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL ?? "";

export interface CreateFeedbackResult {
  item: FeedbackItem;
  duplicate: boolean;
}

function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

async function parseHttpError(response: Response): Promise<ApiError> {
  let message = `HTTP ${response.status}`;
  let code: string | undefined;
  let details: unknown;
  try {
    const errorBody = await response.json();
    details = errorBody;
    if (typeof errorBody.message === "string") {
      message = errorBody.message;
    } else if (Array.isArray(errorBody.message)) {
      message = errorBody.message.join("; ");
    }
    if (typeof errorBody.code === "string") code = errorBody.code;
  } catch {
    /* non-JSON */
  }
  return new ApiError(response.status, message, code, details);
}

/** LIVE only. Preview/DEMO must not call this. */
export function fetchMyFeedback(cursor?: string): Promise<FeedbackListResponse> {
  const path = cursor
    ? `/me/feedback?cursor=${encodeURIComponent(cursor)}`
    : "/me/feedback";
  return apiRequest<unknown>(path).then((payload) => {
    const parsed = parseFeedbackList(payload);
    if (!parsed) throw new Error("Invalid feedback list");
    return parsed;
  });
}

/** LIVE only. 201 = created, 200 = recent duplicate. Never logs title or body. */
export async function createMyFeedback(
  body: CreateFeedbackRequest,
): Promise<CreateFeedbackResult> {
  const send = async (): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(apiUrl("/me/feedback"), {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    });
  };

  let response = await send();
  if (response.status === 401) {
    const refreshed = await refreshAccessSession();
    if (refreshed.ok) {
      response = await send();
    } else {
      throw await parseHttpError(response);
    }
  }
  if (!response.ok) throw await parseHttpError(response);
  const payload: unknown = await response.json();
  const item = parseFeedbackItem(payload);
  if (!item) throw new Error("Invalid feedback item");
  return { item, duplicate: response.status === 200 };
}
