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

test('invalid restore leaves the existing record intact after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/log');
  await page.getByLabel('What changed? optional').fill('Existing record stays safe.');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.getByText('Existing record stays safe.')).toBeVisible();
  await page.locator('#import-file').setInputFiles({
    name: 'malformed-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1,"entries":[{}]}')
  });
  await expect(page.getByText('This file is not a complete Care Visit Brief JSON backup. Your existing record was not changed. Choose another file.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Record a clear history' })).toBeVisible();
  await expect(page.getByText('Existing record stays safe.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('removed health records can be undone', async ({ page }) => {
  await page.goto('/demo');
  const cards = page.locator('.entry-card');
  const before = await cards.count();
  await cards.first().getByRole('button', { name: 'Remove entry' }).click();
  await page.waitForTimeout(300);
  await expect(page.locator('.undo-toast')).toHaveCount(1);
  await page.locator('.undo-toast [data-action="undo-removal"]').click();
  await expect(cards).toHaveCount(before, { timeout: 1_000 });
  await expect(page.locator('.live')).toHaveText('Entry restored.');
});

test('390px navigation and tag buttons meet the 44px touch target', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/log');
  for (const locator of [page.locator('nav a'), page.locator('.tag')]) {
    const boxes = await locator.evaluateAll(elements => elements.map(element => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('generated service worker versions and precaches executing assets', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  const worker = await page.evaluate(async () => {
    const source = await fetch('/sw.js').then(response => response.text());
    const cacheNames = await caches.keys();
    const cache = await caches.open(cacheNames.find(name => name.startsWith('care-visit-brief-'))!);
    const requests = await cache.keys();
    return { source, paths: requests.map(request => new URL(request.url).pathname) };
  });
  expect(worker.source).toMatch(/care-visit-brief-[a-f0-9]{12}/);
  expect(worker.source).toContain("event.data.type === 'SKIP_WAITING'");
  expect(worker.paths.some(path => /\/assets\/[^/]+\.js$/.test(path))).toBeTruthy();
  expect(worker.paths.some(path => /\/assets\/[^/]+\.css$/.test(path))).toBeTruthy();
});
