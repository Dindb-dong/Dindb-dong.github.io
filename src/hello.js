import "./hello.css";

export function showHello() {
  try {
    if (localStorage.getItem("portfolio-hello-seen")) return;
    localStorage.setItem("portfolio-hello-seen", "1");
  } catch {
    return;
  }
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  if (motion.matches) return;

  const greeting = document.createElement("div");
  greeting.className = "portfolio-hello";
  greeting.setAttribute("aria-hidden", "true");
  greeting.innerHTML = `<svg viewBox="0 0 244 126" fill="none" aria-hidden="true"><path pathLength="1" d="M18 103 C42 83 71 13 53 17 C35 20 23 101 30 103 C36 88 48 66 57 75 C64 83 43 108 62 103 C73 100 86 83 87 76 C89 62 65 69 68 89 C70 112 96 103 107 85 C121 64 142 16 130 16 C114 16 99 93 109 103 C119 116 143 79 153 52 C165 19 157 10 150 22 C137 44 128 100 142 104 C152 108 164 95 170 81 C176 66 192 65 195 79 C198 93 182 111 172 103 C160 92 173 71 190 74 C204 78 209 93 226 81"/></svg>`;
  document.body.append(greeting);

  const lifetime = new AbortController();
  const dismiss = () => {
    clearTimeout(timeout);
    lifetime.abort();
    greeting.remove();
  };
  const timeout = setTimeout(dismiss, 2350);
  greeting.addEventListener("animationend", event => {
    if (event.target === greeting) dismiss();
  }, { signal: lifetime.signal });
  window.addEventListener("pointerdown", dismiss, { capture: true, signal: lifetime.signal });
  window.addEventListener("keydown", dismiss, { capture: true, signal: lifetime.signal });
  motion.addEventListener("change", dismiss, { signal: lifetime.signal });
}
