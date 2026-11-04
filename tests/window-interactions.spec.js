import { expect, test } from "@playwright/test";

for (const app of ["portfolio", "terminal", "experience-leviosa"]) {
  test(`${app} window moves and resizes with pointer input`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await expect(page.locator('.portfolio-about')).toBeVisible();
    if (app === "terminal") await page.locator('.dos-icon[aria-label="Open Terminal.app"]').dblclick();
    if (app === "experience-leviosa") {
      await page.locator('.dos-window[data-window-id="portfolio"]').getByRole("button", { name: "Minimize", exact: true }).click();
      await page.locator('.dos-icon[aria-label="Open Leviosa-AI.app"]').dblclick();
    }
    const frame = page.locator(`.dos-window[data-window-id="${app}"]`);
    await expect(frame).toBeVisible();
    const before = await frame.boundingBox();
    const title = await frame.locator('.dos-window-titlebar').boundingBox();
    await page.mouse.move(title.x + title.width / 2, title.y + title.height / 2);
    await page.mouse.down();
    await page.mouse.move(title.x + title.width / 2 - 70, title.y + title.height / 2 + 55, { steps: 12 });
    await page.mouse.up();
    await expect.poll(async () => Math.abs((await frame.boundingBox()).y - before.y)).toBeGreaterThan(30);
    const moved = await frame.boundingBox();
    const handle = await frame.locator('[data-resize="bottom-right"]').boundingBox();
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
    await page.mouse.down();
    await page.mouse.move(handle.x + handle.width / 2 - 100, handle.y + handle.height / 2 - 80, { steps: 12 });
    await page.mouse.up();
    await expect.poll(async () => moved.width - (await frame.boundingBox()).width).toBeGreaterThan(50);
    await expect.poll(async () => moved.height - (await frame.boundingBox()).height).toBeGreaterThan(40);
  });
}


test("portfolio navigation adapts when a desktop window is narrowed", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const frame = page.locator('.dos-window[data-window-id="portfolio"]');
  await expect(frame).toBeVisible();
  await expect(frame.locator(".portfolio-about")).toBeVisible();
  const handle = await frame.locator('[data-resize="bottom-right"]').boundingBox();
  const bounds = await frame.boundingBox();
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 - (bounds.width - 680), handle.y + handle.height / 2, { steps: 15 });
  await page.mouse.up();
  await expect.poll(async () => (await frame.boundingBox()).width).toBeLessThan(682);
  const nav = frame.getByRole("navigation", { name: "Portfolio sections" });
  await expect(nav).toHaveCSS("display", "flex");
  expect((await nav.boundingBox()).height).toBeLessThan(100);
  await nav.locator('[data-sidebar-target="settings"]').click();
  await expect(frame.locator('[data-locale-choice="en"]')).toBeVisible();
  await nav.locator('[data-sidebar-target="about"]').click();
  expect(await frame.locator('.portfolio-about').evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
  await nav.locator('[data-sidebar-target="projects"]').click();
  for (const selector of [".portfolio-finder", ".portfolio-finder-layout", ".portfolio-project-list", ".portfolio-detail-pane"]) {
    expect(await frame.locator(selector).evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
  }
  const list = await frame.locator(".portfolio-project-list").boundingBox();
  const detail = await frame.locator(".portfolio-detail-pane").boundingBox();
  expect(detail.y).toBeGreaterThanOrEqual(list.y + list.height - 1);
  await expect(frame.locator(".portfolio-detail-pane h2")).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("narrow-desktop.png") });
});
