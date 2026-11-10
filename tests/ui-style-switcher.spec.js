import { enterPortfolio } from "./enter-portfolio.js";
import { expect, test } from '@playwright/test';

test.use({ video: { mode: 'on', size: { width: 1440, height: 900 } } });

async function systemMenu(page) {
  const menus = page.locator('.dos-windows-app-menus');
  if (await menus.count() && !(await menus.evaluate(element => element.open))) await menus.locator('summary').click();
  await page.locator('.dos-system-menu').click();
}

async function settings(page, mobile = false) {
  if (mobile) {
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await page.locator('.dos-desktop [data-desktop-app-id="settings"]').click();
    await page.locator('[data-settings-section-button="appearance"]').click();
  } else {
    await systemMenu(page);
    await page.getByRole('menuitem', { name: 'System Settings…', exact: true }).click();
  }
  await expect(page.getByRole('group', { name: 'Desktop UI', exact: true })).toBeVisible();
}

function choice(page, mode, name) {
  return page.getByRole('group', { name: `${mode} UI`, exact: true }).getByRole('button', { name, exact: true });
}

test('desktop menu and Settings preserve project state, independent choices and reload', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?device=windows&ln=en&intro=0');
  await enterPortfolio(page);
  const root = page.locator('#app');
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'macos');
  await page.locator('[data-sidebar-target="projects"]').click();
  const picker = page.getByRole('combobox', { name: 'Search projects', exact: true });
  await picker.fill('DindbOS');
  await page.getByRole('option').filter({ hasText: 'DindbOS' }).first().click();
  await systemMenu(page);
  await page.screenshot({ path: info.outputPath('desktop-menu-before.png') });
  await page.getByRole('menuitem', { name: 'Switch to Windows', exact: true }).click();
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeFocused();
  await expect(picker).toHaveValue(/DindbOS/);
  await settings(page);
  await choice(page, 'Desktop', 'macOS').click();
  await expect(root).toHaveAttribute('data-ui-style', 'macos');
  await choice(page, 'Desktop', 'Windows').focus();
  await page.keyboard.press('Enter');
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await expect(choice(page, 'Desktop', 'Windows')).toBeFocused();
  await expect(choice(page, 'Desktop', 'Windows')).toHaveAttribute('aria-pressed', 'true');
  await choice(page, 'Mobile', 'Samsung').click();
  await page.screenshot({ path: info.outputPath('desktop-settings.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-ui-style', 'android');
  await expect(picker).toHaveValue(/DindbOS/);
  await page.reload();
  await enterPortfolio(page);
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'android');
  await settings(page, true);
  await choice(page, 'Mobile', 'Automatic').click();
  await expect(root).toHaveAttribute('data-ui-style', 'ios');
  await choice(page, 'Desktop', 'Automatic').click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(root).toHaveAttribute('data-ui-style', 'macos');
});

test('mobile menu and Settings switch both ways, retain landscape choice and fit 320px', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?device=android&ln=en&intro=0');
  await enterPortfolio(page);
  const root = page.locator('#app');
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'ios');
  await systemMenu(page);
  await page.getByRole('menuitem', { name: 'Switch to Samsung', exact: true }).click();
  await expect(root).toHaveAttribute('data-ui-style', 'android');
  await settings(page, true);
  await choice(page, 'Mobile', 'iOS').click();
  await expect(root).toHaveAttribute('data-ui-style', 'ios');
  await expect(choice(page, 'Mobile', 'iOS')).toBeFocused();
  await choice(page, 'Mobile', 'Samsung').click();
  await expect(root).toHaveAttribute('data-ui-style', 'android');
  await page.setViewportSize({ width: 320, height: 844 });
  await expect(choice(page, 'Mobile', 'Samsung')).toBeInViewport();
  const heading = page.locator('.settings-detail-header h2');
  await expect(heading).toBeInViewport({ ratio: 1 });
  expect(await heading.evaluate(element => element.getBoundingClientRect().right <= element.closest('.dindbos-host').getBoundingClientRect().right)).toBe(true);
  expect(await page.locator('.ui-style-settings').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThan(2);
  await page.screenshot({ path: info.outputPath('mobile-settings.png') });
  await page.locator('[data-appearance-mode="dark"]').click();
  await expect(root).toHaveAttribute('data-appearance', 'dark');
  await expect(choice(page, 'Mobile', 'Samsung')).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({ path: info.outputPath('mobile-settings-dark.png') });
  await choice(page, 'Desktop', 'Windows').click();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await page.reload();
  await enterPortfolio(page);
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(root).toHaveAttribute('data-ui-style', 'android');
  await settings(page, true);
  await choice(page, 'Mobile', 'Automatic').click();
  await expect(root).toHaveAttribute('data-ui-style', 'ios');
});

