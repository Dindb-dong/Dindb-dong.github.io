import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.use({ contextOptions: { reducedMotion: "no-preference" } });

function barrier() {
  let release;
  return { wait: new Promise(resolve => { release = resolve; }), release: () => release() };
}

const heading = page => page.locator(".profile-header h1");
const greeting = page => page.locator(".portfolio-hello");

async function enterWhenReady(page) {
  await expect.poll(() => page.evaluate(() => document.getElementById("portfolio-startup")?.dataset.phase === "welcome" || document.getElementById("app").getAttribute("aria-busy") === "false")).toBe(true);
  if (await page.evaluate(() => document.getElementById("portfolio-startup")?.dataset.phase === "welcome" && document.getElementById("app").inert)) await page.keyboard.press("Enter");
  await expectReady(page);
}

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

test("HTML paints boot logs before external JavaScript or CSS arrives", async ({ page }, testInfo) => {
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
    expect(await greeting(page).evaluate(element => getComputedStyle(element).backgroundColor)).toBe("rgb(8, 11, 11)");
    expect(await greeting(page).evaluate(element => getComputedStyle(element).opacity)).toBe("1");
    await expect(page.locator("#boot-log")).toContainText("Document received. Starting portfolio");
    await expect(greeting(page).locator("svg")).toBeHidden();
    // Normal screenshots wait for fonts until the intentionally blocked document finishes loading.
    const capture = await page.context().newCDPSession(page);
    const { data } = await capture.send("Page.captureScreenshot", { format: "png" });
    await capture.detach();
    await writeFile(testInfo.outputPath("hello-before-bundles.png"), Buffer.from(data, "base64"));
  } finally {
    assets.release();
  }
  await enterWhenReady(page);
});

for (const input of ["pointer", "keyboard"]) {
  test(`${input} before readiness never dismisses the terminal or confirms entry`, async ({ page }) => {
    const data = barrier();
    await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
    try {
      await page.goto("/?ln=ko", { waitUntil: "commit" });
      await expect(greeting(page)).toBeVisible();
      if (input === "pointer") await page.mouse.click(20, 20);
      else await page.keyboard.press("Enter");
      await expect(page.locator("#app")).toHaveAttribute("inert", "");
      await expect(greeting(page)).not.toHaveAttribute("data-phase", "welcome");
    } finally { data.release(); }
    await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await enterWhenReady(page);
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
    await expect(page.locator("#boot-log")).not.toContainText("Portfolio datasets ready");
    await expect(greeting(page).locator("svg")).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath("hello-waits-for-data.png") });
  } finally {
    data.release();
  }
  await enterWhenReady(page);
});

test("the profile renders behind boot logs while its wallpaper is still loading", async ({ page }, testInfo) => {
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
  await enterWhenReady(page);
});

test("a failed decorative wallpaper does not block a usable portfolio", async ({ page }) => {
  await page.route(/\/meadow-[^/]+\.jpg$/, route => route.abort("failed"));
  await page.goto("/?ln=ko");
  await enterWhenReady(page);
  await page.locator('[data-sidebar-target="projects"]').first().click();
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
});

test("cleanup still finishes if only the ready fade animation is paused", async ({ page }) => {
  await page.goto("/?ln=ko", { waitUntil: "commit" });
  await page.addStyleTag({ content: ".portfolio-hello.is-leaving { animation-play-state: paused !important; }" });
  await enterWhenReady(page);
});

test("first visit waits for entry and repeat visits preserve language", async ({ page, context }) => {
  await page.goto("/?ln=ko", { waitUntil: "commit" });
  await enterWhenReady(page);
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
  await enterWhenReady(page);
  const revisit = await context.newPage();
  await revisit.goto("/?ln=en");
  await enterWhenReady(revisit);
  await expect(heading(revisit)).toHaveText("Kim Dong Wook");
  await expect(revisit.locator("html")).toHaveAttribute("data-hello", "skip");
});

test("reduced motion skips the terminal and records the visit", async ({ page }) => {
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
  await enterWhenReady(page);
  await expect(heading(page)).toHaveText("Kim Dong Wook");
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBe("1");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await enterWhenReady(page);
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
});

test("denied storage skips the terminal and preserves navigation", async ({ page }) => {
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
  await enterWhenReady(page);
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await page.locator('[data-sidebar-target="projects"]').first().click();
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
});

