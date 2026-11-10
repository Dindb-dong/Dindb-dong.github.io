import { expect, test } from "@playwright/test";
import { enterPortfolio } from "./enter-portfolio.js";

test.use({ video: { mode: "on", size: { width: 390, height: 844 } } });

const androidUA = "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36";

// Model native success: this desktop runner cannot verify Android system bars.
async function modelFullscreen(page, mode = "success", platform = "Android") {
  await page.addInitScript(({ mode, platform }) => {
    window.fullscreenRequests = [];
    Object.defineProperty(navigator, "userAgentData", { value: platform ? { platform } : undefined });
    let active = null;
    Object.defineProperty(document, "fullscreenElement", { get: () => mode === "active" ? document.documentElement : active });
    Object.defineProperty(document, "fullscreenEnabled", { value: mode !== "policy" });
    Element.prototype.requestFullscreen = mode === "missing" ? undefined : function (options) {
      window.fullscreenRequests.push({ options, activated: navigator.userActivation.isActive, busy: document.getElementById("app").getAttribute("aria-busy") });
      if (mode === "throw") throw new TypeError("Denied");
      if (mode === "reject") return Promise.reject(new TypeError("Denied"));
      if (mode === "pending") return new Promise(() => {});
      active = this;
      document.dispatchEvent(new Event("fullscreenchange"));
      return Promise.resolve();
    };
    document.exitFullscreen = async () => { active = null; document.dispatchEvent(new Event("fullscreenchange")); };
  }, { mode, platform });
}

async function ready(page) {
  await expect(page.locator("#portfolio-startup")).toHaveAttribute("data-phase", "welcome");
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "true");
  expect(await page.evaluate(() => window.fullscreenRequests)).toEqual([]);
}

async function entered(page) {
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator("#portfolio-startup")).toHaveCount(0);
  await expect(page.locator(".portfolio-display-controls, .portfolio-fullscreen")).toHaveCount(0);
  expect((await page.locator("#app").boundingBox()).y).toBe(0);
}

test.describe("Android WELCOME fullscreen", () => {
  test.use({ userAgent: androidUA, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("touching WELCOME requests fullscreen during the gesture and opens the portfolio on every visit", async ({ page }, info) => {
    await modelFullscreen(page);
    await page.goto("/?ln=ko");
    await ready(page);
    await page.screenshot({ path: info.outputPath("welcome-before-entry.png") });
    await page.touchscreen.tap(30, 40);
    await entered(page);
    expect(await page.evaluate(() => window.fullscreenRequests)).toEqual([{ options: { navigationUI: "hide" }, activated: true, busy: "true" }]);
    await page.screenshot({ path: info.outputPath("portfolio-after-entry.png") });
    await page.evaluate(() => document.exitFullscreen());
    await page.locator('[data-sidebar-target="projects"]').tap();
    await expect(page.getByRole("combobox")).toBeVisible();
    expect(await page.evaluate(() => window.fullscreenRequests.length)).toBe(1);
    await page.reload();
    await ready(page);
    await page.touchscreen.tap(30, 40);
    await entered(page);
    expect(await page.evaluate(() => window.fullscreenRequests.length)).toBe(1);
  });

  for (const mode of ["reject", "throw", "pending", "policy", "missing", "active"]) {
    test(`${mode} fullscreen still allows normal entry`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await modelFullscreen(page, mode);
      await page.goto("/");
      await ready(page);
      await page.touchscreen.tap(30, 40);
      await entered(page);
      expect(await page.evaluate(() => window.fullscreenRequests.length)).toBe(["policy", "missing", "active"].includes(mode) ? 0 : 1);
      expect(errors).toEqual([]);
    });
  }

  test("Android user-agent fallback works without client hints", async ({ page }) => {
    await modelFullscreen(page, "success", null);
    await page.goto("/");
    await enterPortfolio(page);
    expect(await page.evaluate(() => window.fullscreenRequests.length)).toBe(1);
  });

  test("touches before readiness never request fullscreen", async ({ page }) => {
    await modelFullscreen(page);
    let release;
    const wait = new Promise(resolve => { release = resolve; });
    await page.route("**/portfolio/data/projectDetails.json", async route => { await wait; await route.continue(); });
    try {
      await page.goto("/", { waitUntil: "commit" });
      await page.touchscreen.tap(30, 40);
      expect(await page.evaluate(() => window.fullscreenRequests)).toEqual([]);
    } finally { release(); }
    await ready(page);
    await page.touchscreen.tap(30, 40);
    await entered(page);
    expect(await page.evaluate(() => window.fullscreenRequests.length)).toBe(1);
  });
});

for (const platform of ["iOS", "Windows"]) {
  test(`${platform} WELCOME entry never requests fullscreen, even with Android style preview`, async ({ page }) => {
    await modelFullscreen(page, "success", platform);
    await page.goto("/?device=android");
    await ready(page);
    await enterPortfolio(page);
    await entered(page);
    expect(await page.evaluate(() => window.fullscreenRequests)).toEqual([]);
  });
}
