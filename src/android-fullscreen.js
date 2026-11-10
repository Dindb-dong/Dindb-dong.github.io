export async function requestAndroidFullscreen() {
  const root = document.documentElement;
  const android = navigator.userAgentData?.platform
    ? navigator.userAgentData.platform === "Android"
    : /Android/i.test(navigator.userAgent);
  if (!android || document.fullscreenElement || !document.fullscreenEnabled || typeof root.requestFullscreen !== "function") return;
  try {
    await root.requestFullscreen({ navigationUI: "hide" });
  } catch {
    // Fullscreen is optional; browser rejection must not block portfolio entry.
  }
}
