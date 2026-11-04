import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true });

async function assertTouchTarget(button, page) {
  await button.scrollIntoViewIfNeeded();
  const bounds = await button.boundingBox();
  expect(bounds.width).toBeGreaterThanOrEqual(44);
  expect(bounds.height).toBeGreaterThanOrEqual(44);
  expect(bounds.width).toBeLessThan((await button.locator("..").boundingBox()).width - 16);
  expect(await button.evaluate(el => {
    const b = el.getBoundingClientRect();
    return [[b.width / 2, 4], [4, b.height / 2], [b.width - 4, b.height / 2], [b.width / 2, b.height - 4]].every(([x, y]) => el.contains(document.elementFromPoint(b.x + x, b.y + y)));
  })).toBe(true);
  await page.touchscreen.tap(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
}

for (const width of [320, 390, 430]) {
  test(`portfolio bottom tabs have reachable touch targets at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const app = page.locator(".portfolio-os-app");
    const nav = app.getByRole("navigation", { name: "Portfolio sections" });
    for (const target of ["projects", "experience", "skills", "resume", "settings", "about"]) {
      await assertTouchTarget(nav.locator(`[data-sidebar-target="${target}"]`), page);
      await expect(nav.locator(`[data-sidebar-target="${target}"]`)).toHaveAttribute("aria-current", "page");
      await expect(nav.locator(`[data-sidebar-target="${target}"]`)).toBeInViewport({ ratio: 1 });
      const main = await app.locator(".portfolio-main-pane").boundingBox();
      expect((await nav.boundingBox()).y).toBeGreaterThanOrEqual(main.y + main.height - 1);
      expect(await app.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
    }
    await page.screenshot({ path: testInfo.outputPath(`portfolio-touch-${width}.png`) });
    await assertTouchTarget(nav.locator('[data-sidebar-target="settings"]'), page);
    await page.getByRole("button", { name: "English", exact: true }).tap();
    await assertTouchTarget(nav.locator('[data-sidebar-target="projects"]'), page);
    await expect(page.getByRole("searchbox", { name: "Search projects" })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath(`portfolio-english-${width}.png`) });
  });
}

for (const [id, name] of [[1, "Leviosa-AI"], [2, "Alus-Healthcare"], [3, "YAI"], [4, "NOI-LAB"], [5, "YCC"], [6, "SDP"]]) {
  test(`${name} mobile tabs switch with real touch input`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="experience"]').tap();
    await page.locator(`[data-experience-open="${id}"]`).first().tap();
    const app = page.locator(`.experience-app[data-experience-app="${id}"]`);
    const nav = app.getByRole("navigation", { name: "Experience sections" });
    const tabs = await nav.locator("button").evaluateAll(elements => elements.map(el => el.dataset.experienceTab));
    for (const tab of [...tabs, "overview"]) {
      await assertTouchTarget(nav.locator(`[data-experience-tab="${tab}"]`), page);
      await expect(app).toHaveAttribute("data-experience-tab-active", tab);
      await expect(nav.locator(`[data-experience-tab="${tab}"]`)).toBeInViewport({ ratio: 1 });
      const main = await app.locator(".experience-main").boundingBox();
      expect((await nav.boundingBox()).y).toBeGreaterThanOrEqual(main.y + main.height - 1);
      expect(await app.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
    }
    const before = (await nav.boundingBox()).y;
    await app.locator(".experience-main").evaluate(el => { el.scrollTop = el.scrollHeight; });
    expect((await nav.boundingBox()).y).toBe(before);
    await page.screenshot({ path: testInfo.outputPath(`experience-touch-${id}.png`) });
    await app.locator(".app-dropdown-trigger").tap();
    await expect(page.getByRole("listbox")).toBeVisible();
  });
}
