import { expect, test } from "@playwright/test";

test("standalone and printed resume keep body metrics plain", async ({ page }) => {
  await page.goto("/resume.html");
  await expect(page.getByText("GPA: 4.0/4.3")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Gwacheon Foreign Language/ })).toBeVisible();
  await expect(page.getByText("| Mar 2020 - Jan 2023", { exact: true })).toBeVisible();
  await expect(page.getByText(/Fine-tuned EfficientFace/)).toHaveCount(0);
  const metric = page.locator(".resume-emphasis").first();
  await expect(metric).toHaveCSS("font-weight", "400");
  await page.goto("/resume.html?view=portfolio");
  await expect(metric).toHaveCSS("font-weight", "700");
  await expect(metric).not.toHaveCSS("background-image", "none");
  await page.emulateMedia({ media: "print" });
  await expect(metric).toHaveCSS("font-weight", "400");
  await expect(metric).toHaveCSS("background-image", "none");
});

test("resume app embeds highlighted preview and downloads PDF", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Press any key or tap to enter", exact: true }).click();
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
