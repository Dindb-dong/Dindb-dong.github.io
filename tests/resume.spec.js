import { enterPortfolio } from "./enter-portfolio.js";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("standalone and printed resume keep body metrics plain", async ({ page }) => {
  await page.goto("/resume.html");
  await expect(page.getByText("GPA: 4.0/4.3")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Gwacheon Foreign Language/ })).toBeVisible();
  await expect(page.getByText("| Mar 2020 - Jan 2023", { exact: true })).toBeVisible();
  await expect(page.getByText(/Fine-tuned EfficientFace/)).toHaveCount(0);
  const metric = page.locator(".resume-highlight").first();
  await expect(metric).toHaveCSS("font-weight", "400");
  await page.goto("/resume.html?view=portfolio");
  await expect(metric).toHaveCSS("font-weight", "700");
  await expect(metric).not.toHaveCSS("background-image", "none");
  const topic = page.locator(".resume-emphasis:not(.resume-highlight)").first();
  await expect(topic).toHaveCSS("font-weight", "700");
  await expect(topic).toHaveCSS("background-image", "none");
  for (const phrase of ["data analysis", "logistics automation", "CLIP + BLIP2", "Dueling DDQN", "GRU trajectory prediction"]) {
    await expect(page.locator(".resume-emphasis", { hasText: phrase }).first()).toHaveCSS("font-weight", "700");
  }
  await page.emulateMedia({ media: "print" });
  await expect(metric).toHaveCSS("font-weight", "400");
  await expect(metric).toHaveCSS("background-image", "none");
  await expect(topic).toHaveCSS("font-weight", "400");
});

test("resume app embeds highlighted preview and downloads PDF", async ({ page }) => {
  await page.goto("/");
  await enterPortfolio(page);
  await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
  await page.locator('.dos-icon[aria-label="Open Resume.app"]').dblclick();
  const app = page.locator(".portfolio-resume-app");
  await expect(app.locator(".portfolio-resume-actions a")).toHaveCount(1);
  const downloadLink = app.getByRole("link", { name: "PDF 다운로드", exact: true });
  await expect(downloadLink).toHaveAttribute("download", "Kim-Dong-Wook-Resume.pdf");
  await expect(app.locator("iframe")).toHaveAttribute("src", "/resume.html?view=portfolio");
  const metric = app.frameLocator("iframe").locator(".resume-emphasis").first();
  await expect(metric).toHaveCSS("font-weight", "700");
  const pending = page.waitForEvent("download");
  await downloadLink.click();
  expect((await pending).suggestedFilename()).toBe("Kim-Dong-Wook-Resume.pdf");
});

test("YAI contributions use grouped sections in both languages", async ({ page }) => {
  for (const [locale, headings] of [
    ["ko", ["플랫폼·제품 개발", "인프라·부하 검증", "배포·운영 자동화", "AI 연구·프로젝트"]],
    ["en", ["Platform & product engineering", "Infrastructure & load testing", "Deployment & operations automation", "AI research & projects"]],
  ]) {
    await page.goto(`/?ln=${locale}`);
    await enterPortfolio(page);
    await expect(page.locator("#app")).toHaveAttribute("aria-busy", "false");
    await page.locator("#portfolio-startup").waitFor({ state: "hidden" });
    await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="experience"]').click();
    await page.locator('[data-experience-open="3"]').first().click();
    const app = page.locator('[data-experience-app="3"]');
    await expect(app.locator(".experience-responsibilities h2")).toHaveText(headings);
    await expect(app.locator(".experience-responsibilities article")).toHaveCount(4);
    await expect(app.locator(".experience-responsibilities li")).toHaveCount(11);
  }
});
