import { chromium, expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const fixture = JSON.parse(readFileSync('tests/fixtures/billing-product.json', 'utf8')) as {
  slug: string; price_minor: number; currency: string; purchase_model: string; checkout_url: string; merchant_of_record: string[];
};

async function downloadText(page: import('@playwright/test').Page, button: string) {
  const pending = page.waitForEvent('download', { timeout: 10_000 });
  await page.getByRole('button', { name: button }).click();
  const file = await pending;
  const stream = await file.createReadStream();
  const decoder = new TextDecoder(); let text = '';
  for await (const chunk of stream as AsyncIterable<Uint8Array>) text += decoder.decode(chunk, { stream: true });
  return { file, text: text + decoder.decode() };
}

test('@claim:csv-export exports one CSV row for every sample note', async ({ page }) => {
  await page.goto('/?demo=1');
  const { text } = await downloadText(page, 'Export CSV');
  expect(text.split('\n')).toHaveLength(6);
  expect(text).toContain('"Date","Severity"');
  expect(text).toContain('2026-08-05');
});

test('@claim:offline-reload opens the demo offline after the first online visit', async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto('http://localhost:4173/?demo=1');
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
    const session = await context.newCDPSession(page);
    await session.send('Network.clearBrowserCache');
    await page.close();
    await context.setOffline(true);
    const reopened = await context.newPage();
    await reopened.goto('http://localhost:4173/?demo=1');
    await expect(reopened.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(reopened.getByText('Worse than usual after two poor nights.').first()).toBeVisible();
  } finally {
    await context.setOffline(false);
    await browser.close();
  }
});

test('@claim:device-only keeps health data on the current origin with no analytics requests', async ({ page }) => {
  const urls: string[] = [];
  page.on('request', request => urls.push(request.url()));
  await page.goto('/?demo=1');
  await page.getByLabel('What changed? optional').fill('Private observation for the request audit.');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await downloadText(page, 'Export backup');
  expect(urls.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
  expect(urls.some(url => /analytics|telemetry|segment|google-analytics/i.test(url))).toBeFalsy();
});

test('@claim:encrypted-backup creates 600000-iteration backups and restores 10000-iteration legacy backups', async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto('/?demo=1');
  await page.getByText('Make an encrypted backup').click();
  await page.getByLabel('Backup password').fill('a-long-demo-password');
  const { file, text } = await downloadText(page, 'Download encrypted backup');
  const data = JSON.parse(text);
  expect(data).toMatchObject({ encrypted: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: 600000 });
  expect(data.data).not.toContain('Headache');
  await page.locator('.entry-card').first().getByRole('button', { name: 'Remove note' }).click();
  await page.getByLabel('Password for an encrypted backup').fill('a-long-demo-password');
  await page.locator('#import-file').setInputFiles(await file.path());
  await expect(page.getByText('Aug 23, 2026')).toBeVisible();
  const legacy = await page.evaluate(async () => {
    const password = 'a-long-demo-password'; const salt = crypto.getRandomValues(new Uint8Array(16)); const iv = crypto.getRandomValues(new Uint8Array(12));
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

test('@claim:print-brief prints the five saved sample notes on one A4 page and excludes other text', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByLabel('Date').fill('2026-08-01');
  await page.getByLabel('What changed? optional').fill('OUTSIDE RANGE NOTE');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.locator('.entry-card').filter({ hasText: 'OUTSIDE RANGE NOTE' })).toBeVisible();
  await page.getByLabel('What changed? optional').fill('UNSAVED FORM TEXT');
  await page.locator('#brief-from').fill('2026-08-05');
  await page.locator('#brief-to').fill('2026-08-23');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  const brief = await popup;
  await expect(brief.getByRole('heading', { name: 'Care Visit Brief' })).toBeVisible();
  await expect(brief.getByText('Worse than usual after two poor nights.')).toBeVisible();
  await expect(brief.getByText('OUTSIDE RANGE NOTE')).toHaveCount(0);
  await expect(brief.getByText('UNSAVED FORM TEXT')).toHaveCount(0);
  const pdf = await brief.pdf({ format: 'A4', printBackground: true });
  expect((Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [])).toHaveLength(1);
  await brief.close();
  for (const date of ['2026-08-24', '2026-08-25', '2026-08-26']) {
    await page.getByLabel('Date').fill(date);
    await page.getByLabel('What changed? optional').fill(`Extra saved note on ${date}.`);
    await page.getByRole('button', { name: 'Save today’s note' }).click();
  }
  await page.locator('#brief-from').fill('2026-08-01');
  await page.locator('#brief-to').fill('2026-08-28');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  await expect(page.locator('.live')).toContainText('need more than one page');
});

test('@claim:json-backup exports a versioned record with every sample note', async ({ page }) => {
  await page.goto('/?demo=1');
  const { text } = await downloadText(page, 'Export backup');
  const data = JSON.parse(text);
  expect(data.version).toBe(1);
  expect(data.entries).toHaveLength(5);
  expect(data.entries.map((entry: { date: string }) => entry.date)).toContain('2026-08-23');
});

test('@claim:demo-first-screen shows a filled separate sample in the initial mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start my private timeline' })).toBeVisible();
  const sample = page.getByText('Worse than usual after two poor nights.').first();
  await expect(sample).toBeVisible();
  const box = await sample.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await expect(page.locator('.entry-card')).toHaveCount(5);
});

