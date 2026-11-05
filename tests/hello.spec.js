import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "no-preference" });

test("first visit writes hello while the portfolio boots, then skips repeat visits", async ({ page, context }, testInfo) => {
  await page.goto("/?ln=ko");
  const greeting = page.locator(".portfolio-hello");
  const path = greeting.locator("path");
  await expect(greeting).toBeVisible();
  await expect(greeting).toHaveAttribute("aria-hidden", "true");
  expect(await greeting.evaluate(element => element.parentElement === document.body)).toBe(true);
  expect(await greeting.evaluate(element => getComputedStyle(element).pointerEvents)).toBe("none");
  await expect.poll(() => path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset))).toBeLessThan(0.95);
  expect(await path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset))).toBeGreaterThan(0);
  await page.screenshot({ path: testInfo.outputPath("hello-writing.png") });
  await expect(page.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await expect.poll(() => path.evaluate(element => parseFloat(getComputedStyle(element).strokeDashoffset)), { intervals: [50] }).toBe(0);
  await greeting.evaluate(element => element.getAnimations().forEach(animation => animation.pause()));
  await page.screenshot({ path: testInfo.outputPath("hello-complete.png") });
  await greeting.evaluate(element => element.getAnimations().forEach(animation => animation.play()));
  await expect(greeting).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await expect(greeting).toHaveCount(0);
  const revisit = await context.newPage();
  await revisit.goto("/?ln=en");
  await expect(revisit.getByRole("heading", { name: "Kim Dong Wook", exact: true })).toBeVisible();
  await expect(revisit.locator(".portfolio-hello")).toHaveCount(0);
});

test("reduced motion skips and records the greeting without changing the language", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?ln=en");
  await expect(page.getByRole("heading", { name: "Kim Dong Wook", exact: true })).toBeVisible();
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("portfolio-hello-seen"))).toBe("1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Kim Dong Wook", exact: true })).toBeVisible();
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
});

test("denied storage skips the greeting and preserves a usable portfolio", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError"); } });
  });
  await page.goto("/?ln=ko");
  await expect(page.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
  await page.locator('[data-sidebar-target="projects"]').first().click();
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
});

for (const width of [320, 390, 1440]) {
  test(`greeting fits ${width}px and pointer dismissal passes through to navigation`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?ln=ko");
    await expect(page.locator(".portfolio-hello")).toBeVisible();
    const box = await page.locator(".portfolio-hello svg").boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    await page.locator('[data-sidebar-target="projects"]').first().click();
    await expect(page.locator(".portfolio-hello")).toHaveCount(0);
    await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
  });
}

test("keyboard interaction and changing motion preference dismiss immediately", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".portfolio-hello")).toBeVisible();
  await page.locator('[data-sidebar-target="projects"]').first().focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "프로젝트 검색" })).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("portfolio-hello-seen"));
  await page.reload();
  await expect(page.locator(".portfolio-hello")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
});

test("fallback removes the greeting even when animations are paused", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".portfolio-hello")).toBeVisible();
  await page.locator(".portfolio-hello").evaluate(element => element.getAnimations({ subtree: true }).forEach(animation => animation.pause()));
  await expect(page.locator(".portfolio-hello")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
});
