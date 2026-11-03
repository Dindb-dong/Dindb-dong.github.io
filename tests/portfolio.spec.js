import { expect, test } from "@playwright/test";

test("overview shows verified profile panels and launches career and research details", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await expect(page.locator(".profile-panel")).toHaveCount(5);
  await expect(page.locator(".profile-panel h2")).toHaveText(["학력·언어", "스테이터스", "커리어", "연구·리더십", "개발 도구"]);
  await expect(page.locator(".profile-education")).toContainText("과천외국어고등학교");
  await expect(page.locator(".profile-education")).toContainText("응용통계학 · 컴퓨터과학");
  await expect(page.locator(".profile-education")).toContainText("4.00");
  await expect(page.locator(".profile-languages dd")).toHaveText(["원어민", "상", "상"]);
  await expect(page.locator(".profile-grade-grid dd")).toHaveText(["SS", "A+", "A", "A-", "A", "B+"]);
  await expect(page.locator(".profile-career")).toContainText("2024.07–2024.11");
  await expect(page.locator(".profile-tools")).toContainText("Kubernetes");
  await expect(page.locator(".profile-overview")).not.toContainText("작업 방식");
  await expect(page.locator(".portfolio-featured-project, .portfolio-product-preview")).toHaveCount(0);
  await expect(page.locator(".portfolio-sidebar .portfolio-avatar")).toHaveJSProperty("complete", true);
  expect(await page.locator(".portfolio-avatar").evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await page.locator('.profile-career [data-experience-open="4"]').click();
  await expect(page.locator('.experience-app[data-experience-app="4"]')).toBeVisible();
  await page.getByRole("button", { name: "Focus Kim Dong Wook.app", exact: true }).click();
  await page.locator('[data-profile-project="20"]').click();
  await expect(page.locator('[data-project-id="20"]')).toHaveAttribute("aria-selected", "true");
});

test("desktop app shortcuts remain visible beside the default portfolio window", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const shortcuts = page.locator(".dos-icon");
  await expect(shortcuts).toHaveCount(16);
  for (const name of ["Portfolio.app", "Projects.app", "Resume.app", "Files.app", "Terminal.app"]) {
    const shortcut = page.locator(`.dos-icon[aria-label="Open ${name}"]`);
    await shortcut.scrollIntoViewIfNeeded();
    await expect(shortcut).toBeVisible();
    expect(await shortcut.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const topElement = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return topElement?.closest(".dos-icon") === element;
    })).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("desktop.png") });
});

test("project search, empty state, and reset remain usable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="projects"]').click();

  const search = page.getByRole("searchbox", { name: "프로젝트 검색" });
  await search.fill("DindbOS");
  await expect(page.locator("[data-project-id]" )).toHaveCount(1);
  await expect(page.locator("[data-project-id]")).toContainText("DindbOS");

  await search.fill("does-not-exist");
  await expect(page.getByText("검색 결과 없음")).toBeVisible();
  await page.getByRole("button", { name: "검색 초기화" }).click();
  await expect(page.locator("[data-project-id]")).toHaveCount(19);
  await expect(page.getByRole("status")).toContainText("19개 프로젝트");
});

test("mobile layout exposes every portfolio destination without page overflow", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Portfolio sections" });
  await expect(navigation.getByRole("button")).toHaveCount(7);
  for (const target of ["about", "projects", "experience", "skills", "resume", "settings", "contact"]) {
    await expect(navigation.locator(`[data-sidebar-target="${target}"]`)).toBeVisible();
  }
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(await page.evaluate(() => document.body.clientWidth));

  const readingPane = page.locator(".portfolio-about .portfolio-main-pane");
  expect(await readingPane.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
  const paneBounds = await readingPane.boundingBox();
  expect((await readingPane.locator("h1").boundingBox()).x - paneBounds.x).toBeGreaterThanOrEqual(16);
  await page.screenshot({ path: testInfo.outputPath("mobile-overview.png") });
  await navigation.locator('[data-sidebar-target="projects"]').click();
  await expect(page.getByRole("searchbox", { name: "프로젝트 검색" })).toBeVisible();
  await expect(page.locator("[data-project-id]").first()).toBeVisible();
  await expect(page.locator(".portfolio-detail-pane")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile.png") });
});

test("company projects remain accessible after removing the overview showcase", async ({ page }) => {
  const names = ["AI 상세페이지 생성·편집", "Yomates"];
  const ids = [17, 19];
  const urls = ["https://leviosa.ai.kr/agency/detail-page/new-landing", "https://yomates.ai/"];
  for (const [index, name] of names.entries()) {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="projects"]').click();
    await page.locator(`[data-project-id="${ids[index]}"]`).click();
    await expect(page.locator(`[data-project-id="${ids[index]}"]`)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".portfolio-detail-pane").getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.locator(".portfolio-detail-pane").getByRole("link", { name: "Website", exact: true })).toHaveAttribute("href", urls[index]);
    const image = page.locator(".portfolio-detail-pane img").first();
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(1000);
    await expect(page.locator('[data-project-id="18"]')).toHaveCount(0);
  }
});

