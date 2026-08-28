import { expect, test } from '@playwright/test';

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

test('@claim:offline-reload reloads the demo after a first online visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByText('Aug 23, 2026')).toBeVisible();
  await context.setOffline(false);
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
