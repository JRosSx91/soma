import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createMyFeedback, fetchMyFeedback } from "./feedback-api.ts";

const api = readFileSync(new URL("./feedback-api.ts", import.meta.url), "utf8");
const BODY = "The save button does nothing after I write a note.";
const item = {
  id: "fb-1",
  category: "bug",
  title: "Save fails",
  body: BODY,
  status: "open",
  createdAt: "2026-10-29T12:00:00.000Z",
  updatedAt: "2026-10-29T12:00:00.000Z",
};

test("LIVE client uses GET/POST /me/feedback and does not log content", () => {
  assert.match(api, /\/me\/feedback/);
  assert.match(api, /method: "POST"/);
  assert.match(api, /Never logs title or body/);
  assert.equal(api.includes("console.log"), false);
  assert.equal(api.includes("awardXp"), false);
  assert.equal(api.includes("/me/progress"), false);
});

test("LIVE GET parses a public list page", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    assert.match(String(input), /\/me\/feedback$/);
    return new Response(JSON.stringify({ items: [item], nextCursor: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const page = await fetchMyFeedback();
    assert.equal(page.items.length, 1);
    assert.equal(page.items[0]?.id, "fb-1");
    assert.equal("fingerprint" in page.items[0]!, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("LIVE POST 201 is created and 200 is a recent duplicate", async () => {
  const originalFetch = globalThis.fetch;
  const calls: number[] = [];
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    assert.equal(init?.method, "POST");
    const payload = JSON.parse(String(init?.body)) as { title: string; userId?: string };
    assert.equal(payload.title, "Save fails");
    assert.equal(payload.userId, undefined);
    calls.push(1);
    const status = calls.length === 1 ? 201 : 200;
    return new Response(JSON.stringify(item), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const created = await createMyFeedback({
      category: "bug",
      title: "Save fails",
      body: BODY,
    });
    assert.equal(created.duplicate, false);
    const duplicate = await createMyFeedback({
      category: "bug",
      title: "Save fails",
      body: BODY,
    });
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.item.id, "fb-1");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("LIVE POST network failure rejects without XP", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: "down" }), { status: 500 })) as typeof fetch;
  try {
    await assert.rejects(() =>
      createMyFeedback({ category: "bug", title: "Save fails", body: BODY }),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