test('@claim:daily-note-fields saves and reloads severity, tags, medicine changes, and note text', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByLabel('Date').fill('2026-08-28');
  await page.getByRole('button', { name: /3\s*Hard/ }).click();
  await page.getByRole('button', { name: 'Nausea' }).click();
  await page.getByRole('button', { name: 'Stress' }).click();
  await page.getByRole('button', { name: 'New dose' }).click();
  await page.getByLabel('What changed? optional').fill('Symptoms eased after dinner.');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.locator('.entry-card').filter({ hasText: 'Symptoms eased after dinner.' })).toBeVisible();
  await page.reload();
  const card = page.locator('.entry-card').filter({ hasText: 'Symptoms eased after dinner.' });
  await expect(card).toContainText('Severity 3/4');
  await expect(card).toContainText('Nausea');
  await expect(card).toContainText('Stress');
  await expect(card).toContainText('New dose');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  const brief = await popup;
  await expect(brief.getByText('Symptoms eased after dinner.')).toBeVisible();
  await brief.close();
});

test('@claim:blank-days leaves dates without notes blank and shows no missed-day warning', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('.entry-card')).toHaveCount(5);
  for (const date of ['2026-08-25', '2026-08-28']) {
    await page.getByLabel('Date').fill(date);
    await page.getByLabel('What changed? optional').fill(`Saved only on ${date}.`);
    await page.getByRole('button', { name: 'Save today’s note' }).click();
  }
  await expect(page.locator('.entry-card')).toHaveCount(7);
  await expect(page.getByText('Days without a note stay blank.')).toBeVisible();
  await expect(page.getByText(/missed-day warning/i)).toHaveCount(0);
  await expect(page.locator('time[datetime="2026-08-26"]')).toHaveCount(0);
  await expect(page.locator('time[datetime="2026-08-27"]')).toHaveCount(0);
});

test('@claim:safety-boundary never generates diagnosis, interpretation, recommendations, or clinician requests', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/?demo=1');
  await expect(page.getByText('This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician.')).toBeVisible();
  const exact = 'Headache after bright light; no conclusion requested.';
  await page.getByLabel('What changed? optional').fill(exact);
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.locator('.entry-card').filter({ hasText: exact })).toBeVisible();
  await downloadText(page, 'Export backup');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  const brief = await popup; await expect(brief.getByText(exact)).toBeVisible(); await brief.close();
  expect(requests.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBeTruthy();
});

test('@claim:free-core keeps saving, restore, exports, print, and safety information free', async ({ page }) => {
  test.setTimeout(30_000);
  await page.goto('/log');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:care-visit-brief'))).toBeNull();
  await page.getByLabel('What changed? optional').fill('Free timeline note.');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.getByText('This timeline does not diagnose, interpret symptoms, recommend treatment, or contact a clinician.')).toBeVisible();
  await downloadText(page, 'Export CSV');
  const backup = await downloadText(page, 'Export backup');
  await page.getByText('Make an encrypted backup').click();
  await page.getByLabel('Backup password').fill('free-feature-password');
  await downloadText(page, 'Download encrypted backup');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  await (await popup).close();
  await page.locator('.entry-card').getByRole('button', { name: 'Remove note' }).click();
  await page.locator('#import-file').setInputFiles(await backup.file.path());
  await expect(page.getByText('Free timeline note.')).toBeVisible();
  await expect(page.getByLabel(/Personal cover note/)).toHaveCount(0);
});

