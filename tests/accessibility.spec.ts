import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

for (const path of ['/', '/log', '/?demo=1', '/demo', '/privacy', '/terms', '/missing-page']) {
  test(`accessible shell ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    if (path.includes('demo')) await expect(page.locator('.entry-card').first()).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(v => ['critical', 'serious'].includes(v.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('each SPA route exposes one skip link to the main landmark', async ({ page }) => {
  for (const path of ['/', '/log', '/?demo=1', '/demo', '/privacy', '/terms', '/missing-page']) {
    await page.goto(path);
    const skipLink = page.getByRole('link', { name: 'Skip to content' });
    await expect(skipLink).toHaveCount(1);
    await expect(skipLink).toHaveAttribute('href', '#main');
  }
});

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
  await expect(page.locator('.live')).toContainText('Your existing timeline was not changed.');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Start a private symptom timeline' })).toBeVisible();
  await expect(page.getByText('Existing record stays safe.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('removed health records can be undone', async ({ page }) => {
  await page.goto('/demo');
  const cards = page.locator('.entry-card');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  await cards.first().getByRole('button', { name: 'Remove note' }).click();
  await page.waitForTimeout(300);
  await expect(page.locator('.undo-toast')).toHaveCount(1);
  await page.locator('.undo-toast [data-action="undo-removal"]').click();
  await expect(cards).toHaveCount(before, { timeout: 1_000 });
  await expect(page.locator('.live')).toHaveText('Removed notes restored.');
});

test('repeated removals can all be undone', async ({ page }) => {
  await page.goto('/demo');
  const cards = page.locator('.entry-card');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();
  await cards.nth(0).getByRole('button', { name: 'Remove note' }).click();
  await page.locator('.entry-card').nth(0).getByRole('button', { name: 'Remove note' }).click();
  await expect(page.locator('.undo-toast')).toContainText('2 notes removed.');
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
  await expect(page.getByRole('heading', { name: 'We could not open this timeline' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download recovery copy' }).click();
  expect((await download).suggestedFilename()).toBe('care-visit-brief-recovery-copy.json');
  await page.getByLabel('Restore from a backup').setInputFiles({
    name: 'safe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ version: 1, exportedAt: '2026-08-28T12:00:00.000Z', entries: [] }))
  });
  await expect(page.getByRole('heading', { name: 'Start a private symptom timeline' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Review a filled sample timeline' })).toBeFocused();
  await expect(page.locator('.live')).toContainText('Opened Demo');
});

test('browser Back and Forward restore each route scroll position and heading focus', async ({ page }) => {
  const followRoute = async (href: string) => page.locator(`a[data-route][href="${href}"]`).first().evaluate((link: HTMLAnchorElement) => link.click());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Turn symptom notes into a visit brief' })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(890);

  await followRoute('/log');
  await expect(page.getByRole('heading', { name: 'Start a private symptom timeline' })).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, 320));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(310);

  await followRoute('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy for your visit notes' })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Start a private symptom timeline' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(310);

  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Turn symptom notes into a visit brief' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(890);

  await page.goForward();
  await expect(page.getByRole('heading', { name: 'Start a private symptom timeline' })).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(310);
});

test('route metadata follows deep links and browser history', async ({ page }) => {
  const expected = {
    '/': ['Care Visit Brief — Print a clear symptom timeline', 'https://care-visit-brief.sociobot.in/'],
    '/log': ['Symptom timeline — Care Visit Brief', 'https://care-visit-brief.sociobot.in/log'],
    '/?demo=1': ['Demo — Care Visit Brief', 'https://care-visit-brief.sociobot.in/?demo=1'],
    '/privacy': ['Privacy — Care Visit Brief', 'https://care-visit-brief.sociobot.in/privacy'],
    '/terms': ['Terms — Care Visit Brief', 'https://care-visit-brief.sociobot.in/terms']
  } as const;
  for (const [path, [title, canonical]] of Object.entries(expected)) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title);
    await expect(page.locator('meta[name="description"]')).not.toHaveAttribute('content', '');
  }
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await page.goBack();
  await expect(page).toHaveTitle(expected['/'][0]);
  await expect(page.getByRole('heading', { name: 'Turn symptom notes into a visit brief' })).toBeFocused();
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

test('static deployment rewrites only real SPA routes and serves a 404 page for unknown URLs', () => {
  const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as { navigationFallback?: unknown; routes: Array<{ route: string; rewrite?: string }>; responseOverrides: Record<string, { rewrite: string }> };
  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/log', '/demo', '/privacy', '/terms']) expect(config.routes).toContainEqual({ route, rewrite: '/index.html' });
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  const notFound = readFileSync('public/404.html', 'utf8');
  expect(notFound).toContain('<h1>We could not find this page</h1>');
  expect(notFound.match(/class="skip-link"/g)).toHaveLength(1);
});

test('reviewed copy names each action and error in plain words', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose the day’s severity' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leave days without notes blank' })).toBeVisible();
  await expect(page.locator('figcaption')).toHaveText('Record only details you may want to discuss with a clinician.');

  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'We could not find this page' })).toBeVisible();
  await expect(page.getByText('Return to your timeline or try the sample.')).toBeVisible();

  const readme = readFileSync('README.md', 'utf8');
  expect(readme).toContain('## Use Care Visit Brief');
  expect(readme).toContain('checks the price, security headers, page titles and URLs, the 404 page, and built-file hashes.');
  for (const vague of ['## Use it', 'response policy', 'route metadata', 'deployed asset identity']) expect(readme).not.toContain(vague);

  const catalogDescription = readFileSync('.factory/catalog-description.txt', 'utf8').trim();
  expect(catalogDescription).toBe('Turn daily symptom notes into a printable visit brief for a clinician.');
  expect(catalogDescription.length).toBeLessThanOrEqual(120);
});
