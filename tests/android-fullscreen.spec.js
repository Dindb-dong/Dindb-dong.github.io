import { expect, test } from "@playwright/test";

const androidUA = "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36";

// Desktop Chrome here rejects even a minimal native fullscreen request; model success separately.
async function modelFullscreen(page) {
  await page.addInitScript(() => {
    let active = null;
    Object.defineProperty(document, "fullscreenElement", { get: () => active });
    Element.prototype.requestFullscreen = async function (options) {
      window.fullscreenRequest = { options, activated: navigator.userActivation.isActive };
      active = this;
      document.dispatchEvent(new Event("fullscreenchange"));
    };
    document.exitFullscreen = async () => {
      active = null;
      document.dispatchEvent(new Event("fullscreenchange"));
    };
  });
}

test.describe("Android fullscreen", () => {
  test.use({ userAgent: androidUA, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "userAgentData", { value: { platform: "Android" } }));
  });

  test("removes the suggestion on modeled fullscreen entry and never restores it on exit", async ({ page }, info) => {
    await modelFullscreen(page);
    await page.goto("/?intro=0&ln=ko");
    await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    const button = page.getByRole("button", { name: "전체화면", exact: true });
    await expect(button).toBeVisible();
    expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
    const bounds = await button.boundingBox();
    expect(bounds.height).toBeGreaterThanOrEqual(44);
    expect((await page.locator("#app").boundingBox()).y).toBeGreaterThanOrEqual(bounds.y + bounds.height);
    await page.screenshot({ path: info.outputPath("android-before.png") });
    await button.tap();
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    expect((await page.locator("#app").boundingBox()).y).toBe(0);
    expect(await page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
    expect(await page.evaluate(() => window.fullscreenRequest)).toEqual({ options: { navigationUI: "hide" }, activated: true });
    await page.locator('[data-sidebar-target="projects"]').tap();
    await expect(page.getByRole("combobox")).toBeVisible();
    await page.screenshot({ path: info.outputPath("android-fullscreen.png") });
    await page.evaluate(() => document.exitFullscreen());
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
  });

  test("fits 320px and landscape with English labels", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto("/?intro=0&ln=en");
    await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    const button = page.getByRole("button", { name: "Fullscreen", exact: true });
    await expect(button).toBeInViewport({ ratio: 1 });
    await expect(page.getByRole("button", { name: "Dismiss fullscreen suggestion" })).toBeInViewport({ ratio: 1 });
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(button).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.body.scrollWidth <= innerWidth)).toBe(true);
  });

  test("dismisses immediately and gives the reserved space back to the OS", async ({ page }) => {
    await page.goto("/?intro=0&ln=en");
    await page.getByRole("button", { name: "Dismiss fullscreen suggestion" }).tap();
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    expect((await page.locator("#app").boundingBox()).y).toBe(0);
  });

  test("automatically disappears after ten seconds without interaction", async ({ page }) => {
    await page.clock.install();
    await page.goto("/?intro=0&ln=en");
    await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeVisible();
    await page.clock.fastForward(10_001);
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    expect((await page.locator("#app").boundingBox()).y).toBe(0);
  });

  test("waits for the welcome screen to finish before showing the suggestion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/?intro=1&ln=en");
    await expect(page.locator("#startup-enter")).toBeVisible();
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    await page.locator("#startup-enter").tap();
    await expect(page.getByRole("button", { name: "Fullscreen", exact: true })).toBeVisible();
  });

  for (const unavailable of ["policy", "method"]) {
    test(`hides control when ${unavailable} prevents fullscreen`, async ({ page }) => {
      await page.addInitScript(reason => {
        if (reason === "policy") Object.defineProperty(document, "fullscreenEnabled", { value: false });
        else Element.prototype.requestFullscreen = undefined;
      }, unavailable);
      await page.goto("/?intro=0");
      await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
      await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    });
  }

  test("reports rejection without breaking the portfolio or leaving the button disabled", async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.requestFullscreen = () => Promise.reject(new TypeError("Fullscreen denied"));
    });
    await page.goto("/?intro=0&ln=en");
    await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    const button = page.getByRole("button", { name: "Fullscreen", exact: true });
    await button.tap();
    await expect(page.locator(".portfolio-display-controls [role=status]")).toHaveText("The browser did not allow fullscreen.");
    await expect(button).toBeEnabled();
    await page.locator('[data-sidebar-target="projects"]').tap();
    await expect(page.getByRole("combobox")).toBeVisible();
  });
});

for (const [platform, userAgent] of [
  ["iOS", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"],
  ["Windows", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36"],
]) {
  test(`hides control on ${platform} even with an Android style preview`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ userAgent, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${baseURL}/?device=android&intro=0`);
    await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    await expect(page.locator(".portfolio-display-controls")).toHaveCount(0);
    await context.close();
  });
}
