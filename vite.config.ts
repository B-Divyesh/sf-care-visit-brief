import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

function versionedServiceWorker(): Plugin {
  return {
    name: 'versioned-service-worker',
    closeBundle() {
      const dist = resolve('dist');
      const index = readFileSync(resolve(dist, 'index.html'), 'utf8');
      const executingAssets = [...index.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map(match => match[1]);
      // Every application route is an SPA view of index.html. Precaching the
      // canonical shell instead of each rewritten route makes a new /demo
      // navigation work offline even before that exact navigation request has
      // been written to Cache Storage.
      const precache = ['/index.html', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/assets/notebook-hero.webp', ...executingAssets];
      const version = createHash('sha256').update(index).update(precache.join('|')).digest('hex').slice(0, 12);
      const source = `/* Generated at build time. Do not edit dist/sw.js directly. */
const CACHE = 'care-visit-brief-${version}';
const PREFIX = 'care-visit-brief-';
const PRECACHE = ${JSON.stringify(precache)};
const NAVIGATION_FALLBACK = '/index.html';
async function fromCache(request) {
  const cache = await caches.open(CACHE);
  // Vite's local preview adds Vary headers which differ from the browser's
  // script and stylesheet requests. The URL is content-hashed, so ignoring
  // those request headers is safe and keeps this production regression test
  // representative of a real reload.
  return cache.match(request, { ignoreVary: true });
}
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      // A host may rewrite /demo to index.html, but cache it under the stable
      // shell key. Offline navigation then has one reliable fallback for all
      // in-app routes instead of relying on a route-specific cache entry.
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(NAVIGATION_FALLBACK, copy)));
      return response;
    }).catch(() => fromCache(NAVIGATION_FALLBACK).then(cached => cached || fromCache('/offline.html'))));
    return;
  }
  event.respondWith(fromCache(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    return response;
  })));
});
`;
      writeFileSync(resolve(dist, 'sw.js'), source);
    }
  };
}

export default defineConfig({
  build: { target: 'es2022' },
  plugins: [versionedServiceWorker()],
  server: { host: '127.0.0.1' }
});
