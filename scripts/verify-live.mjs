import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const origin = process.env.LIVE_URL || 'https://care-visit-brief.sociobot.in';
const checkout = 'https://api.sociobot.in/api/v1/products/care-visit-brief/checkout';
const verify = 'https://api.sociobot.in/api/v1/products/care-visit-brief/verify?license=release-check-invalid';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const home = await fetch(`${origin}/`);
assert(home.status === 200, `home returned HTTP ${home.status}`);
assert(home.headers.get('content-security-policy')?.includes("default-src 'self'"), 'home is missing its content security policy');
assert(home.headers.get('x-content-type-options') === 'nosniff', 'home is missing X-Content-Type-Options: nosniff');
assert(home.headers.get('referrer-policy') === 'strict-origin-when-cross-origin', 'home has the wrong Referrer-Policy');
assert(home.headers.get('strict-transport-security') !== null, 'home is missing Strict-Transport-Security');
const html = await home.text();
assert(html.includes('<div id="app"></div>'), 'live home is not the built app shell');

const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?]+\.(?:js|css))"/g)].map(match => match[1]);
assert(assets.length === 2, `expected one script and one stylesheet, found ${assets.length}`);
for (const path of assets) {
  const [local, remote] = await Promise.all([readFile(`dist${path}`), fetch(`${origin}${path}`)]);
  assert(remote.status === 200, `${path} returned HTTP ${remote.status}`);
  assert(remote.headers.get('cache-control')?.includes('immutable'), `${path} is not cached immutably`);
  const live = Buffer.from(await remote.arrayBuffer());
  const digest = value => createHash('sha256').update(value).digest('hex');
  assert(digest(local) === digest(live), `${path} does not match the local production build`);
}

const worker = await fetch(`${origin}/sw.js`);
assert(worker.status === 200, `service worker returned HTTP ${worker.status}`);
assert(worker.headers.get('cache-control')?.includes('no-store'), 'service worker is not served with no-store');

const catalog = await fetch('https://api.sociobot.in/api/v1/products').then(response => response.json());
const product = catalog.data?.find(item => item.slug === 'care-visit-brief');
assert(product, 'care-visit-brief is absent from the production product catalog');
assert(product.price_minor === 1200 && product.currency === 'USD', 'production catalog price is not USD 12.00');
assert(product.product_url === `${origin}/`, 'production product return URL is wrong');

const checkoutResponse = await fetch(checkout, { redirect: 'manual' });
assert([301, 302, 303, 307, 308].includes(checkoutResponse.status), `checkout returned HTTP ${checkoutResponse.status}`);
const checkoutLocation = checkoutResponse.headers.get('location');
assert(checkoutLocation, 'checkout did not return a redirect location');
assert(new URL(checkoutLocation).protocol === 'https:', 'checkout redirect is not HTTPS');

const verifyResponse = await fetch(verify);
assert(verifyResponse.status === 200, `license verification returned HTTP ${verifyResponse.status}`);
const verdict = await verifyResponse.json();
assert(verdict.valid === false, 'an invalid release-check token was accepted');

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const routes = [
    ['/', 'Care Visit Brief — Print a clear symptom timeline', `${origin}/`],
    ['/log', 'Symptom timeline — Care Visit Brief', `${origin}/log`],
    ['/?demo=1', 'Demo — Care Visit Brief', `${origin}/?demo=1`],
    ['/privacy', 'Privacy — Care Visit Brief', `${origin}/privacy`],
    ['/terms', 'Terms — Care Visit Brief', `${origin}/terms`]
  ];
  for (const [path, title, canonical] of routes) {
    const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
    assert(response?.status() === 200, `${path} returned HTTP ${response?.status()}`);
    assert(await page.title() === title, `${path} has the wrong title`);
    assert(await page.locator('link[rel="canonical"]').getAttribute('href') === canonical, `${path} has the wrong canonical URL`);
    assert(await page.locator('meta[property="og:url"]').getAttribute('content') === canonical, `${path} has the wrong Open Graph URL`);
    assert(await page.locator('meta[name="twitter:title"]').getAttribute('content') === title, `${path} has the wrong Twitter title`);
  }
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  assert(await page.getByRole('heading', { name: 'Choose the day’s severity' }).count() === 1, 'home has the old first-step heading');
  assert(await page.getByRole('heading', { name: 'Leave days without notes blank' }).count() === 1, 'home has the old blank-day heading');
  assert(await page.locator('figcaption').textContent() === 'Record only details you may want to discuss with a clinician.', 'home has the old hero caption');
  await page.goto(`${origin}/?demo=1`, { waitUntil: 'networkidle' });
  const sample = page.getByText('Worse than usual after two poor nights.').first();
  assert(await sample.isVisible(), 'demo sample note is not visible');
  const box = await sample.boundingBox();
  assert(box && box.y + box.height <= 844, 'demo sample note is below the first mobile viewport');
  assert(await page.locator('.entry-card').count() === 5, 'demo does not contain five sample notes');
  const termsText = await page.goto(`${origin}/terms`, { waitUntil: 'networkidle' }).then(() => page.locator('main').innerText());
  assert(termsText.includes('$12 USD unlock is a one-time purchase'), 'terms do not state the USD 12 one-time purchase');
  assert(termsText.includes('Sociobot and Dodo are the merchant of record'), 'terms do not state the merchants of record');
  const missing = await page.goto(`${origin}/missing-page`, { waitUntil: 'networkidle' });
  assert(missing?.status() === 404, `unknown route returned HTTP ${missing?.status()}`);
  for (const selector of ['header', 'footer', 'main', 'link[rel="canonical"]', 'meta[name="description"]', 'meta[property="og:title"]', 'link[rel="icon"]']) {
    assert(await page.locator(selector).count() === 1, `404 is missing ${selector}`);
  }
  assert(await page.getByRole('link', { name: 'Privacy' }).count() >= 1, '404 is missing Privacy link');
  assert(await page.getByRole('link', { name: 'Terms' }).count() >= 1, '404 is missing Terms link');
  assert(await page.getByRole('heading', { name: 'We could not find this page' }).count() === 1, '404 has the old metaphorical heading');
  await context.close();
} finally {
  await browser.close();
}

console.log(`Live release checks passed for ${origin}`);
