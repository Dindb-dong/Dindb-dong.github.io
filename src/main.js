import { createAndBootDindbOS } from "dindbos";
import "dindbos/styles.css";
import "./portfolio.css";
import { createPortfolioApps } from "./portfolio-app.js";
import { EXPERIENCE_APPS } from "./experience-content.js";
import { loadPortfolioRuntime, currentData, portfolioDataForBuiltin } from "./portfolio-data.js";
import { buildPortfolioFileSystem } from "./portfolio-filesystem.js";
import { portfolioUIOptions } from "./ui-options.js";
export async function bootPortfolioOS(report = () => {}) {
  report("Loading portfolio datasets");
  const runtime = await loadPortfolioRuntime(report);
  report("Portfolio datasets ready");
  document.documentElement.lang = runtime.locale;
  const data = currentData(runtime);
  const fileSystem = buildPortfolioFileSystem(runtime);
  report("Virtual filesystem assembled");
  const apps = createPortfolioApps(runtime);
  report("Portfolio applications prepared");

  const os = await createAndBootDindbOS({
    root: "#app",
    ui: portfolioUIOptions(location.search),
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
    fileSystem,
    apps,
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
  report("DindbOS runtime mounted");
  runtime.launchExperience = (id) => {
    const app = EXPERIENCE_APPS.find((entry) => entry.id === id);
    if (app) os.launch(app.appId);
  };
  if (!document.querySelector("#app .portfolio-about")) throw new Error("Portfolio did not render");
  report("Portfolio view rendered");
  const shell = document.querySelector("#app .dos-shell");
  const wallpaper = getComputedStyle(shell).backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
  if (wallpaper) {
    const image = new Image();
    image.src = wallpaper;
    let timeout;
    // A stalled decorative image must not block an otherwise usable portfolio.
    const result = await Promise.race([
      image.decode().then(() => "Wallpaper decoded", () => "Wallpaper unavailable; using fallback"),
      new Promise(resolve => { timeout = setTimeout(() => resolve("Wallpaper deferred; continuing startup"), 1500); }),
    ]);
    clearTimeout(timeout);
    report(result);
  }
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  report("First screen ready");
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