test('@claim:demo-isolation resets and discards demo data without changing the real timeline', async ({ page }) => {
  await page.goto('/log');
  await page.getByLabel('What changed? optional').fill('REAL NOTE MUST REMAIN');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.getByText('REAL NOTE MUST REMAIN')).toBeVisible();
  await page.goto('/?demo=1');
  await page.getByLabel('What changed? optional').fill('DEMO-ONLY NOTE');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.locator('.entry-card').filter({ hasText: 'DEMO-ONLY NOTE' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.live')).toHaveText('Demo reset.');
  await expect(page.locator('.entry-card')).toHaveCount(5);
  await expect(page.getByText('DEMO-ONLY NOTE')).toHaveCount(0);
  // Reset replaces only the sample namespace. Check the real record before
  // leaving demo mode, so a later render cannot hide an accidental mutation.
  expect(await page.evaluate(async () => {
    const request = indexedDB.open('care-visit-brief', 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const stored = db.transaction('entries').objectStore('entries').get('real:entries');
    return await new Promise<string[]>((resolve, reject) => { stored.onsuccess = () => resolve((stored.result as Array<{ note: string }>).map(entry => entry.note)); stored.onerror = () => reject(stored.error); });
  })).toEqual(['REAL NOTE MUST REMAIN']);
  await page.getByRole('button', { name: 'Start my private timeline' }).click();
  await expect(page).toHaveURL(/\/log$/);
  await expect(page.getByText('REAL NOTE MUST REMAIN')).toBeVisible();
  expect(await page.evaluate(async () => {
    const request = indexedDB.open('care-visit-brief', 1); const db = await new Promise<IDBDatabase>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const tx = db.transaction('entries'); const stored = tx.objectStore('entries').get('demo:entries');
    return await new Promise<unknown>((resolve, reject) => { stored.onsuccess = () => resolve(stored.result); stored.onerror = () => reject(stored.error); });
  })).toBeUndefined();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('demo:')))).toEqual([]);
});

test('@claim:paid-unlock shows the recorded USD 12 one-time offer and prints a verified cover note', async ({ page }) => {
  expect(fixture).toMatchObject({ slug: 'care-visit-brief', price_minor: 1200, currency: 'USD', purchase_model: 'one_time' });
  await page.goto('/');
  await expect(page.getByText('Pay $12 USD once to add a personal cover note.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy the $12 unlock' })).toHaveAttribute('href', fixture.checkout_url);
  await page.route('**/verify?license=paid-fixture', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }));
  await page.goto('/?demo=1&license=paid-fixture');
  await expect(page).toHaveURL(/\?demo=1$/);
  await page.getByLabel(/Personal cover note/).fill('Ask about the evening flare.');
  const popup = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Open one-page visit brief' }).click();
  const brief = await popup; await expect(brief.getByText('Ask about the evening flare.')).toBeVisible(); await brief.close();
});

test('@claim:license-data-boundary sends only the entered license token to Sociobot', async ({ page }) => {
  let captured: { url: string; method: string; body: string | null } | undefined;
  await page.route('https://api.sociobot.in/**', async route => {
    const request = route.request(); captured = { url: request.url(), method: request.method(), body: request.postData() };
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/log');
  await page.getByLabel('What changed? optional').fill('PRIVATE HEALTH NOTE');
  await page.getByRole('button', { name: 'Save today’s note' }).click();
  await expect(page.getByText('PRIVATE HEALTH NOTE')).toBeVisible();
  await page.getByLabel('Have a license?').fill('token-only-fixture');
  await page.getByRole('button', { name: 'Restore my unlock' }).click();
  await expect(page.locator('#license-status')).toHaveText('License active.');
  expect(captured).toBeDefined();
  const url = new URL(captured!.url);
  expect(`${url.origin}${url.pathname}`).toBe('https://api.sociobot.in/api/v1/products/care-visit-brief/verify');
  expect([...url.searchParams.entries()]).toEqual([['license', 'token-only-fixture']]);
  expect(captured!.method).toBe('GET'); expect(captured!.body).toBeNull();
  expect(captured!.url).not.toContain('PRIVATE');
});

test('@claim:license-restore restores a cover-note unlock in a clean second context without copying notes', async ({ browser }) => {
  for (let device = 1; device <= 2; device += 1) {
    const context = await browser.newContext();
    await context.route('**/verify?license=portable-fixture', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }));
    const page = await context.newPage();
    await page.goto('/log');
    if (device === 1) {
      await page.getByLabel('What changed? optional').fill('Only on device one.');
      await page.getByRole('button', { name: 'Save today’s note' }).click();
      await expect(page.locator('.entry-card').filter({ hasText: 'Only on device one.' })).toBeVisible();
    }
    await page.getByLabel('Have a license?').fill('portable-fixture');
    await page.getByRole('button', { name: 'Restore my unlock' }).click();
    await expect(page.getByLabel(/Personal cover note/)).toBeVisible();
    if (device === 2) await expect(page.getByText('Only on device one.')).toHaveCount(0);
    await context.close();
  }
});

