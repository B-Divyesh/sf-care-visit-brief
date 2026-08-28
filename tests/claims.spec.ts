import { chromium, expect, test } from '@playwright/test';

test('@claim:csv-export exports one CSV row for every sample record', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download', { timeout: 5000 });
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  const stream = await file.createReadStream();
  const decoder = new TextDecoder();
  let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  text += decoder.decode();
  expect(text.split('\n')).toHaveLength(6);
  expect(text).toContain('"Date","Severity"');
  expect(text).toContain('2026-08-05');
});

test('@claim:offline-reload opens the demo offline after the first online visit', async () => {
  // A separate loopback origin keeps this first-visit check independent from
  // other service-worker tests. A dedicated browser profile is a real fresh
  // first visit, rather than only a fresh tab.
  const browser = await chromium.launch();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto('http://localhost:4173/demo');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    await expect.poll(() => page.evaluate(async () => {
      const assets = [...document.querySelectorAll<HTMLScriptElement | HTMLLinkElement>('script[src],link[rel="stylesheet"]')]
        .map(element => new URL(element instanceof HTMLScriptElement ? element.src : element.href).pathname);
      const cacheNames = await caches.keys();
      const cache = await caches.open(cacheNames.find(name => name.startsWith('care-visit-brief-'))!);
      const paths = (await cache.keys()).map(request => new URL(request.url).pathname);
      return paths.includes('/index.html') && assets.every(asset => paths.includes(asset));
    })).toBeTruthy();
    // Remove HTTP-cache assistance, close the warmed document, and navigate in
    // a fresh tab. Passing now proves the service worker's canonical shell
    // fallback and its precached executable assets, not an in-memory page.
    const session = await context.newCDPSession(page);
    await session.send('Network.clearBrowserCache');
    await page.close();
    await context.setOffline(true);
    const reopened = await context.newPage();
    await reopened.goto('http://localhost:4173/demo');
    await expect(reopened.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(reopened.getByText('Aug 23, 2026')).toBeVisible();
  } finally {
    await context.setOffline(false);
    await browser.close();
  }
});

test('@claim:device-only demo makes no cross-origin network requests', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', request => urls.push(request.url()));
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  await download;
  expect(urls.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('@claim:encrypted-backup downloads an AES-GCM protected backup', async ({ page }) => {
  test.setTimeout(20_000);
  await page.goto('/demo');
  await page.getByText('Make an encrypted backup').click();
  await page.getByLabel('Backup password').fill('a-long-demo-password');
  const download = page.waitForEvent('download', { timeout: 5000 });
  await page.getByRole('button', { name: 'Download encrypted backup' }).click({ timeout: 5000 });
  const file = await download;
  const stream = await file.createReadStream();
  const decoder = new TextDecoder(); let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  const data = JSON.parse(text + decoder.decode());
  expect(data).toMatchObject({ encrypted: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: 600000 });
  expect(data.data).not.toContain('Headache');
  await page.locator('.entry-card').first().getByRole('button', { name: 'Remove entry' }).click();
  await expect(page.locator('.undo-toast')).toBeVisible();
  await page.getByLabel('Password for an encrypted backup').fill('a-long-demo-password');
  await page.locator('#import-file').setInputFiles(await file.path());
  await expect(page.getByText('Aug 23, 2026')).toBeVisible();
  await expect(page.locator('.live')).toHaveText('Backup restored.');
  // A person upgrading from the previous release must still be able to open
  // its 10,000-iteration backup before replacing it with a stronger copy.
  const legacy = await page.evaluate(async () => {
    const password = 'a-long-demo-password';
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 10_000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const plain = JSON.stringify({ version: 1, exportedAt: '2026-08-28T12:00:00.000Z', entries: [] });
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain));
    const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value));
    return { version: 1, encrypted: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: 10_000, salt: encode(salt), iv: encode(iv), data: encode(new Uint8Array(encrypted)) };
  });
  await page.getByLabel('Password for an encrypted backup').fill('a-long-demo-password');
  await page.locator('#import-file').setInputFiles({ name: 'legacy-encrypted.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)) });
  await expect(page.locator('.live')).toHaveText('Backup restored.');
});

test('@claim:print-brief opens a chronology from the selected records', async ({ page }) => {
  await page.goto('/demo');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open printable brief' }).click();
  const brief = await popup;
  await expect(brief.getByRole('heading', { name: 'Care Visit Brief' })).toBeVisible();
  await expect(brief.getByRole('heading', { name: 'Aug 23, 2026 · Severity 4/4' })).toBeVisible();
  await expect(brief.getByRole('button', { name: 'Print this brief' })).toBeVisible();
  await brief.close();
});

test('@claim:json-backup exports a versioned record with every sample entry', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const stream = await (await download).createReadStream();
  const decoder = new TextDecoder(); let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  const data = JSON.parse(text + decoder.decode());
  expect(data.version).toBe(1);
  expect(data.entries).toHaveLength(5);
  expect(data.entries.map((entry: { date: string }) => entry.date)).toContain('2026-08-23');
});

test('@claim:paid-unlock restores a verified purchase and includes its cover note in a printed brief', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/care-visit-brief/verify?license=demo-license', async route => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/log?license=demo-license');
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.locator('#license-status')).toHaveText('License active.');
  await expect(page.getByLabel(/Personal cover note/)).toBeVisible();
  await page.getByLabel('What changed? optional').fill('A real note for the brief.');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.getByText('A real note for the brief.')).toBeVisible();
  await page.getByLabel(/Personal cover note/).fill('Ask about the evening flare.');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open printable brief' }).click();
  const brief = await popup;
  await expect(brief.getByText('Ask about the evening flare.')).toBeVisible();
  await brief.close();
});
