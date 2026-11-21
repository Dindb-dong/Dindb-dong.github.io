const SESSION_KEY = "dindbos.analytics.session";
const BROWSER_KEY = "dindbos.analytics.browser";
const SESSION_TIMEOUT = 30 * 60_000;
const SAVE_INTERVAL = 15_000;

function readStorage(storage, key) {
  try { return JSON.parse(window[storage].getItem(key)); }
  catch { return null; }
}

function writeStorage(storage, key, value) {
  try { window[storage].setItem(key, JSON.stringify(value)); }
  catch { /* Analytics still works in memory when storage is unavailable. */ }
}

function referrerHost(referrer) {
  try {
    const url = new URL(referrer);
    return url.origin === location.origin ? "direct" : url.hostname;
  } catch {
    return "direct";
  }
}

export function visibleTimeBetween(entries, from, to, isVisible) {
  if (!entries.length) return isVisible ? to - from : 0;
  let elapsed = 0;
  entries.forEach((entry, index) => {
    if (entry.name !== "visible") return;
    const start = Math.max(from, entry.startTime);
    const end = Math.min(to, entries[index + 1]?.startTime ?? to);
    elapsed += Math.max(0, end - start);
  });
  return elapsed;
}

export function startPortfolioAnalytics(root, entry) {
  const endpoint = import.meta.env.VITE_PORTFOLIO_ANALYTICS_URL;
  if (!endpoint || !window.crypto?.randomUUID || window.top !== window ||
      navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return;

  const params = new URLSearchParams(location.search);
  const test = params.get("analytics_test") === "1";
  const storageKey = test ? SESSION_KEY + ".test" : SESSION_KEY;
  const browserKey = test ? BROWSER_KEY + ".test" : BROWSER_KEY;
  let session = readStorage("sessionStorage", storageKey);
  if (!session || Date.now() - session.updated > SESSION_TIMEOUT) {
    const browser = readStorage("localStorage", browserKey) || { id: crypto.randomUUID(), ordinal: 0 };
    browser.ordinal += 1;
    writeStorage("localStorage", browserKey, browser);
    const now = Date.now();
    session = {
      version: 1, sessionId: crypto.randomUUID(), browserId: browser.id, ordinal: browser.ordinal,
      started: now, updated: now, country: "", region: "", referrer: referrerHost(document.referrer),
      campaign: [params.get("utm_source"), params.get("utm_medium"), params.get("utm_campaign")]
        .map(value => value?.match(/^[\w.-]{1,64}$/)?.[0]).filter(Boolean).join(" / "),
      device: (navigator.userAgentData?.mobile ?? /Mobi|Android/i.test(navigator.userAgent)) ? "mobile" : "desktop",
      entry, last: entry, ms: 0, firstApp: "", apps: {}, content: [], test,
    };
  }

  const shell = root?.querySelector(":scope > .dos-shell");
  function portfolioWindows() {
    return shell ? [...shell.querySelectorAll(".dos-window[data-app-id]")]
      .filter(frame => frame.closest(".dos-shell") === shell &&
        !frame.closest(".dos-recent-preview, .dos-recent-apps, .dos-recent-snapshot")) : [];
  }

  const observedWindows = new WeakSet(portfolioWindows());
  let previous = performance.now();
  let visible = document.visibilityState === "visible";
  let currentView;
  let dirty = true;
  let timer;

  function advance() {
    const now = performance.now();
    const elapsed = visibleTimeBetween(performance.getEntriesByType("visibility-state"), previous, now, visible);
    previous = now;
    if (elapsed > 0) {
      session.ms += elapsed;
      if (currentView) currentView.ms += elapsed;
      dirty = true;
    }
  }

  function logContent(marker) {
    const type = marker.dataset.analyticsType;
    const id = marker.dataset.analyticsId;
    const route = marker.dataset.analyticsRoute;
    let item = session.content.find(record => record.type === type && record.id === id);
    if (!item && session.content.length < 100) {
      item = { type, id, name: marker.dataset.analyticsName, views: 0, ms: 0,
        first: Date.now(), routes: "", github: 0, external: 0, pdf: 0 };
      session.content.push(item);
    }
    if (item && route && !item.routes.split(" · ").includes(route)) {
      item.routes = [item.routes, route].filter(Boolean).join(" · ");
    }
    return item;
  }

  function schedule() {
    timer ??= setTimeout(() => {
      timer = undefined;
      flush();
    }, 1200);
  }

  function scan() {
    if (!visible) return;
    const frames = portfolioWindows();
    for (const frame of frames) {
      if (observedWindows.has(frame)) continue;
      observedWindows.add(frame);
      const id = frame.dataset.appId;
      if (!/^[a-z][a-z0-9-]{0,45}$/.test(id)) continue;
      session.apps[id] = (Object.hasOwn(session.apps, id) ? session.apps[id] : 0) + 1;
      session.firstApp ||= id;
      dirty = true;
      schedule();
    }
    const active = frames.find(frame => frame.matches(".is-active:not([hidden]):not(.is-minimizing)"));
    const area = root ? active?.querySelector(".dos-window-content") : document.body;
    const usable = !root || (!root.inert && !root.querySelector(".dos-recent-apps[open]"));
    const marker = usable && area && [...area.querySelectorAll("[data-analytics-type]")]
      .find(element => element.getClientRects().length && getComputedStyle(element).visibility === "visible");
    const item = marker && logContent(marker);
    const screen = item ? `${item.type}:${item.id}` : active?.dataset.appId;
    if (screen && session.last !== screen) {
      session.last = screen;
      dirty = true;
      schedule();
    }
    if ((item || undefined) === currentView) return;
    advance();
    currentView = item || undefined;
    if (item) {
      item.views += 1;
    }
    dirty = true;
    schedule();
  }

  function flush() {
    advance();
    if (!dirty) return;
    dirty = false;
    session.updated = Math.max(Date.now(), session.updated + 1);
    writeStorage("sessionStorage", storageKey, session);
    const body = JSON.stringify(session);
    if (navigator.sendBeacon?.(endpoint, body)) return;
    fetch(endpoint, { method: "POST", mode: "no-cors", credentials: "omit", keepalive: true, body })
      .catch(() => { dirty = true; });
  }

  function recordLink(event) {
    if (event.type === "auxclick" && event.button !== 1) return;
    const link = event.target.closest?.("a[data-analytics-action]");
    if (!link) return;
    const marker = link.closest("[data-analytics-type]") ||
      link.closest(".portfolio-resume-app, .portfolio-detail-pane")?.querySelector("[data-analytics-type]");
    if (!marker) return;
    const item = logContent(marker);
    if (!item) return;
    const action = link.dataset.analyticsAction;
    if (action === "pdf") item.pdf++;
    else if (link.hostname === "github.com" || link.hostname === "www.github.com") item.github++;
    else item.external++;
    dirty = true;
    flush();
  }
  document.addEventListener("click", recordLink, { capture: true });
  document.addEventListener("auxclick", recordLink, { capture: true });

  document.addEventListener("visibilitychange", () => {
    advance();
    visible = document.visibilityState === "visible";
    if (!visible) flush();
    else scan();
  });
  window.addEventListener("pagehide", flush);
  window.addEventListener("pageshow", scan);
  window.addEventListener("resize", scan);
  if (root) {
    new MutationObserver(scan).observe(root, { subtree: true, childList: true, attributes: true,
      attributeFilter: ["class", "hidden", "inert", "open"] });
  }
  setInterval(() => { if (visible) { scan(); flush(); } }, SAVE_INTERVAL);
  scan();
  schedule();

  const geoUrl = import.meta.env.VITE_PORTFOLIO_GEO_URL;
  if (geoUrl && !session.country) {
    fetch(geoUrl, { credentials: "omit", referrerPolicy: "no-referrer" })
      .then(response => response.ok ? response.json() : null)
      .then(geo => {
        if (!geo) return;
        session.country = String(geo.country || "").slice(0, 64);
        session.region = String(geo.region || "").slice(0, 64);
        dirty = true;
        schedule();
      }).catch(() => {});
  }
}
