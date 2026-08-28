import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const origin = process.env.LIVE_URL || 'https://care-visit-brief.sociobot.in';
const checkout = 'https://api.sociobot.in/api/v1/products/care-visit-brief/checkout';
const verify = 'https://api.sociobot.in/api/v1/products/care-visit-brief/verify?license=release-check-invalid';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const home = await fetch(`${origin}/`);
assert(home.status === 200, `home returned HTTP ${home.status}`);
assert(home.headers.get('content-security-policy')?.includes("default-src 'self'"), 'home is missing its content security policy');
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

console.log(`Live release checks passed for ${origin}`);
