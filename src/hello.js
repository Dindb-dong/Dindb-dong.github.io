const startup = document.getElementById("portfolio-startup");
const app = document.getElementById("app");
const lifetime = new AbortController();
const motion = matchMedia("(prefers-reduced-motion: reduce)");
document.dispatchEvent(new Event("portfolio-entry-ready"));
let writingTimeout;
const writing = new Promise(resolve => {
  const remaining = document.documentElement.dataset.hello === "write" && !document.documentElement.dataset.helloSkip && !motion.matches
    ? Math.max(0, 1600 - (performance.now() - Number(document.documentElement.dataset.helloStarted))) : 0;
  writingTimeout = setTimeout(resolve, remaining);
  window.addEventListener("pointerdown", resolve, { capture: true, signal: lifetime.signal });
  window.addEventListener("keydown", resolve, { capture: true, signal: lifetime.signal });
  motion.addEventListener("change", resolve, { signal: lifetime.signal });
});

// Start importing the OS immediately; handwriting never delays loading or rendering.
const boot = import("./main.js").then(({ bootPortfolioOS }) => bootPortfolioOS());
Promise.all([boot, writing]).then(() => {
  clearTimeout(writingTimeout);
  lifetime.abort();
  app.inert = false;
  app.setAttribute("aria-busy", "false");
  if (document.documentElement.dataset.hello !== "write" || motion.matches) {
    startup.remove();
    return;
  }
  startup.classList.add("is-leaving");
  const cleanup = () => { clearTimeout(timeout); startup.remove(); };
  const timeout = setTimeout(cleanup, 400);
  startup.addEventListener("animationend", event => { if (event.target === startup) cleanup(); }, { once: true });
}).catch(error => {
  clearTimeout(writingTimeout);
  lifetime.abort();
  console.error("Portfolio startup failed", error);
  startup.setAttribute("data-recovery", "");
  document.getElementById("startup-message").textContent = "The portfolio could not load. Please try again or open the resume.";
});
