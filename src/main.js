import { createAndBootDindbOS } from "dindbos";
import "dindbos/styles.css";
import "./portfolio.css";
import { createPortfolioApps } from "./portfolio-app.js";
import { EXPERIENCE_APPS } from "./experience-content.js";
import { loadPortfolioRuntime, currentData, portfolioDataForBuiltin } from "./portfolio-data.js";
import { buildPortfolioFileSystem } from "./portfolio-filesystem.js";
export async function bootPortfolioOS() {
  const runtime = await loadPortfolioRuntime();
  document.documentElement.lang = runtime.locale;
  const data = currentData(runtime);

  const os = await createAndBootDindbOS({
    root: "#app",
    theme: { mode: "light", accent: "#7c9fe5", wallpaper: "meadow", dockSize: 48 },
    session: {
      user: "kimdongwook",
      product: "DindbOS Portfolio",
      home: "/home/kimdongwook",
      groups: ["users", "portfolio"],
    },
    storage: {
      backend: "indexeddb",
      name: "dindbos-portfolio-runtime",
    },
    builtins: {
      includePortfolio: false,
      portfolioData: portfolioDataForBuiltin(data),
    },
    browserProvider: browserProvider(runtime.browserConfig),
    fileSystem: buildPortfolioFileSystem(runtime),
    apps: createPortfolioApps(runtime),
    launch: ["portfolio"],
    diagnostics: {
      evidence: [{
        id: "portfolio-host-restore",
        profile: "github-pages",
        status: "pass",
        runner: "DindbOS portfolio host",
        categories: ["sdk", "portfolio", "github-pages"],
        notes: "DindbOS boots from the installed package tarball and restores portfolio data as apps and VFS files.",
      }],
    },
  });
  runtime.launchExperience = (id) => {
    const app = EXPERIENCE_APPS.find((entry) => entry.id === id);
    if (app) os.launch(app.appId);
  };
  if (!document.querySelector("#app .portfolio-about")) throw new Error("Portfolio did not render");
  const shell = document.querySelector("#app .dos-shell");
  const wallpaper = getComputedStyle(shell).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
  if (wallpaper) {
    const image = new Image();
    image.src = wallpaper;
    let timeout;
    // A stalled decorative image must not block an otherwise usable portfolio.
    await Promise.race([image.decode().catch(() => {}), new Promise(resolve => { timeout = setTimeout(resolve, 1500); })]);
    clearTimeout(timeout);
  }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function browserProvider(config) {
  const production = location.hostname && location.hostname !== "127.0.0.1" && location.hostname !== "localhost";
  return {
    browserProviderUrl: production
      ? config.productionWebSocketUrl
      : config.localWebSocketUrl || config.productionWebSocketUrl,
    browserProviderLabel: production ? "Render Remote Chromium" : "Local Remote Chromium",
  };
}
