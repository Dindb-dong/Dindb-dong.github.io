export function mountAndroidFullscreen(locale) {
  const root = document.documentElement;
  const android = navigator.userAgentData?.platform
    ? navigator.userAgentData.platform === "Android"
    : /Android/i.test(navigator.userAgent);
  if (!android || document.fullscreenElement || !document.fullscreenEnabled || typeof root.requestFullscreen !== "function") return;

  const ko = locale === "ko";
  const controls = document.createElement("div");
  controls.className = "portfolio-display-controls";
  controls.innerHTML = `<span role="status"></span><button type="button" class="portfolio-fullscreen"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/></svg><span>${ko ? "전체화면" : "Fullscreen"}</span></button><button type="button" class="portfolio-fullscreen-dismiss" aria-label="${ko ? "전체화면 안내 닫기" : "Dismiss fullscreen suggestion"}"><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M6 18 18 6"/></svg></button>`;
  const button = controls.querySelector("button");
  const status = controls.querySelector('[role="status"]');
  const dismiss = () => {
    clearTimeout(timeout);
    document.removeEventListener("fullscreenchange", dismiss);
    const focused = controls.contains(document.activeElement);
    controls.remove();
    if (focused) document.getElementById("app").focus({ preventScroll: true });
  };
  const timeout = setTimeout(dismiss, 10_000);
  controls.querySelector(".portfolio-fullscreen-dismiss").addEventListener("click", dismiss);
  button.addEventListener("click", async () => {
    button.disabled = true;
    status.textContent = "";
    try {
      await root.requestFullscreen({ navigationUI: "hide" });
      dismiss();
    } catch {
      status.textContent = ko ? "브라우저가 전체화면 전환을 허용하지 않았어요." : "The browser did not allow fullscreen.";
    } finally {
      button.disabled = false;
    }
  });
  document.addEventListener("fullscreenchange", dismiss);
  document.getElementById("app").before(controls);
}
