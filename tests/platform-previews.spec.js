import { expect, test } from '@playwright/test';

test.use({ video: { mode: 'on', size: { width: 900, height: 900 } } });

for (const [device, portrait, landscape] of [
  ['macos', 'android', 'windows'],
  ['windows', 'ios', 'macos'],
  ['ios', 'android', 'windows'],
  ['android', 'ios', 'macos'],
]) {
  test(`${device} query preserves project selection across orientation`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/?device=${device}&ln=en&intro=0`);
    const root = page.locator('#app');
    await expect(root).toHaveAttribute('aria-busy', 'false');
    await expect(root).toHaveAttribute('data-ui-style', portrait);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect.poll(() => page.locator('.profile-mobile-portrait').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`${device}-portrait.png`), animations: 'disabled' });
    await page.getByRole('navigation', { name: 'Portfolio sections' }).locator('[data-sidebar-target="projects"]').click();
    const picker = page.getByRole('combobox', { name: 'Search projects', exact: true });
    await picker.fill('DindbOS');
    await page.getByRole('option').filter({ hasText: 'DindbOS' }).first().click();
    await expect(picker).toHaveValue(/DindbOS/);
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(root).toHaveAttribute('data-ui-style', landscape);
    await expect(picker).toHaveValue(/DindbOS/);
    await page.screenshot({ path: testInfo.outputPath(`${device}-landscape.png`), animations: 'disabled' });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(root).toHaveAttribute('data-ui-style', portrait);
    await expect(picker).toHaveValue(/DindbOS/);
  });
}
