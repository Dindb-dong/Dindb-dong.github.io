import { mountAndroidFullscreen } from "./android-fullscreen.js";

const startup = document.getElementById("portfolio-startup");
const app = document.getElementById("app");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const animated = () => document.documentElement.dataset.hello === "write" && !motion.matches;
let logs = Promise.resolve();
let failed = false;
let bootComplete = false;

function report(message) {
  if (bootComplete || failed) return;
  const elapsed = ((performance.now() - Number(document.documentElement.dataset.helloStarted)) / 1000).toFixed(3);
  // Only presentation is queued; data loading and rendering keep running concurrently.
  logs = logs.then(async () => {
    if (!animated() || failed) return;
    const line = document.createElement("li");
    line.textContent = `[${elapsed}s] ${message}`;
    const output = document.getElementById("boot-log");
    output.append(line);
    while (output.children.length > 10) output.firstElementChild.remove();
    await new Promise(resolve => setTimeout(resolve, 45));
  });
}

function waitForEntry() {
  return new Promise(resolve => {
    const lifetime = new AbortController();
    let pointerStarted = false;
    const enter = event => {
      event.preventDefault();
      event.stopPropagation();
      lifetime.abort();
      resolve();
    };
    window.addEventListener("keydown", event => {
      event.preventDefault();
      if (!event.repeat) enter(event);
    }, { capture: true, signal: lifetime.signal });
    startup.addEventListener("pointerdown", () => { pointerStarted = true; }, { signal: lifetime.signal });
    startup.addEventListener("click", event => {
      if (event.detail === 0 || pointerStarted) enter(event);
    }, { signal: lifetime.signal });
    document.getElementById("startup-enter").focus({ preventScroll: true });
  });
}

async function start() {
  report("Requesting runtime module");
  const { bootPortfolioOS } = await import("./main.js");
  report("Runtime module ready");
  await bootPortfolioOS(report);
  bootComplete = true;
  await logs;
  startup.removeAttribute("data-recovery");
  const confirmEntry = animated();
  if (confirmEntry) {
    startup.dataset.phase = "welcome";
    document.getElementById("startup-message").textContent = "Welcome. Portfolio ready. Press any key or tap to enter.";
    await waitForEntry();
  }
  app.inert = false;
  app.setAttribute("aria-busy", "false");
  mountAndroidFullscreen(document.documentElement.lang);
  if (confirmEntry) app.focus({ preventScroll: true });
  if (!animated()) {
    startup.remove();
    return;
  }
  startup.classList.add("is-leaving");
  const cleanup = () => { clearTimeout(timeout); startup.remove(); };
  const timeout = setTimeout(cleanup, 400);
  startup.addEventListener("animationend", event => { if (event.target === startup) cleanup(); }, { once: true });
}

start().catch(error => {
  failed = true;
  console.error("Portfolio startup failed", error);
  startup.setAttribute("data-recovery", "");
  document.getElementById("startup-message").textContent = "The portfolio could not load. Please try again or open the resume.";
});
