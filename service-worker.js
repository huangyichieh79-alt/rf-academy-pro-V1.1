const CACHE_VERSION = 'rf-academy-v1.0.4';
const APP_SHELL = [
  './', './index.html', './manifest.json', './css/style.css',
  './js/app.js', './js/storage.js', './js/tts.js', './js/quiz.js',
  './js/progress.js', './js/interview.js', './js/debug.js',
  './data/lessons/day001.json', './data/lessons/index.json',
  './data/debug-cases.json', './data/interviews.json',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then(async response => {
          if (response.ok) {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put('./index.html', response.clone());
          }
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (url.pathname.includes('/data/')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(async response => {
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(event.request, response.clone());
        }
        return response;
      }).catch(() => new Response(JSON.stringify({ error: 'offline-cache-miss' }), {
        status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' }
      })))
    );
    return;
  }

  const networkFirst = ['script', 'style', 'worker', 'manifest'].includes(event.request.destination);
  if (networkFirst) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then(async response => {
        if (response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          await cache.put(event.request, response.clone());
        }
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || new Response('', { status: 504 })))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(async response => {
      if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => new Response('', { status: 504 })))
  );
});
