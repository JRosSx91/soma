/**
 * PERF-01E local CWV probe (Chromium CDP). Not production Lighthouse.
 * Usage: node scripts/perf-01e-measure.mjs --url http://127.0.0.1:4173/ --scenario first|seen|skip|reduced
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);

function parseArgs(argv) {
  const out = { url: "http://127.0.0.1:4173/", scenario: "first", port: 9222 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--url") out.url = argv[++i];
    else if (a === "--scenario") out.scenario = argv[++i];
    else if (a === "--port") out.port = Number(argv[++i]);
  }
  return out;
}

function openCdp(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve());
    socket.addEventListener("error", (e) => reject(e));
  });
  socket.addEventListener("message", (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  function send(method, params = {}) {
    const msgId = ++id;
    return new Promise((resolve, reject) => {
      pending.set(msgId, { resolve, reject });
      socket.send(JSON.stringify({ id: msgId, method, params }));
    });
  }
  return { ready, send, close: () => socket.close() };
}

async function main() {
  const args = parseArgs(process.argv);
  const chromePath = chromeCandidates.find((p) => existsSync(p));
  if (!chromePath) {
    console.error(JSON.stringify({ error: "chrome_not_found" }));
    process.exit(2);
  }

  const profile = mkdtempSync(join(tmpdir(), "soma-perf-01e-"));
  const port = args.port;
  const chrome = spawn(
    chromePath,
    [
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--window-size=375,812",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] },
  );

  let version = null;
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        version = await res.json();
        break;
      }
    } catch {
      // wait
    }
    await delay(100);
  }
  if (!version) {
    chrome.kill();
    rmSync(profile, { recursive: true, force: true });
    console.error(JSON.stringify({ error: "cdp_not_ready" }));
    process.exit(3);
  }

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page") || targets[0];
  const cdp = openCdp(page.webSocketDebuggerUrl);
  await cdp.ready;

  await cdp.send("Network.enable");
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  const reduced = args.scenario === "reduced";
  if (reduced) {
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  } else {
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
    });
  }

  // Seed sessionStorage before measured navigation.
  await cdp.send("Page.navigate", { url: args.url });
  await delay(900);
  if (args.scenario === "seen") {
    await cdp.send("Runtime.evaluate", {
      expression: `sessionStorage.setItem("soma.landing-v2.intro.seen","1"); true`,
      returnByValue: true,
    });
  } else {
    await cdp.send("Runtime.evaluate", {
      expression: `sessionStorage.removeItem("soma.landing-v2.intro.seen"); true`,
      returnByValue: true,
    });
  }

  await cdp.send("Page.addScriptToEvaluateOnNewDocument", {
    source: `
      window.__perf01e = { fcp: null, lcp: null, cls: 0, lcpEl: null, entries: [] };
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.name === 'first-contentful-paint') window.__perf01e.fcp = e.startTime;
          }
        }).observe({ type: 'paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__perf01e.lcp = e.startTime;
            const node = e.element;
            window.__perf01e.lcpEl = node
              ? (node.tagName + (node.className ? '.' + String(node.className).trim().split(/\\s+/).slice(0,2).join('.') : ''))
              : null;
            window.__perf01e.entries.push({ t: e.startTime, size: e.size, url: e.url || null });
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (!e.hadRecentInput) window.__perf01e.cls += e.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (err) {}
    `,
  });

  const navStarted = Date.now();
  await cdp.send("Page.navigate", { url: args.url });

  if (args.scenario === "skip") {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      const click = await cdp.send("Runtime.evaluate", {
        expression: `
          (() => {
            const btn = [...document.querySelectorAll('button')].find((b) =>
              /skip|saltar/i.test(b.textContent || '') || /skip|saltar/i.test(b.getAttribute('aria-label') || '')
            );
            if (!btn) return false;
            btn.click();
            return true;
          })()
        `,
        returnByValue: true,
      });
      if (click.result?.value) break;
      await delay(40);
    }
  }

  const waitMs =
    args.scenario === "first" ? 5000 : args.scenario === "skip" ? 2800 : 2200;

  let heroVisibleAt = null;
  const probeStart = Date.now();
  while (Date.now() - probeStart < waitMs) {
    const probe = await cdp.send("Runtime.evaluate", {
      expression: `
        (() => {
          const img = document.querySelector('.landing-v2-hero__art-img');
          const overlay = document.querySelector('[role="dialog"][aria-modal="true"]');
          if (!img) return { ready: false };
          const imgOpacity = Number(getComputedStyle(img).opacity);
          const art = img.closest('.landing-v2-hero__art');
          const artOpacity = art ? Number(getComputedStyle(art).opacity) : 1;
          const overlayOpacity = overlay ? Number(getComputedStyle(overlay).opacity) : 0;
          const visible = imgOpacity > 0.05 && artOpacity > 0.05 && overlayOpacity < 0.85;
          return { ready: true, visible, imgOpacity, artOpacity, overlayOpacity, hasOverlay: !!overlay };
        })()
      `,
      returnByValue: true,
    });
    const v = probe.result?.value;
    if (v?.visible && heroVisibleAt == null) {
      heroVisibleAt = Date.now() - navStarted;
      break;
    }
    await delay(40);
  }

  await delay(Math.max(0, waitMs - (Date.now() - probeStart)));

  const metrics = await cdp.send("Runtime.evaluate", {
    expression: `
      (() => {
        const p = window.__perf01e || {};
        const img = document.querySelector('.landing-v2-hero__art-img');
        const art = img && img.closest('.landing-v2-hero__art');
        const overlay = document.querySelector('[role="dialog"][aria-modal="true"]');
        return {
          fcp: p.fcp,
          lcp: p.lcp,
          cls: p.cls,
          lcpEl: p.lcpEl,
          lcpEntries: p.entries,
          artOpacity: art ? Number(getComputedStyle(art).opacity) : null,
          imgOpacity: img ? Number(getComputedStyle(img).opacity) : null,
          overlayPresent: !!overlay,
          overlayOpacity: overlay ? Number(getComputedStyle(overlay).opacity) : 0,
          introSeen: sessionStorage.getItem('soma.landing-v2.intro.seen'),
        };
      })()
    `,
    returnByValue: true,
  });

  const result = {
    scenario: args.scenario,
    url: args.url,
    environment: "local-vite-preview",
    throttling: "none",
    viewport: "375x812@2",
    heroPerceptibleAtMs: heroVisibleAt,
    wallMs: Date.now() - navStarted,
    ...metrics.result.value,
  };

  console.log(JSON.stringify(result, null, 2));

  cdp.close();
  chrome.kill();
  await delay(200);
  rmSync(profile, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(JSON.stringify({ error: String(err && err.stack ? err.stack : err) }));
  process.exit(1);
});
