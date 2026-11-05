import { expect, test } from "@playwright/test";

for (const locale of ["ko", "en"]) {
  test(`built host loads active ${locale} content without archive requests`, async ({ page, request }, testInfo) => {
    const archiveRequests = [];
    page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/legacy/")) archiveRequests.push(request.url()); });
    await page.addInitScript(locale => localStorage.setItem("dindbos-language", locale), locale);
    await page.goto("/");
    await expect(page.getByRole("heading", { name: locale === "ko" ? "김동욱" : "Kim Dong Wook", exact: true })).toBeVisible();
    await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="projects"]').click();
    await expect(page.locator("[data-project-id]")).toHaveCount(19);
    const image = page.locator(".portfolio-project-row img").first();
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
    expect(archiveRequests).toEqual([]);

    const prefix = locale === "ko" ? "" : "eng_";
    for (const name of ["projectDetails", "introduce", "experiences"]) {
      const active = await request.get(`/portfolio/data/${prefix}${name}.json`);
      expect(active.ok()).toBe(true);
      if (testInfo.config.configFile.endsWith("playwright.preview.config.js")) {
        const compatible = await request.get(`/legacy/public/${prefix}${name}.json`);
        expect(compatible.ok()).toBe(true);
        expect(await compatible.json()).toEqual(await active.json());
      }
    }
    for (const path of ["/resume.html", "/resume.pdf", "/assets/presentations/manifest.json"]) {
      expect((await request.get(path)).ok()).toBe(true);
    }
    if (testInfo.config.configFile.endsWith("playwright.preview.config.js")) {
      const active = await request.get("/portfolio/media/proj_20_1.png");
      const compatible = await request.get("/legacy/public/thumbnails/proj_20_1.png");
      expect(active.ok()).toBe(true);
      expect(compatible.ok()).toBe(true);
      expect(await compatible.body()).toEqual(await active.body());
    }
  });
}

test("navigating to another open window preserves source project controls and closes the latest view", async ({ page }) => {
  await page.goto("/");
  const portfolio = page.locator('.dos-window[data-window-id="portfolio"]');
  await page.locator('.dos-icon[aria-label="Open Resume.app"]').dblclick();
  await expect(page.locator('.portfolio-resume-frame')).toBeVisible();
  await page.getByRole("button", { name: "Focus Kim Dong Wook.app", exact: true }).click();
  const navigation = portfolio.getByRole("navigation", { name: "Portfolio sections" });
  await navigation.locator('[data-sidebar-target="projects"]').click();
  await navigation.locator('[data-sidebar-target="resume"]').click();
  const search = portfolio.getByRole("combobox", { name: "프로젝트 검색" });
  await search.fill("DindbOS");
  await expect(portfolio.locator("[data-project-id]")).toHaveCount(1);
  await search.fill("");
  await portfolio.locator("[data-project-filters]").click();
  await portfolio.locator('.portfolio-filter-options input[value="AI"]').check();
  await expect(portfolio.locator('.portfolio-filter-options input[value="AI"]')).toBeChecked();
  await page.keyboard.press("Escape");
  await navigation.locator('[data-sidebar-target="about"]').click();
  await navigation.locator('[data-sidebar-target="projects"]').click();
  await expect(portfolio.locator("[data-project-id]")).not.toHaveCount(0);
  await portfolio.getByRole("button", { name: "Close", exact: true }).click();
  await page.locator('.dos-icon[aria-label="Open Portfolio.app"]').dblclick();
  await expect(portfolio.getByRole("heading", { name: "김동욱", exact: true })).toBeVisible();
  await portfolio.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="projects"]').click();
  await portfolio.locator("[data-project-filters]").click();
  await portfolio.locator("[data-project-reset]").click();
  await portfolio.getByRole("combobox", { name: "프로젝트 검색" }).fill("YAI-HUB");
  await expect(portfolio.locator("[data-project-id]")).toHaveCount(1);
});
