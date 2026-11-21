import { expect, test } from "@playwright/test";
import { enterPortfolio } from "./enter-portfolio.js";

const endpoint = process.env.VITE_PORTFOLIO_ANALYTICS_URL;
const live = process.env.PORTFOLIO_ANALYTICS_LIVE === "1";

test("portfolio records a visit, app launches, content, and an intentional PDF click", async ({ page }) => {
  test.skip(!endpoint, "This test requires a configured analytics collector.");
  const snapshots = [];
  page.on("request", request => {
    if (request.url() === endpoint && request.method() === "POST") snapshots.push(request.postDataJSON());
  });
  if (!live) await page.route(endpoint, route => route.fulfill({ status: 204 }));
  await page.route("**/resume.pdf", route => route.fulfill({
    status: 200, contentType: "application/pdf", body: "%PDF-1.4",
  }));

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?lang=en&style=macos&analytics_test=1&utm_source=verification");
  await enterPortfolio(page);
  await expect.poll(() => snapshots.at(-1)?.entry).toBe("portfolio");
  expect(snapshots.at(-1).test).toBe(true);
  expect(snapshots.at(-1).apps.portfolio).toBeUndefined();
  const sessionId = snapshots.at(-1).sessionId;

  await page.locator('.dos-icon[aria-label="Open Projects.app"]').press("Enter");
  const project = page.locator('.dos-window[data-app-id="projects-portfolio"]');
  await project.locator("[data-project-id]").first().click();
  await expect(project.locator(".portfolio-detail-header")).toBeVisible();
  await expect.poll(() => snapshots.at(-1)?.apps["projects-portfolio"]).toBe(1);
  await expect.poll(() => snapshots.at(-1)?.content.some(row => row.type === "project")).toBe(true);
  await project.getByRole("button", { name: "Close", exact: true }).click();
  await page.locator('.dos-icon[aria-label="Open Leviosa-AI.app"]').press("Enter");
  const experience = page.locator('.dos-window[data-app-id="experience-leviosa"]');
  await expect(experience.locator(".experience-contributions")).toBeVisible();
  await expect.poll(() => snapshots.at(-1)?.content.some(row => row.type === "experience" && row.id === "1")).toBe(true);
  await experience.getByRole("button", { name: "Close", exact: true }).click();

  await page.locator('.dos-icon[aria-label="Open Resume.app"]').press("Enter");
  const resume = page.locator('.dos-window[data-app-id="resume"]');
  await expect(resume.locator("iframe")).toBeVisible();
  await expect.poll(() => snapshots.at(-1)?.content.some(row => row.type === "resume")).toBe(true);
  await resume.locator("a[download]").click();
  await expect.poll(() => snapshots.at(-1)?.content.find(row => row.type === "resume")?.pdf).toBe(1);
  const result = snapshots.at(-1);
  expect(result.sessionId).toBe(sessionId);
  expect(result.firstApp).toBe("projects-portfolio");
  expect(result.apps).toMatchObject({ "projects-portfolio": 1, "experience-leviosa": 1, resume: 1 });
  expect(result.content.find(row => row.type === "project").ms).toBeGreaterThan(0);
  if (live) console.log("Live analytics session", sessionId);

  await page.goto("/resume.html?analytics_test=1");
  await expect.poll(() => snapshots.at(-1)?.content.find(row => row.type === "resume")?.routes).toContain("standalone");
  expect(snapshots.at(-1).sessionId).toBe(sessionId);
});
