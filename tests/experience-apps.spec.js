import { expect, test } from "@playwright/test";

const apps = [
  [1, "Leviosa-AI"], [2, "Alus-Healthcare"], [3, "YAI"],
  [4, "NOI-LAB"], [5, "YCC"], [6, "SDP"],
];

async function openExperience(page, id) {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Portfolio sections" }).locator('[data-sidebar-target="experience"]').click();
  await page.locator(`[data-experience-open="${id}"]`).first().click();
  const app = page.locator(`.experience-app[data-experience-app="${id}"]`);
  await expect(app).toBeVisible();
  return app;
}

for (const [id, name] of apps) {
  test(`${name} launches as an independent app with real media and case studies`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const app = await openExperience(page, id);
    await expect(page.locator(`.dos-icon[aria-label="Open ${name}.app"]`)).toHaveCount(1);
    await expect(app.getByRole("navigation", { name: "Experience sections" }).getByRole("button")).toHaveCount(4);
    const navigation = app.getByRole("navigation", { name: "Experience sections" });
    await expect(navigation.locator("button svg")).toHaveCount(4);
    await expect(navigation.locator('button[aria-current="page"]')).toHaveCSS("background-color", "rgb(124, 159, 229)");
    await expect(navigation.locator('button[aria-current="page"]')).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(navigation.locator("button span").first()).toHaveCSS("font-size", "14px");
    await expect(app.locator(".experience-identity strong")).toHaveCSS("color", "rgb(32, 33, 36)");
    await expect(app.locator(".experience-intro h2")).toHaveCSS("color", "rgb(32, 33, 36)");
    const logo = app.locator(".experience-identity img");
    await expect(logo).toHaveJSProperty("complete", true);
    expect(await logo.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0);
    const image = app.locator(".experience-hero-media img");
    await expect(image).toBeVisible();
    await expect(image).toHaveJSProperty("complete", true);
    expect(await image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(300);
    await app.locator('nav [data-experience-tab="projects"]').click();
    await expect(app.locator("[data-experience-case]")).toBeVisible();
    await app.locator('nav [data-experience-tab="gallery"]').click();
    expect(await app.locator(".experience-gallery figure").count()).toBeGreaterThan(0);
    await app.locator('nav [data-experience-tab="role"]').click();
    await expect(app.locator(".experience-responsibilities article").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("experience viewer supports keyboard, state, multiple apps, and language refresh", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const app = await openExperience(page, 1);
  await page.screenshot({ path: testInfo.outputPath("leviosa-overview.png") });
  await app.locator('nav [data-experience-tab="projects"]').click();
  await app.locator('[data-experience-project="19"]').click();
  await expect(app.locator('[data-experience-case="19"] h2')).toHaveText("Yomates");
  await app.locator('[data-experience-image="1"]').click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-lightbox-count]")).toHaveText("2 / 3");
  await dialog.press("ArrowRight");
  await expect(dialog.locator("[data-lightbox-count]")).toHaveText("3 / 3");
  await dialog.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(app.locator('[data-experience-image="1"]')).toBeFocused();
  const window = page.locator(".dos-window").filter({ has: app });
  await window.getByRole("button", { name: "Minimize", exact: true }).click();
  await page.getByRole("button", { name: "Restore Leviosa-AI.app", exact: true }).click();
  await expect(app.locator('[data-experience-case="19"]')).toBeVisible();
  await app.locator("[data-experience-switch]").selectOption("3");
  const yai = page.locator('.experience-app[data-experience-app="3"]');
  await expect(yai).toBeVisible();
  await yai.locator("[data-experience-switch]").selectOption("1");
  await expect(page.locator('.experience-app[data-experience-app="1"]')).toHaveCount(1);
  await expect(app.locator('[data-experience-case="19"]')).toBeVisible();
  await page.getByRole("button", { name: "Focus Kim Dong Wook.app", exact: true }).click();
  const nav = page.getByRole("navigation", { name: "Portfolio sections" });
  await nav.locator('[data-sidebar-target="settings"]').click();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Focus Leviosa-AI.app", exact: true }).click();
  await expect(app.locator('nav [data-experience-tab="gallery"]')).toHaveText("Media library3");
  await expect(app.locator('[data-experience-case="19"]')).toBeVisible();
  await window.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Focus YAI.app", exact: true }).click();
  await yai.locator("[data-experience-switch]").selectOption("1");
  await expect(app).toHaveAttribute("data-experience-tab-active", "overview");
});

for (const width of [1024, 390]) {
  test(`experience layout and gallery work at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 });
    const app = await openExperience(page, 1);
    await expect(app.getByRole("heading", { name: "Leviosa AI", exact: true })).toBeVisible();
    expect(await app.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    const main = app.locator(".experience-main");
    expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    for (const tab of ["overview", "projects", "gallery", "role"]) {
      await expect(app.locator(`nav [data-experience-tab="${tab}"]`)).toBeVisible();
    }
    await page.screenshot({ path: testInfo.outputPath(`experience-${width}.png`) });
    await app.locator('nav [data-experience-tab="gallery"]').click();
    await app.locator("[data-experience-image]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveJSProperty("complete", true);
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`gallery-${width}.png`) });
    await dialog.getByRole("button", { name: "닫기", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth <= document.body.clientWidth)).toBe(true);
  });
}


test("an already-open experience menu stays styled with its previous markup", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const app = await openExperience(page, 1);
  const nav = app.getByRole("navigation", { name: "Experience sections" });
  // Reproduce the older open app: no shared nav class or icon elements.
  await nav.evaluate(el => { el.removeAttribute("class"); el.querySelectorAll("svg").forEach(icon => icon.remove()); });
  await expect(nav).toHaveCSS("display", "grid");
  const selected = nav.locator('[aria-current="page"]');
  await expect(selected).toHaveCSS("background-color", "rgb(124, 159, 229)");
  await expect(selected).toHaveCSS("border-radius", "16px");
  await expect(selected.locator("span")).toHaveCSS("font-size", "14px");
  const first = await nav.locator("button").nth(0).boundingBox();
  const second = await nav.locator("button").nth(1).boundingBox();
  expect(second.y - first.y).toBeGreaterThanOrEqual(60);
  await page.screenshot({ path: testInfo.outputPath("existing-menu.png") });
  await nav.locator('[data-experience-tab="projects"]').click();
  await expect(app.locator("[data-experience-case]")).toBeVisible();
  await expect(app.locator("nav button svg")).toHaveCount(4);
});