test("Leviosa experience includes representative work and maintenance in both languages", async ({ page }, testInfo) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Portfolio sections" });
  await nav.locator('[data-sidebar-target="experience"]').click();
  const company = page.locator(".portfolio-timeline-card").filter({ hasText: "Leviosa AI" });
  for (const text of ["AI 상세페이지 생성·편집", "Agency", "Yomates", "네이버 스마트스토어·톡톡", "대부분 단독", "어드민", "Telegram·Notion"]) {
    await expect(company).toContainText(text);
  }
  await page.screenshot({ path: testInfo.outputPath("leviosa-experience.png") });
  await nav.locator('[data-sidebar-target="settings"]').click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await nav.locator('[data-sidebar-target="about"]').click();
  await expect(page.locator(".profile-panel h2")).toHaveText(["Education & languages", "Skills", "Experience", "Research & leadership", "Development tools"]);
  await expect(page.locator(".profile-languages dd")).toHaveText(["Native", "Advanced", "Advanced"]);
  await nav.locator('[data-sidebar-target="experience"]').click();
  for (const text of ["AI Detail Page", "Agency", "Yomates", "Naver Smart Store", "Web & Admin", "Telegram & Notion"]) {
    await expect(company).toContainText(text);
  }
});

test("language and resume controls work inside the portfolio window", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Portfolio sections" });

  await navigation.locator('[data-sidebar-target="settings"]').click();
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="about"]')).toContainText("Overview");

  await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="resume"]').click();
  await expect(page.locator('iframe[title="Kim Dong Wook Resume"]')).toBeVisible();
  await expect(page.frameLocator('iframe[title="Kim Dong Wook Resume"]').getByRole("heading", { name: "Kim Dong Wook" })).toBeVisible();
});

test("portfolio minimizes, restores, closes, and reopens on the new runtime", async ({ page }) => {
  await page.goto("/");
  const window = page.locator(".dos-window").filter({ has: page.locator(".portfolio-os-app") });
  await expect(window.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await window.getByRole("button", { name: "Minimize", exact: true }).click();
  await page.getByRole("button", { name: "Restore Kim Dong Wook.app", exact: true }).click();
  await expect(window.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await window.getByRole("button", { name: "Close", exact: true }).click();
  await expect(window).toHaveCount(0);
  await page.getByRole("button", { name: "Launch Portfolio", exact: true }).click();
  await expect(window.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
});


test("design board and portfolio share the main/sub palette", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Portfolio sections" });
  await expect(navigation.locator("button span").first()).toHaveCSS("font-size", "14px");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCSS("background-color", "rgb(124, 159, 229)");
  await expect(navigation.locator('[aria-current="page"]')).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator(".profile-grade-grid dd").first()).toHaveCSS("color", "rgb(37, 99, 235)");
  await page.screenshot({ path: testInfo.outputPath("shared-palette-portfolio.png") });
  await page.goto("/design-board.html");
  await expect(page.getByRole("heading", { name: "Kim Dong Wook · Design Board" })).toBeVisible();
  await expect(page.locator(".primary")).toHaveCSS("background-color", "rgb(124, 159, 229)");
  await expect(page.locator(".primary")).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator(".secondary")).toHaveCSS("background-color", "rgb(37, 99, 235)");
  await page.getByRole("navigation").getByRole("button", { name: "프로젝트" }).click();
  await expect(page.getByRole("navigation").getByRole("button", { name: "프로젝트" })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: testInfo.outputPath("design-board.png"), fullPage: true });
});

for (const width of [1440, 1024, 390]) {
  test(`profile panels fit the reading pane at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 1000 });
    await page.goto("/");
    const pane = page.locator(".profile-overview");
    await expect(pane).toBeVisible();
    expect(await pane.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
    for (const panel of await pane.locator(".profile-panel").all()) {
      expect(await panel.evaluate(el => el.scrollWidth - el.clientWidth)).toBeLessThan(2);
    }
    if (width === 1440) {
      expect(await pane.evaluate(el => el.scrollHeight - el.clientHeight)).toBeLessThan(2);
    }
    await page.screenshot({ path: testInfo.outputPath(`profile-${width}.png`), animations: "disabled" });
  });
}
