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
  test.setTimeout(8000);
  await page.goto('/demo');
  await page.getByText('Make an encrypted backup').click();
  await page.getByLabel('Backup password').fill('a-long-demo-password');
  const download = page.waitForEvent('download', { timeout: 5000 });
  await page.getByRole('button', { name: 'Download encrypted backup' }).click({ timeout: 5000 });
  const stream = await (await download).createReadStream();
  const decoder = new TextDecoder(); let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  const data = JSON.parse(text + decoder.decode());
  expect(data).toMatchObject({ encrypted: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: 10000 });
  expect(data.data).not.toContain('Headache');
});

test('@claim:print-brief opens a chronology from the selected records', async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { briefHtml?: string }).open = () => ({ document: { write: (html: string) => { (window as Window & { briefHtml?: string }).briefHtml = html; }, close: () => undefined } }) as unknown as Window;
  });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Open printable brief' }).click();
  const html = await page.evaluate(() => (window as Window & { briefHtml?: string }).briefHtml);
  expect(html).toContain('Care Visit Brief');
  expect(html).toContain('Aug 23, 2026 · Severity 4/4');
});

test('@claim:paid-unlock provides the $12 checkout and license restore path', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy the $12 unlock' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/care-visit-brief/checkout');
  await expect(page.getByLabel('Have a license?')).toBeVisible();
});
