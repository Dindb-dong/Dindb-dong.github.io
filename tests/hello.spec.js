import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.use({ reducedMotion: "no-preference" });

function barrier() {
  let release;
  return { wait: new Promise(resolve => { release = resolve; }), release: () => release() };
}

const heading = page => page.locator(".profile-header h1");
const greeting = page => page.locator(".portfolio-hello");

async function expectReady(page) {
  await expect(heading(page)).toBeVisible();
  await expect(page.locator("#app")).not.toHaveAttribute("inert", "");
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
  await expect(greeting(page)).toHaveCount(0);
}

async function expectVisibleLoadingMessage(page) {
  const status = page.locator("#startup-message");
  await expect(status).toHaveText("Loading portfolio…");
  await expect(status).toHaveCSS("clip-path", "none");
  const box = await status.boundingBox();
  expect(box.width).toBeGreaterThan(100);
  expect(box.height).toBeGreaterThan(10);
}

test("HTML paints and writes welcome before external JavaScript or CSS arrives", async ({ page }, testInfo) => {
  const assets = barrier();
  await page.route("**/*", async route => {
    if (["script", "stylesheet"].includes(route.request().resourceType())) await assets.wait;
    await route.continue();
  });
  try {
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page)).toBeVisible();
    await expect(greeting(page).locator("svg")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#startup-message")).toHaveCSS("clip-path", "inset(50%)");
    await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(0);
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await expect(page.locator(".portfolio-about")).toHaveCount(0);
    expect(await greeting(page).evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(245, 247, 252)");
    expect(await greeting(page).evaluate(element => getComputedStyle(element).opacity)).toBe("1");
    const path = greeting(page).locator("path");
    await expect.poll(() => path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset)), { intervals: [50] }).toBeLessThan(0.95);
    expect(await path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset))).toBeGreaterThan(0);
    // Normal screenshots wait for fonts until the intentionally blocked document finishes loading.
    const capture = await page.context().newCDPSession(page);
    const { data } = await capture.send("Page.captureScreenshot", { format: "png" });
    await capture.detach();
    await writeFile(testInfo.outputPath("hello-before-bundles.png"), Buffer.from(data, "base64"));
  } finally {
    assets.release();
  }
  await expectReady(page);
});

for (const input of ["pointer", "keyboard"]) {
  test(`${input} before the entry script skips only handwriting and still waits for boot`, async ({ page }) => {
    const entry = barrier();
    const data = barrier();
    await page.route("**/*", async route => {
      if (route.request().resourceType() === "script") await entry.wait;
      if (new URL(route.request().url()).pathname === "/portfolio/data/projectDetails.json") await data.wait;
      await route.continue();
    });
    try {
      await page.goto("/?ln=ko", { waitUntil: "commit" });
      await expect(greeting(page)).toBeVisible();
      if (input === "pointer") await page.mouse.click(20, 20);
      else await page.keyboard.press("Enter");
      await expect(page.locator("html")).toHaveAttribute("data-hello-skip", "true");
      // An extended handwriting deadline makes a lost early input fail without a CPU-speed threshold.
      await page.evaluate(() => { document.documentElement.dataset.helloStarted = performance.now() + 60_000; });
      const requested = page.waitForRequest("**/portfolio/data/projectDetails.json");
      entry.release();
      await requested;
      await expect(page.locator("#app")).toHaveAttribute("inert", "");
      await expect(greeting(page)).not.toHaveClass(/is-leaving/);
      data.release();
      await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    } finally {
      entry.release();
      data.release();
    }
    await expectReady(page);
  });
}

test("slow required data stays covered beyond the old timer and ignores premature input", async ({ page }, testInfo) => {
  const data = barrier();
  await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
  try {
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page)).toBeVisible();
    // The previous implementation exposed the unready OS after 2.35 seconds.
    await page.waitForTimeout(2500);
    await page.keyboard.press("Enter");
    await page.mouse.click(20, 20);
    await expect(greeting(page)).toBeVisible();
    await expect(greeting(page)).not.toHaveClass(/is-leaving/);
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await expect(page.locator(".portfolio-about")).toHaveCount(0);
    expect(await greeting(page).locator("path").evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset))).toBe(0);
    await page.screenshot({ path: testInfo.outputPath("hello-waits-for-data.png") });
  } finally {
    data.release();
  }
  await expectReady(page);
});

test("the profile renders behind welcome while its wallpaper is still loading", async ({ page }, testInfo) => {
  const wallpaper = barrier();
  await page.route(/\/meadow-[^/]+\.jpg$/, async route => { await wallpaper.wait; await route.continue(); });
  try {
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(heading(page)).toHaveText("김동욱");
    await expect(greeting(page)).toBeVisible();
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await page.screenshot({ path: testInfo.outputPath("hello-background-render.png") });
  } finally {
    wallpaper.release();
  }
  await expectReady(page);
});

