import { expect, test } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`profile and five-tab navigation follow the requested edits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Portfolio sections" });
    await expect(nav.getByRole("button")).toHaveCount(5);
    await expect(nav.locator('[data-sidebar-target="settings"], [data-sidebar-target="contact"]')).toHaveCount(0);
    await expect(page.locator(".profile-education h2, .profile-stats header span")).toHaveCount(0);
    await expect(page.locator(".profile-grade-grid > div").last().locator("dd")).toHaveText("A-");
    const portrait = page.locator(".profile-mobile-portrait");
    if (width < 761) {
      await expect(portrait).toBeVisible();
      expect(await portrait.evaluate(el => el.naturalWidth)).toBeGreaterThan(0);
      expect((await portrait.boundingBox()).x).toBeGreaterThan((await page.locator(".profile-header h1").boundingBox()).x + 100);
      for (const button of await nav.getByRole("button").all()) await expect(button).toBeInViewport({ ratio: 1 });
    } else await expect(portrait).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath(`profile-refined-${width}.png`) });
  });
}

for (const width of [390, 1440]) {
  test(`project popup combines sort, categories, tags and reset at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.locator('nav [data-sidebar-target="projects"]').click();
    const button = page.getByRole("button", { name: "필터", exact: true });
    const popup = page.getByRole("dialog", { name: "필터", exact: true });
    await button.click();
    await popup.getByLabel("정렬", { exact: true }).selectOption("oldest");
    await expect(popup).toBeVisible();
    await expect(page.locator("[data-project-id]").first()).toHaveAttribute("data-project-id", "1");
    await popup.getByRole("checkbox", { name: "Web", exact: true }).check();
    await popup.getByRole("checkbox", { name: "TypeScript", exact: true }).check();
    await popup.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(button).toBeFocused();
    await page.getByRole("searchbox").fill("YAI-HUB");
    await expect(page.getByRole("status")).toHaveText("1개 프로젝트");
    await expect(page.locator(".portfolio-detail-pane h2")).toContainText("YAI-HUB");
    await button.click();
    await page.screenshot({ path: testInfo.outputPath(`project-popup-${width}.png`) });
    const bounds = await popup.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await popup.getByRole("button", { name: "초기화", exact: true }).click();
    await expect(page.getByRole("status")).toHaveText("19개 프로젝트");
    await button.click();
    await popup.press("Escape");
    await expect(popup).toBeHidden();
  });
}

test("mobile project selector replaces the list and keeps search above one readable detail pane", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.locator('nav [data-sidebar-target="projects"]').tap();
    const picker = page.getByRole("button", { name: "현재 프로젝트", exact: true });
    await expect(page.locator(".portfolio-project-list")).toBeHidden();
    const search = page.getByRole("searchbox");
    const filter = page.getByRole("button", { name: "필터", exact: true });
    expect((await picker.boundingBox()).y).toBeLessThan((await search.boundingBox()).y);
    expect((await page.locator(".portfolio-search-field").boundingBox()).width / (await filter.boundingBox()).width).toBeGreaterThan(2);
    await picker.tap();
    const choice = page.locator('[data-dropdown-value="16"]');
    const title = await choice.innerText();
    await choice.tap();
    await expect(page.locator(".portfolio-detail-pane h2")).toHaveText(title);
    await expect(picker).toContainText(title);
    await page.locator(".portfolio-finder-layout").evaluate(el => { el.scrollTop = el.scrollHeight; });
    await picker.tap();
    await page.locator('[data-dropdown-value="20"]').tap();
    await expect(page.locator(".portfolio-finder-layout")).toHaveJSProperty("scrollTop", 0);
    await search.fill("no-match-example");
    await expect(picker).toBeDisabled();
    await expect(page.locator(".portfolio-detail-pane")).toContainText("프로젝트를 찾지 못했습니다");
    await search.fill("");
    await expect(picker).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath("mobile-project-selector.png") });
  } finally { await context.close(); }
});

test("skill filters appear in the popup and overview project links clear previous filters", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Portfolio sections" });
  await nav.locator('[data-sidebar-target="skills"]').click();
  await page.getByRole("button", { name: "Python", exact: true }).click();
  await nav.locator('[data-sidebar-target="projects"]').click();
  await page.getByRole("button", { name: "필터", exact: true }).click();
  const popup = page.getByRole("dialog", { name: "필터", exact: true });
  await expect(popup.getByRole("checkbox", { name: "Python", exact: true })).toBeChecked();
  await popup.getByRole("button", { name: "닫기", exact: true }).click();
  await page.getByRole("searchbox").fill("no-match-example");
  await nav.locator('[data-sidebar-target="about"]').click();
  await page.locator('[data-profile-project="20"]').click();
  await expect(page.locator(".portfolio-detail-pane h2")).toContainText("YAI-HUB");
  await expect(page.getByRole("status")).toHaveText("19개 프로젝트");
});
