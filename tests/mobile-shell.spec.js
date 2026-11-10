import { expect, test } from "@playwright/test";
import { EXPERIENCE_APPS } from "../src/experience-content.js";
import { enterPortfolio } from "./enter-portfolio.js";

test.use({
  viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
  reducedMotion: "no-preference", contextOptions: { reducedMotion: "no-preference" },
  video: { mode: "on", size: { width: 390, height: 844 } },
});

async function settle(locator) {
  await locator.evaluate(async element => {
    await Promise.all(element.getAnimations({ subtree: true })
      .filter(animation => animation.playState === "running" && Number.isFinite(animation.effect.getComputedTiming().endTime))
      .map(animation => animation.finished.catch(() => {})));
  });
}

async function boot(page, style) {
  await page.goto(`/?style=${style}&ln=en&intro=0`);
  await enterPortfolio(page);
  const root = page.locator("#app");
  await expect(root).toHaveAttribute("aria-busy", "false");
  await expect(root).toHaveAttribute("data-ui-style", style);
  await expect(root.locator('.dos-window[data-app-id="portfolio"] .portfolio-about')).toBeVisible();
  expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(false);
  await settle(root);
  return root;
}

const homeButton = (root, style) => root.locator(style === "ios" ? ".dos-ios-home" : '[data-android-action="home"]');
async function home(root, style) {
  await homeButton(root, style).tap();
  await expect(root.locator(".dos-desktop")).toBeVisible();
  await settle(root);
}

async function touchSwipe(page, locator, dx, dy, sample) {
  const bounds = await locator.boundingBox();
  expect(bounds).not.toBeNull();
  const start = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  const session = await page.context().newCDPSession(page);
  const samples = [];
  try {
    if (sample) samples.push(await sample.boundingBox());
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ ...start, radiusX: 2, radiusY: 2 }] });
    for (let step = 1; step <= 12; step++) {
      await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + dx * step / 12, y: start.y + dy * step / 12, radiusX: 2, radiusY: 2 }] });
      if (sample && step === 6) samples.push(await sample.boundingBox());
      await page.waitForTimeout(12);
    }
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    if (sample) samples.push(await sample.boundingBox());
  } finally { await session.detach(); }
  return samples;
}

async function openRecents(page, root, style) {
  if (style === "ios") await touchSwipe(page, homeButton(root, style), 0, -140);
  else await root.locator('[data-android-action="recents"]').tap();
  const dialog = root.getByRole("dialog", { name: "Recent apps", exact: true });
  await expect(dialog).toBeVisible();
  await settle(dialog);
  return dialog;
}

async function launchExperience(page, root, style, app) {
  if (style === "ios") {
    await root.getByRole("button", { name: "Open Experience", exact: true }).tap();
    const folder = root.getByRole("dialog", { name: "Experience", exact: true });
    await expect(folder).toBeVisible();
    await settle(folder);
    await folder.locator(`[data-folder-app-id="${app.appId}"]`).tap();
    await expect(folder).toHaveCount(0);
  } else await root.locator(`.dos-desktop [data-desktop-app-id="${app.appId}"]`).tap();
  const content = root.locator(`.dos-window[data-app-id="${app.appId}"] .experience-app`);
  await expect(content).toBeVisible();
  await expect(content).toHaveAttribute("data-experience-app", String(app.id));
  await settle(root);
  return content;
}

async function experienceLayout(content) {
  return content.evaluate(element => {
    const app = element.getBoundingClientRect();
    const nav = element.querySelector('nav[aria-label="Experience sections"]').getBoundingClientRect();
    const main = element.querySelector(".experience-main").getBoundingClientRect();
    const identity = element.querySelector(".experience-identity").getBoundingClientRect();
    const viewport = (element.closest(".dos-recent-preview") || element.closest(".dos-window-content")).getBoundingClientRect();
    return {
      navVisibleFraction: Math.max(0, Math.min(nav.bottom, viewport.bottom) - Math.max(nav.top, viewport.top)) / nav.height,
      navTop: (nav.top - app.top) / app.height,
      navBottom: (nav.bottom - app.top) / app.height,
      mainTop: (main.top - app.top) / app.height,
      mainBottom: (main.bottom - app.top) / app.height,
      identityVisible: identity.width > 0 && identity.height > 0,
    };
  });
}