test('invalid saved preferences and denied storage retain a working automatic desktop', async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'dindbos:vfs:dindbos-portfolio-runtime:ui-style';
    localStorage.setItem(key, '{"desktop":"ios"}');
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Storage denied', 'SecurityError');
      return set.call(this, name, value);
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?device=windows&ln=en&intro=0');
  await enterPortfolio(page);
  const root = page.locator('#app');
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'macos');
  await systemMenu(page);
  await page.getByRole('menuitem', { name: 'Switch to Windows', exact: true }).click();
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await settings(page);
  await expect(choice(page, 'Desktop', 'Windows')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-ui-preference-status]')).toContainText('Browser storage could not save');
  expect(await page.evaluate(() => localStorage.getItem('dindbos:vfs:dindbos-portfolio-runtime:ui-style'))).toBe('{"desktop":"ios"}');
});

test('failed Automatic reset reports session-only state before reload restores saved choice', async ({ page }) => {
  await page.addInitScript(() => {
    const key = 'dindbos:vfs:dindbos-portfolio-runtime:ui-style';
    localStorage.setItem(key, '{"desktop":"windows"}');
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Storage denied', 'SecurityError');
      return set.call(this, name, value);
    };
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?device=windows&ln=en&intro=0');
  await enterPortfolio(page);
  const root = page.locator('#app');
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
  await settings(page);
  await choice(page, 'Desktop', 'Automatic').click();
  await expect(root).toHaveAttribute('data-ui-style', 'macos');
  await expect(choice(page, 'Desktop', 'Automatic')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-ui-preference-status]')).toContainText('reloading may restore the previous choice');
  expect(await page.evaluate(() => localStorage.getItem('dindbos:vfs:dindbos-portfolio-runtime:ui-style'))).toBe('{"desktop":"windows"}');
  await page.reload();
  await enterPortfolio(page);
  await expect(root).toHaveAttribute('aria-busy', 'false');
  await expect(root).toHaveAttribute('data-ui-style', 'windows');
});

test('Settings controls survive storage rerenders and close/reopen cleanup', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?device=windows&ln=en&intro=0');
  await enterPortfolio(page);
  await expect(page.locator('#app')).toHaveAttribute('aria-busy', 'false');
  await settings(page);
  await choice(page, 'Desktop', 'Windows').click();
  await page.locator('[data-settings-section-button="storage"]').click();
  await page.getByRole('button', { name: 'Flush now', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Flush now', exact: true })).toBeEnabled();
  await page.locator('[data-settings-section-button="appearance"]').click();
  await expect(choice(page, 'Desktop', 'Windows')).toHaveAttribute('aria-pressed', 'true');
  await choice(page, 'Desktop', 'macOS').click();
  await expect(page.locator('#app')).toHaveAttribute('data-ui-style', 'macos');
  await page.locator('.dos-window[data-app-id="settings"]').getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.locator('.dos-window[data-app-id="settings"]')).toHaveCount(0);
  await settings(page);
  await choice(page, 'Desktop', 'Windows').click();
  await expect(page.locator('#app')).toHaveAttribute('data-ui-style', 'windows');
  await expect(choice(page, 'Desktop', 'Windows')).toBeFocused();
});