for (const width of [320, 390, 1440]) {
  test(`welcome fits ${width}px and ready navigation remains operable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?ln=ko", { waitUntil: "commit" });
    await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
    await expect(greeting(page).locator("svg")).toBeVisible();
    const box = await greeting(page).locator("svg").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await enterWhenReady(page);
    await page.locator('[data-sidebar-target="projects"]').first().click();
    await expect(greeting(page)).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
  });
}

test("changing motion preference waives the terminal but never readiness", async ({ page }) => {
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
  await enterWhenReady(page);
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
  await enterWhenReady(page);
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
    await enterWhenReady(page);
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

test("intro=1 replays on every reload without changing an existing visit flag", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("portfolio-hello-seen", "existing"));
  await page.goto("/?ln=en&intro=1");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "write");
  await enterWhenReady(page);
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBe("existing");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hello", "write");
  await enterWhenReady(page);
  await page.goto("/?intro=0");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await enterWhenReady(page);
});

test("intro=1 does not consume a fresh first visit", async ({ page }) => {
  await page.goto("/?intro=1");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "write");
  await enterWhenReady(page);
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBeNull();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "write");
  await enterWhenReady(page);
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBe("1");
});

test("intro=1 works without storage and still respects reduced motion", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError"); } });
  });
  await page.goto("/?intro=1");
  await expect(page.locator("html")).toHaveAttribute("data-hello", "write");
  await enterWhenReady(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-hello", "skip");
  await enterWhenReady(page);
});

for (const key of ["a", "Space", "Escape"]) {
  test(`ready WELCOME remains until ${key} is pressed`, async ({ page }, testInfo) => {
    await page.goto("/?intro=1", { waitUntil: "commit" });
    await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
    await expect(page.locator(".portfolio-about")).toHaveCount(1);
    await expect(page.locator("#startup-enter")).toBeFocused();
    await expect(page.locator("#startup-enter span")).toHaveCSS("animation-name", "boot-prompt");
    await page.waitForTimeout(1500);
    await expect(page.locator("#app")).toHaveAttribute("inert", "");
    await expect(greeting(page)).not.toHaveClass(/is-leaving/);
    if (key === "a") await page.screenshot({ path: testInfo.outputPath("boot-welcome-desktop.png") });
    await page.keyboard.press(key);
    await expectReady(page);
    await expect(page.locator("#app")).toBeFocused();
  });
}

test.describe("mobile terminal entry", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });
  test("touch anywhere on ready WELCOME enters the rendered portfolio", async ({ page }, testInfo) => {
    await page.goto("/?intro=1&ln=ko", { waitUntil: "commit" });
    await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
    await page.screenshot({ path: testInfo.outputPath("boot-welcome-mobile.png") });
    await page.touchscreen.tap(30, 40);
    await expectReady(page);
    await page.locator('[data-sidebar-target="projects"]').first().click();
    await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
  });
});

test("motion reduction while awaiting entry preserves the confirmation screen", async ({ page }) => {
  await page.goto("/?intro=1", { waitUntil: "commit" });
  await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("#startup-enter")).toBeVisible();
  await expect(page.locator("#startup-enter span")).toHaveCSS("animation-name", "none");
  await expect(page.locator("#app")).toHaveAttribute("inert", "");
  await page.keyboard.press("Enter");
  await expectReady(page);
  await expect(page.locator("#app")).toBeFocused();
});

for (const held of ["key", "pointer"]) {
  test(`${held} held during loading needs fresh input after WELCOME`, async ({ page }) => {
    const data = barrier();
    await page.route("**/portfolio/data/projectDetails.json", async route => { await data.wait; await route.continue(); });
    try {
      await page.goto("/?intro=1", { waitUntil: "commit" });
      await expect(greeting(page)).toBeVisible();
      if (held === "key") await page.keyboard.down("a");
      else await page.mouse.down();
      data.release();
      await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
      if (held === "key") {
        await page.keyboard.down("a");
        await page.keyboard.up("a");
      } else await page.mouse.up();
      await expect(page.locator("#app")).toHaveAttribute("inert", "");
      await expect(greeting(page)).not.toHaveClass(/is-leaving/);
      await page.keyboard.press("b");
      await expectReady(page);
    } finally { data.release(); }
  });
}

test("ready confirmation outlives the slow-start watchdog", async ({ page }) => {
  await page.clock.install();
  await page.goto("/?intro=1", { waitUntil: "commit" });
  await expect(greeting(page)).toHaveAttribute("data-phase", "welcome");
  await page.clock.fastForward(30_000);
  await expect(page.locator("#startup-enter")).toBeVisible();
  await expect(page.getByRole("link", { name: "Try again", exact: true })).toBeHidden();
  await expect(page.locator("#app")).toHaveAttribute("inert", "");
  await page.keyboard.press("Enter");
  await expectReady(page);
});

test("a late optional locale response cannot write into a dismissed terminal", async ({ page }) => {
  const late = barrier();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/portfolio/data/eng_projectDetails.json", route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.route("**/portfolio/data/eng_introduce.json", async route => { await late.wait; await route.continue(); });
  try {
    await page.goto("/?intro=1", { waitUntil: "commit" });
    await enterWhenReady(page);
    const completed = page.waitForResponse("**/portfolio/data/eng_introduce.json");
    late.release();
    await completed;
    await page.waitForTimeout(150);
    expect(errors).toEqual([]);
    await expect(page.locator("#app")).not.toHaveAttribute("inert", "");
  } finally { late.release(); }
});
