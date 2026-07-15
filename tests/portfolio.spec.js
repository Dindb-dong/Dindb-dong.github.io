import { expect, test } from "@playwright/test";

test("overview leads with identity, work, and primary actions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Kim Dong Wook", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "프로젝트 보기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "이력서 열기" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "대표 프로젝트" })).toBeVisible();
  await expect(page.locator(".portfolio-featured-project")).toHaveCount(3);
  await expect(page.locator(".portfolio-avatar")).toHaveJSProperty("complete", true);
  expect(await page.locator(".portfolio-avatar").evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(await page.evaluate(() => document.body.clientWidth));
});

test("desktop app shortcuts remain visible beside the default portfolio window", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const shortcuts = page.locator(".dos-icon");
  await expect(shortcuts).toHaveCount(10);
  for (const name of ["Portfolio.app", "Projects.app", "Resume.app", "Files.app", "Terminal.app"]) {
    const shortcut = page.getByRole("button", { name: `Open ${name}` });
    await expect(shortcut).toBeVisible();
    expect(await shortcut.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const topElement = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return topElement?.closest(".dos-icon") === element;
    })).toBe(true);
  }
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
  await expect(page.locator("[data-project-id]")).toHaveCount(16);
  await expect(page.getByRole("status")).toContainText("16개 프로젝트");
});

test("mobile layout exposes every portfolio destination without page overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const navigation = page.getByRole("navigation", { name: "Portfolio sections" });
  await expect(navigation.getByRole("button")).toHaveCount(7);
  for (const target of ["about", "projects", "experience", "skills", "resume", "settings", "contact"]) {
    await expect(navigation.locator(`[data-sidebar-target="${target}"]`)).toBeVisible();
  }
  expect(await page.evaluate(() => document.body.scrollWidth)).toBe(await page.evaluate(() => document.body.clientWidth));

  await navigation.locator('[data-sidebar-target="projects"]').click();
  await expect(page.getByRole("searchbox", { name: "프로젝트 검색" })).toBeVisible();
  await expect(page.locator("[data-project-id]").first()).toBeVisible();
  await expect(page.locator(".portfolio-detail-pane")).toBeVisible();
});

test("featured work opens the matching project detail", async ({ page }) => {
  await page.goto("/");

  await page.locator('[data-featured-project="15"]').click();
  await expect(page.locator('[data-project-id="15"]')).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".portfolio-detail-pane").getByRole("heading", { name: "DindbOS", exact: true })).toBeVisible();
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
