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
  await expect(page.locator('.live')).toContainText('Your existing record was not changed.');
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
  await expect(page.locator('.live')).toHaveText('Removed entries restored.');
});

test('repeated removals can all be undone', async ({ page }) => {
  await page.goto('/demo');
  const cards = page.locator('.entry-card');
  const before = await cards.count();
  await cards.nth(0).getByRole('button', { name: 'Remove entry' }).click();
  await page.locator('.entry-card').nth(0).getByRole('button', { name: 'Remove entry' }).click();
  await expect(page.locator('.undo-toast')).toContainText('2 entries removed.');
  await page.getByRole('button', { name: 'Undo removals' }).click();
  await expect(cards).toHaveCount(before);
});

test('two tabs merge health notes instead of replacing a stale record', async ({ browser }) => {
  const context = await browser.newContext();
  const first = await context.newPage();
  const second = await context.newPage();
  try {
    await Promise.all([first.goto('/log'), second.goto('/log')]);
    await first.getByLabel('What changed? optional').fill('Saved in tab A');
    await second.getByLabel('What changed? optional').fill('Saved in tab B');
    await Promise.all([
      first.getByRole('button', { name: 'Save today’s note' }).click(),
      second.getByRole('button', { name: 'Save today’s note' }).click()
    ]);
    // Click resolves before the asynchronous IndexedDB transaction finishes.
    // Wait for the cross-tab merge before testing persistence on a reload.
    await expect(first.getByText('Saved in tab A')).toBeVisible();
    await expect(first.getByText('Saved in tab B')).toBeVisible();
    await first.reload();
    await expect(first.getByText('Saved in tab A')).toBeVisible();
    await expect(first.getByText('Saved in tab B')).toBeVisible();
  } finally { await context.close(); }
});

test('corrupt stored records can be exported, restored, or removed in place', async ({ page }) => {
  await page.goto('/log');
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('care-visit-brief', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('entries', 'readwrite');
      tx.objectStore('entries').put([{}], 'real:entries');
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
    });
  });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'We could not open this record' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recovery copy' }).click();
  expect((await download).suggestedFilename()).toBe('care-visit-brief-recovery-copy.json');
  await page.getByLabel('Restore from a backup').setInputFiles({
    name: 'safe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, exportedAt: '2026-08-28T12:00:00.000Z', entries: [] }))
  });
  await expect(page.getByRole('heading', { name: 'Record a clear history' })).toBeVisible();
});

test('390px controls meet the 44px touch target and do not cause horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/log');
  await page.getByLabel('Add a symptoms tag').fill('abcdefghijklmnopqrstuvwxyzabcdef');
  await page.getByLabel('Add a symptoms tag').press('Enter');
  for (const locator of [page.locator('nav a'), page.locator('.wordmark'), page.locator('.tag'), page.locator('input[type=file]'), page.locator('.restore-password input'), page.locator('footer a'), page.locator('.license input')]) {
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
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('future dates and CSV formulas are made safe', async ({ page }) => {
  await page.goto('/log');
  // The native max constraint stops an accidental future date before submit.
  await expect(page.getByLabel('Date')).toHaveAttribute('max', '2026-08-28');
  // Exercise the app-level guard too, in case an integration strips that
  // native constraint or submits the form programmatically.
  await page.getByLabel('Date').evaluate((input: HTMLInputElement) => input.removeAttribute('max'));
  await page.getByLabel('Date').fill('9999-12-31');
  await page.getByLabel('What changed? optional').fill('=HYPERLINK("https://example.invalid")');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.locator('.live')).toContainText('Choose today or an earlier date');
  await page.getByLabel('Date').fill('2026-08-28');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const stream = await (await download).createReadStream(); const decoder = new TextDecoder(); let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  expect(text + decoder.decode()).toContain("'=HYPERLINK");
});

test('SPA navigation focuses and announces the new route heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByRole('heading', { name: 'Review a sample visit history' })).toBeFocused();
  await expect(page.locator('.live')).toContainText('Opened Demo');
});

test('a waiting service-worker update remains available after SPA navigation', async ({ page }) => {
  await page.goto('/log');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register(`/sw.js?update-test=${Date.now()}`, { scope: '/' });
    await new Promise<void>(resolve => {
      if (registration.waiting) { resolve(); return; }
      registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => {
        if (registration.waiting) resolve();
      }));
    });
  });
  await expect(page.locator('.update-toast')).toBeVisible();
  await page.getByLabel('Primary').getByRole('link', { name: 'Privacy' }).click();
  await expect(page.locator('.update-toast')).toBeVisible();
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
  expect(worker.source).toContain("const NAVIGATION_FALLBACK = '/index.html'");
  expect(worker.paths).toContain('/index.html');
  expect(worker.paths.some(path => /\/assets\/[^/]+\.js$/.test(path))).toBeTruthy();
  expect(worker.paths.some(path => /\/assets\/[^/]+\.css$/.test(path))).toBeTruthy();
});