test("a failed decorative wallpaper does not block a usable portfolio", async ({ page }) => {
  await page.route(/\/meadow-[^/]+\.jpg$/, route => route.abort("failed"));
  await page.goto("/?ln=ko");
  await expectReady(page);
  await page.locator('[data-sidebar-target="projects"]').first().click();
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
});

test("cleanup still finishes if only the ready fade animation is paused", async ({ page }) => {
  await page.goto("/?ln=ko", { waitUntil: "commit" });
  await page.addStyleTag({ content: ".portfolio-hello.is-leaving { animation-play-state: paused !important; }" });
  await expectReady(page);
});

test("fast boot finishes the first handwriting and skips repeat visits without changing language", async ({ page, context }) => {
  await page.goto("/?ln=ko", { waitUntil: "commit" });
  await expectReady(page);
  expect(await page.evaluate(() => performance.now() - Number(document.documentElement.dataset.helloStarted))).toBeGreaterThanOrEqual(1600);
  const data = barrier();
  await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
  try {
    await page.reload({ waitUntil: "commit" });
    await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
    await expect(greeting(page).locator("svg")).toBeHidden();
    await expectVisibleLoadingMessage(page);
  } finally {
    data.release();
  }
  await expectReady(page);
  const revisit = await context.newPage();
  await revisit.goto("/?ln=en");
  await expectReady(revisit);
  await expect(heading(revisit)).toHaveText("Kim Dong Wook");
  await expect(revisit.locator("html")).toHaveAttribute("data-hello", "skip");
});

test("reduced motion skips handwriting and records the visit", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const data = barrier();
  await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
  try {
    await page.goto("/?ln=en", { waitUntil: "commit" });
    await expect(greeting(page).locator("svg")).toBeHidden();
    await expectVisibleLoadingMessage(page);
  } finally {
    data.release();
  }
  await expectReady(page);
  await expect(heading(page)).toHaveText("Kim Dong Wook");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBe("1");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expectReady(page);
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
});

test("denied storage skips handwriting and preserves navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError"); } });
  });
  const data = barrier();
  await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
  try {
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page).locator("svg")).toBeHidden();
    await expectVisibleLoadingMessage(page);
  } finally {
    data.release();
  }
  await expectReady(page);
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await page.locator('[data-sidebar-target="projects"]').first().click();
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
});

for (const width of [320, 390, 1440]) {
  test(`welcome fits ${width}px and ready navigation remains operable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page).locator("svg")).toBeVisible();
    const box = await greeting(page).locator("svg").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await expect(page.locator("#app")).not.toHaveAttribute("inert", "");
    await page.locator('[data-sidebar-target="projects"]').first().click();
    await expect(greeting(page)).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
  });
}

test("changing motion preference waives handwriting but never readiness", async ({ page }) => {
  const data = barrier();
  await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
  try {
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page)).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(greeting(page).locator("svg")).toBeHidden();
    await expectVisibleLoadingMessage(page);
    await expect(greeting(page)).toBeVisible();
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
  } finally {
    data.release();
  }
  await expectReady(page);
});

test("the HTML watchdog offers recovery even if the entry script never arrives, then recovers", async ({ page }) => {
  const entry = barrier();
  await page.clock.install();
  await page.route("**/*", async route => {
    if (route.request().resourceType() === "script") await entry.wait;
    await route.continue();
  });
  try {
    await page.goto("/?ln=en&source=slow", { waitUntil: "commit" });
    await expect(greeting(page)).toBeVisible();
    await page.clock.fastForward(15_001);
    await expect(page.getByRole("link", { name: "Try again", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open resume", exact: true })).toHaveAttribute("href", "/resume.html");
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
  } finally {
    entry.release();
  }
  await expectReady(page);
});

for (const failure of ["module", "data"]) {
  test(`${failure} failure offers a current-URL retry and resumes the portfolio`, async ({ page }) => {
    const pattern = failure === "module" ? /\/(?:src\/)?main(?:-[^/]+)?\.js(?:\?.*)?$/ : "**/portfolio/data/projectDetails.json";
    const fail = route => route.fulfill({ status: 503, contentType: "text/plain", body: "Unavailable for startup regression" });
    await page.route(pattern, fail);
    await page.goto("/?ln=en&source=retry");
    await expect(page.getByRole("link", { name: "Try again", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open resume", exact: true })).toHaveAttribute("href", "/resume.html");
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await page.unroute(pattern, fail);
    await page.getByRole("link", { name: "Try again", exact: true }).click();
    await expectReady(page);
    await expect(page).toHaveURL(/\?ln=en&source=retry$/);
    await expect(heading(page)).toHaveText("Kim Dong Wook");
  });
}

test("JavaScript-disabled visitors can open the existing static resume", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(baseURL);
    await expect(page.getByText(/JavaScript.*(?:enable|required)|(?:enable|required).*JavaScript/i)).toBeVisible();
    await page.getByRole("link", { name: "Open resume", exact: true }).click();
    await expect(page).toHaveURL(/\/resume\.html$/);
    await expect(page.locator("body")).toContainText("Kim");
  } finally {
    await context.close();
  }
});
