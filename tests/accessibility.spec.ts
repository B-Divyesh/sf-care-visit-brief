import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/log', '/demo', '/privacy', '/terms', '/missing-page']) {
  test(`accessible shell ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(v => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('keyboard can save a first note', async ({ page }) => {
  await page.goto('/log');
  await page.getByLabel('What changed? optional').fill('Felt tired after work.');
  await page.getByRole('button', { name: 'Save today’s note' }).press('Enter');
  await expect(page.getByText('Felt tired after work.')).toBeVisible();
});
