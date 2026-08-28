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
      const shell = ['/', '/demo', '/log', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/assets/notebook-hero.webp', ...executingAssets];
      const version = createHash('sha256').update(index).update(shell.join('|')).digest('hex').slice(0, 12);
      const source = `/* Generated at build time. Do not edit dist/sw.js directly. */
const CACHE = 'care-visit-brief-${version}';
const PREFIX = 'care-visit-brief-';
const APP_SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)));
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
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/demo').then(demo => demo || caches.match('/').then(home => home || caches.match('/offline.html'))))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
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
