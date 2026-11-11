/* Pages のサブディレクトリ /itadakimono-cho/ でも動く相対パス設計 */
const CACHE = 'itadakimono-cho-static-v2';
const PREFIX = 'itadakimono-cho-static-';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(new URL('./', self.location.href).pathname)) return;
  // Online では新しいHTMLを優先し、圏外時には保存済みの画面を表示
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE).then(cache => cache.put('./index.html', clone)));
      }
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
