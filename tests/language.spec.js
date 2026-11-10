import { enterPortfolio } from "./enter-portfolio.js";
import { expect, test } from "@playwright/test";

for (const [browserLocale, expected] of [["ko-KR", "ko"], ["en-US", "en"], ["ja-JP", "en"]]) {
  test.describe(`browser language ${browserLocale}`, () => {
    test.use({ locale: browserLocale });
    test("first visit follows browser language", async ({ page }) => {
      await page.goto("/");
      await enterPortfolio(page);
      await expect(page.locator("html")).toHaveAttribute("lang", expected);
      await expect(page.getByRole("navigation", { name: "Portfolio sections" }).getByRole("button").first())
        .toHaveText(expected === "ko" ? "개요" : "Overview");
    });
  });
}

for (const [requested, saved, label] of [["en", "ko", "Overview"], ["ko", "en", "개요"]]) {
  test(`ln=${requested} overrides saved ${saved} without rewriting it`, async ({ page }) => {
    await page.addInitScript(saved => localStorage.setItem("dindbos-language", saved), saved);
    await page.goto(`/?ln=${requested}`);
    await enterPortfolio(page);
    await expect(page.locator("html")).toHaveAttribute("lang", requested);
    await expect(page.getByRole("navigation", { name: "Portfolio sections" }).getByRole("button").first()).toHaveText(label);
    await expect.poll(() => page.evaluate(() => localStorage.getItem("dindbos-language"))).toBe(saved);
    await page.locator('.profile-career [data-experience-open="1"]').click();
    const contribution = page.locator('.experience-app[data-experience-app="1"] .experience-responsibilities');
    await expect(contribution.locator("ul")).toHaveCount(4);
    await expect(contribution.locator("li")).toHaveCount(16);
    await expect(contribution).toContainText("200%");
    await expect(contribution).toContainText("Terraform");
  });
}