async function expectFaithfulPreview(snapshot, original) {
  const preview = await experienceLayout(snapshot);
  expect(original.navTop, "The actual app keeps navigation below its content").toBeGreaterThanOrEqual(original.mainBottom - .01);
  expect(original.identityVisible, "The actual mobile app hides its desktop identity sidebar").toBe(false);
  expect(preview.identityVisible, "The recent app preserves the actual mobile identity visibility").toBe(original.identityVisible);
  expect(original.navVisibleFraction, "The actual mobile navigation fits its app viewport").toBeGreaterThan(.98);
  expect(preview.navVisibleFraction, "The recent card shows the complete navigation rather than clipping the scaled app").toBeGreaterThan(.98);
  for (const coordinate of ["navTop", "navBottom", "mainTop", "mainBottom"]) {
    expect(Math.abs(preview[coordinate] - original[coordinate]), `Recent app preserves normalized ${coordinate}`).toBeLessThan(.025);
  }
}

for (const style of ["android", "ios"]) {
  test.describe(`${style} actual portfolio mobile shell`, () => {
    test("home and six real career apps retain logos, content and native folder geometry", async ({ page }, info) => {
      test.setTimeout(90_000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const root = await boot(page, style);
      await home(root, style);
      expect(await root.locator(".dos-desktop").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4);
      await expect(root.locator(".dos-android-heading")).toHaveCount(0);
      await page.screenshot({ path: info.outputPath(`${style}-actual-home.png`) });
      if (style === "ios") {
        const trigger = root.getByRole("button", { name: "Open Experience", exact: true });
        await expect(trigger.locator(".dos-folder-preview img")).toHaveCount(4);
        await trigger.tap();
        const folder = root.getByRole("dialog", { name: "Experience", exact: true });
        const entering = await folder.boundingBox();
        await settle(folder);
        const opened = await folder.boundingBox();
        expect(entering.width).toBeLessThan(opened.width);
        const panel = await folder.locator(".dos-home-folder-grid").boundingBox();
        const title = await folder.getByRole("heading", { name: "Experience", exact: true }).boundingBox();
        expect(Math.abs(panel.width - panel.height)).toBeLessThan(1);
        expect(title.y + title.height).toBeLessThan(panel.y);
        await page.screenshot({ path: info.outputPath("ios-actual-career-folder.png") });
        await folder.getByRole("button", { name: "Close folder", exact: true }).tap();
        const closing = await folder.boundingBox();
        await page.waitForTimeout(65);
        const closingLater = await folder.boundingBox();
        expect(closingLater.width).toBeLessThan(closing.width);
        await expect(folder).toHaveCount(0);
      }
      for (const app of EXPERIENCE_APPS) {
        const content = await launchExperience(page, root, style, app);
        await expect(content.locator(".experience-identity strong")).toHaveText(app.name);
        const logo = content.locator(".experience-identity img");
        await expect.poll(() => logo.evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
        await expect(content.locator(".experience-responsibilities")).not.toBeEmpty();
        await expect(content).toHaveAttribute("data-experience-tab-active", "role");
        const originalLayout = await experienceLayout(content);
        if (app.id === 1) await page.screenshot({ path: info.outputPath(`${style}-actual-leviosa.png`) });
        await home(root, style);
        const recents = await openRecents(page, root, style);
        const card = recents.locator(`[data-recent-window-id="${app.appId}"]`);
        await expectFaithfulPreview(card.locator(".experience-app"), originalLayout);
        await touchSwipe(page, card.locator(".dos-recent-preview"), 0, -180);
        await expect(root.locator(`.dos-window[data-app-id="${app.appId}"]`)).toHaveCount(0);
        await home(root, style);
      }
      expect(errors).toEqual([]);
    });

    test("three actual app cards follow touch, dismiss upwards and resume the selected career tab", async ({ page }, info) => {
      test.setTimeout(60_000);
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      const root = await boot(page, style);
      await home(root, style);
      const leviosa = await launchExperience(page, root, style, EXPERIENCE_APPS[0]);
      await leviosa.locator('nav [data-experience-tab="projects"]').tap();
      await leviosa.locator('[data-experience-project="19"]').tap();
      await expect(leviosa.locator('[data-experience-case="19"] h2')).toHaveText("Yomates");
      const leviosaLayout = await experienceLayout(leviosa);
      if (style === "ios") {
        await touchSwipe(page, homeButton(root, style), 0, -140);
        await expect(leviosa).toBeHidden();
        await settle(root);
      } else await home(root, style);
      const yai = await launchExperience(page, root, style, EXPERIENCE_APPS[2]);
      const yaiLayout = await experienceLayout(yai);
      await home(root, style);
      let recents = await openRecents(page, root, style);
      await expect(recents.locator(".dos-recent-card")).toHaveCount(3);
      await expectFaithfulPreview(recents.locator('[data-recent-window-id="experience-leviosa"] .experience-app'), leviosaLayout);
      await expectFaithfulPreview(recents.locator('[data-recent-window-id="experience-yai"] .experience-app'), yaiLayout);
      await expect(recents.locator('[data-recent-window-id="experience-leviosa"] [data-experience-case="19"]')).toHaveCount(1);
      await page.screenshot({ path: info.outputPath(`${style}-actual-three-recents.png`) });
      const rail = recents.locator(".dos-recents-rail");
      const first = recents.locator(".dos-recent-card").first();
      const positions = await touchSwipe(page, first.locator(".dos-recent-preview"), -170, 0, first);
      expect(positions[0].x - positions[1].x).toBeGreaterThan(40);
      await expect.poll(() => rail.evaluate(element => element.scrollLeft)).toBeGreaterThan(90);
      await recents.getByRole("button", { name: "Leviosa-AI.app", exact: true }).tap();
      await expect(recents).toHaveCount(0);
      await expect(leviosa.locator('[data-experience-case="19"] h2')).toHaveText("Yomates");
      await expect(leviosa).toHaveAttribute("data-experience-tab-active", "projects");
      await home(root, style);
      recents = await openRecents(page, root, style);
      const dismissal = recents.locator('[data-recent-window-id="experience-leviosa"] .dos-recent-preview');
      const positionsUp = await touchSwipe(page, dismissal, 0, -180, dismissal);
      expect(positionsUp[0].y - positionsUp[1].y).toBeGreaterThan(40);
      await expect(root.locator('.dos-window[data-app-id="experience-leviosa"]')).toHaveCount(0);
      await expect(recents.locator(".dos-recent-card")).toHaveCount(2);
      await recents.getByRole("button", { name: "YAI.app", exact: true }).tap();
      await expect(root.locator('.experience-app[data-experience-app="3"]')).toBeVisible();
      expect(errors).toEqual([]);
    });

    test("320px home, folder and app fit the actual portfolio host", async ({ page }, info) => {
      await page.setViewportSize({ width: 320, height: 844 });
      const root = await boot(page, style);
      await home(root, style);
      expect(await root.locator(".dos-desktop").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(4);
      expect(await root.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      if (style === "ios") {
        const trigger = root.getByRole("button", { name: "Open Experience", exact: true });
        expect((await trigger.locator(".dos-folder-preview img").first().boundingBox()).width).toBeLessThanOrEqual(20);
      } else {
        await expect(root.locator(".dos-dock")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(root.locator(".dos-dock")).toHaveCSS("backdrop-filter", "none");
        await expect(root.locator(".dos-dock")).toHaveCSS("box-shadow", "none");
      }
      await page.screenshot({ path: info.outputPath(`${style}-actual-home-320.png`) });
      const content = await launchExperience(page, root, style, EXPERIENCE_APPS[0]);
      expect(await content.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await expect(content.getByRole("navigation", { name: "Experience sections", exact: true })).toBeInViewport({ ratio: 1 });
      await page.screenshot({ path: info.outputPath(`${style}-actual-app-320.png`) });
    });
  });
}
