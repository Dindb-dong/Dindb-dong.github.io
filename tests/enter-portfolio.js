export async function enterPortfolio(page) {
  await page.locator("#startup-enter").click();
  await page.locator("#portfolio-startup").waitFor({ state: "detached" });
}
