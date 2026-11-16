import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canGoBack,
  canGoForward,
  clearChoice,
  createCravingCompanionSession,
  exitSession,
  goBack,
  goForward,
  restartSession,
  selectChoice,
  skipCurrentStep,
} from "./craving-companion-session.js";

test("session starts on welcome and walks forward through five steps", () => {
  let session = createCravingCompanionSession();
  assert.equal(session.step, "welcome");
  assert.equal(session.selectedChoice, null);
  assert.equal(session.exited, false);
  assert.equal(canGoBack(session), false);
  assert.equal(canGoForward(session), true);

  session = goForward(session);
  assert.equal(session.step, "ground");
  session = goForward(session);
  assert.equal(session.step, "observe");
  session = goForward(session);
  assert.equal(session.step, "choose");
  session = goForward(session);
  assert.equal(session.step, "close");
  assert.equal(canGoForward(session), false);
  assert.equal(canGoBack(session), true);
});

test("back, skip, choice selection, restart and exit stay in memory only", () => {
  let session = createCravingCompanionSession("ground");
  session = skipCurrentStep(session);
  assert.equal(session.step, "observe");
  session = skipCurrentStep(session);
  assert.equal(session.step, "choose");

  session = selectChoice(session, "breathing");
  assert.equal(session.selectedChoice, "breathing");
  session = clearChoice(session);
  assert.equal(session.selectedChoice, null);

  session = selectChoice(session, "safe_activity");
  session = goBack(session);
  assert.equal(session.step, "observe");

  session = restartSession();
  assert.equal(session.step, "welcome");
  assert.equal(session.selectedChoice, null);

  session = exitSession(session);
  assert.equal(session.exited, true);
  assert.equal(goForward(session).step, "welcome");
});

test("skip only applies on ground and observe", () => {
  assert.equal(skipCurrentStep(createCravingCompanionSession("welcome")).step, "welcome");
  assert.equal(skipCurrentStep(createCravingCompanionSession("choose")).step, "choose");
  assert.equal(skipCurrentStep(createCravingCompanionSession("close")).step, "close");
});