test('@claim:billing-policy shows the merchant policy and locks a fixture-refunded license', async ({ page }) => {
  expect(fixture.merchant_of_record).toEqual(['Sociobot', 'Dodo']);
  await page.goto('/terms');
  await expect(page.getByText('Sociobot and Dodo are the merchant of record.')).toBeVisible();
  await expect(page.getByText('A refund revokes the related license.')).toBeVisible();
  let active = true;
  await page.route('**/verify?license=refunded-fixture', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify(active ? { valid: true, reason: 'ok', expires_at: null } : { valid: false, reason: 'revoked', expires_at: null }) }));
  await page.goto('/log');
  await page.getByLabel('Have a license?').fill('refunded-fixture'); await page.getByRole('button', { name: 'Restore my unlock' }).click();
  await expect(page.getByLabel(/Personal cover note/)).toBeVisible();
  active = false;
  await page.getByLabel('Have a license?').fill('refunded-fixture'); await page.getByRole('button', { name: 'Restore my unlock' }).click();
  await expect(page.getByLabel(/Personal cover note/)).toHaveCount(0);
  await expect(page.locator('#license-status')).toContainText('no longer active');
});

test('@claim:build-output produces dist/index.html', () => {
  expect(existsSync('dist')).toBeTruthy();
  expect(existsSync('dist/index.html')).toBeTruthy();
});

test('@claim:deployment-config defines app rewrites, immutable assets, security headers, and a complete 404', () => {
  const config = JSON.parse(readFileSync('dist/staticwebapp.config.json', 'utf8')) as { navigationFallback?: unknown; routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>; globalHeaders: Record<string, string>; responseOverrides: Record<string, { rewrite: string }> };
  expect(config.navigationFallback).toBeUndefined();
  for (const route of ['/log', '/demo', '/privacy', '/terms']) expect(config.routes).toContainEqual({ route, rewrite: '/index.html' });
  expect(config.routes.find(item => item.route === '/assets/*')?.headers?.['Cache-Control']).toContain('immutable');
  expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
  expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  const notFound = readFileSync('dist/404.html', 'utf8');
  for (const required of ['<header class="site-header">', '<footer>', 'rel="canonical"', 'property="og:title"', 'rel="icon"', 'href="/privacy"', 'href="/terms"']) expect(notFound).toContain(required);
  expect(notFound).toContain('<h1>We could not find this page</h1>');
});

test('@claim:live-deployment verifies the price, security headers, page titles and URLs, 404, and built-file hashes', () => {
  test.skip(process.env.LIVE_CLAIM !== '1', 'Run after deployment with LIVE_CLAIM=1.');
  execFileSync(process.execPath, ['scripts/verify-live.mjs'], { stdio: 'inherit' });
});

test('a late demo license response cannot recreate discarded demo state', async ({ page }) => {
  let fulfill: ((response: { contentType: string; body: string }) => Promise<void>) | undefined;
  await page.route('**/verify?license=slow-demo-license', route => new Promise<void>(resolve => { fulfill = async response => { await route.fulfill(response); resolve(); }; }));
  await page.goto('/?demo=1&license=slow-demo-license');
  await expect.poll(() => fulfill).toBeDefined();
  await page.getByRole('button', { name: 'Start my private timeline' }).click();
  await fulfill!({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('demo:')))).toEqual([]);
});
