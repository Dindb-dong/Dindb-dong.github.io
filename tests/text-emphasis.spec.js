import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

for (const locale of ["ko", "en"]) {
  const prefix = locale === "ko" ? "" : "eng_";
  const projects = JSON.parse(await readFile(new URL(`../public/portfolio/data/${prefix}projectDetails.json`, import.meta.url), "utf8"));
  const experiences = JSON.parse(await readFile(new URL(`../public/portfolio/data/${prefix}experiences.json`, import.meta.url), "utf8"));

  test(`${locale} every project retains its text with selected topic and role emphasis`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/?ln=${locale}`);
    await page.locator('nav [data-sidebar-target="projects"]').click();
    for (const [id, project] of Object.entries(projects)) {
      await page.locator(`[data-project-id="${id}"]`).click();
      const detail = page.locator(".portfolio-detail-pane");
      await expect(detail.locator(".portfolio-detail-header p")).toHaveText(project.role);
      await expect(detail.locator(".portfolio-detail-header p strong")).toHaveText(project.role);
      await expect(detail.locator(".portfolio-detail-section").first().locator("p")).toHaveText(project.description);
      await expect(detail.locator(".portfolio-detail-section").nth(1).locator("li")).toHaveText(project.extraDescription);
      expect(await detail.locator(".portfolio-detail-section").first().locator(".portfolio-emphasis").count()).toBeGreaterThan(0);
    }
  });

  test(`${locale} all six experience apps emphasize source copy in Impact and Showcase`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const experience of experiences) {
      await page.goto(`/?ln=${locale}`);
      await page.locator('nav [data-sidebar-target="experience"]').click();
      await page.locator(`[data-experience-open="${experience.id}"]`).first().click();
      const app = page.locator(`[data-experience-app="${experience.id}"]`);
      await expect(app.locator(".experience-app-header p")).toHaveText(experience.position);
      expect(await app.locator(".experience-responsibilities .portfolio-emphasis").count()).toBeGreaterThan(0);
      await app.locator('nav [data-experience-tab="overview"]').click();
      await expect(app.locator(".experience-intro p")).toHaveText(experience.description[0]);
      expect(await app.locator(".experience-intro .portfolio-emphasis").count()).toBeGreaterThan(0);
      if (experience.id === 1) {
        await app.locator('nav [data-experience-tab="projects"]').click();
        await app.locator('[data-experience-project="19"]').click();
        const study = app.locator(".experience-case-study");
        await expect(study.locator("header p")).toHaveText(projects[19].description.join(" "));
        await expect(study.locator("header p .portfolio-emphasis").first()).toHaveText(locale === "ko" ? "백엔드 아키텍처 설계에 참여" : "Contributed to backend architecture design");
      }
    }
  });

  for (const width of [320, 390]) {
    test(`${locale} emphasis wraps inside ${width}px overview and experience content`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/?ln=${locale}`);
      await expect(page.locator(".profile-school-meta .portfolio-highlight")).toHaveText("4.00 / 4.3");
      await expect(page.locator(".profile-research .portfolio-highlight")).toHaveCSS("display", "inline");
      await expect(page.locator(".profile-research .portfolio-highlight")).toHaveCSS("font-size", "12px");
      await expect(page.locator(".profile-career-list .portfolio-emphasis").first()).toHaveCSS("font-size", "12px");
      await expect(page.locator(".profile-research .portfolio-highlight")).toHaveText(locale === "ko" ? "60명 넘는 학회원이 매일 사용" : "used daily by 60+ members");
      await page.locator('[data-experience-open="1"]').first().click();
      const app = page.locator('[data-experience-app="1"]');
      const markers = app.locator(".experience-responsibilities .portfolio-highlight");
      await expect(markers).toHaveCount(4);
      await expect(markers.first()).toHaveCSS("box-decoration-break", "clone");
      expect(await app.locator(".experience-main").evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      for (const marker of await markers.all()) {
        expect(await marker.evaluate(element => [...element.getClientRects()].every(rect => rect.left >= 0 && rect.right <= innerWidth))).toBe(true);
      }
      await page.screenshot({ path: testInfo.outputPath(`emphasis-${locale}-${width}.png`) });
    });
  }
}
