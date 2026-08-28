const CACHE = 'care-visit-brief-v1';
const APP_SHELL = ['/', '/demo', '/log', '/privacy', '/terms', '/offline.html', '/manifest.webmanifest', '/favicon.svg', '/assets/notebook-hero.webp'];
self.addEventListener('install', event => { self.skipWaiting(); event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))); });
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response; }).catch(() => event.request.mode === 'navigate' ? caches.match('/offline.html') : new Response('', { status: 503 }))));
});
