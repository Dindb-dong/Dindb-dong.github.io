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
    await page.getByRole("combobox").fill("YAI-HUB");
    await expect(page.locator("[data-project-id]")).toHaveCount(1);
    await expect(page.locator(".portfolio-detail-pane h2")).toContainText("YAI-HUB");
    await button.click();
    await page.screenshot({ path: testInfo.outputPath(`project-popup-${width}.png`) });
    const bounds = await popup.boundingBox();
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    await popup.getByRole("button", { name: "초기화", exact: true }).click();
    await expect(page.locator("[data-project-id]")).toHaveCount(19);
    await button.click();
    await popup.press("Escape");
    await expect(popup).toBeHidden();
  });
}

test("mobile searchable selector replaces separate dropdown, search and count rows", async ({ browser }, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  try {
    await page.goto("/");
    await page.locator('nav [data-sidebar-target="projects"]').tap();
    const picker = page.getByRole("combobox", { name: "프로젝트 검색", exact: true });
    await expect(page.locator(".portfolio-project-list")).toBeHidden();
    const search = page.getByRole("combobox");
    const filter = page.getByRole("button", { name: "필터", exact: true });
    expect((await picker.boundingBox()).y).toBe((await search.boundingBox()).y);
    await expect(page.locator(".portfolio-result-count")).toHaveCount(0);
    await expect(filter).toHaveText("");
    expect((await filter.boundingBox()).width).toBe(44);
    expect((await page.locator(".searchable-select").boundingBox()).width / (await filter.boundingBox()).width).toBeGreaterThan(2);
    await picker.tap();
    const choice = page.locator('[data-select-value="16"]');
    const title = await choice.innerText();
    await choice.tap();
    await expect(page.locator(".portfolio-detail-pane h2")).toHaveText(title);
    await expect(picker).toHaveValue(title);
    await page.locator(".portfolio-finder-layout").evaluate(el => { el.scrollTop = el.scrollHeight; });
    await picker.tap();
    await page.locator('[data-select-value="20"]').tap();
    await expect(page.locator(".portfolio-finder-layout")).toHaveJSProperty("scrollTop", 0);
    await search.fill("no-match-example");
    await expect(picker).toBeEnabled();
    await expect(page.locator(".portfolio-detail-pane")).toContainText("프로젝트를 찾지 못했습니다");
    await search.fill("");
    await expect(picker).toBeEnabled();
    await page.screenshot({ path: testInfo.outputPath("mobile-project-selector-open.png") });
    const selectedOption = page.locator('.searchable-select-menu [aria-selected="true"]');
    const colors = await selectedOption.evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor }));
    expect(colors.background).toBe("rgb(124, 159, 229)");
    expect(colors.color).toBe("rgb(255, 255, 255)");
    await picker.press("Escape");
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
  await page.getByRole("combobox").fill("no-match-example");
  await nav.locator('[data-sidebar-target="about"]').click();
  await page.locator('[data-profile-project="20"]').click();
  await expect(page.locator(".portfolio-detail-pane h2")).toContainText("YAI-HUB");
  await expect(page.locator("[data-project-id]")).toHaveCount(19);
});

test("searchable selector supports keyboard selection, dismissal and empty-result recovery", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('nav [data-sidebar-target="projects"]').click();
  const input = page.getByRole("combobox", { name: "프로젝트 검색", exact: true });
  await input.fill("Yomates");
  await expect(page.locator(".searchable-select-menu [role=option]")).toHaveCount(1);
  await input.press("ArrowDown");
  await input.press("Enter");
  await expect(input).toHaveValue("Yomates");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".portfolio-detail-pane h2")).toHaveText("Yomates");
  await input.press("ArrowDown");
  await input.press("End");
  await expect(input).toHaveAttribute("aria-activedescendant", /option-18$/);
  await input.press("Escape");
  await expect(input).toHaveValue("Yomates");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await input.fill("검색결과없음-xyz");
  await expect(page.locator(".searchable-select-menu")).toContainText("검색 결과 없음");
  await expect(input).toBeEnabled();
  await input.fill("");
  await expect(page.locator(".searchable-select-menu [role=option]")).toHaveCount(19);
});
