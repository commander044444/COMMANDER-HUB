/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v13';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=13',
  './css/components.css?v=13',
  './css/themes.css?v=13',
  './css/responsive.css?v=13',
  './js/i18n.js?v=13',
  './js/storage.js?v=13',
  './js/state.js?v=13',
  './js/security.js?v=13',
  './js/widgets.js?v=13',
  './js/dashboard.js?v=13',
  './js/workspaces.js?v=13',
  './js/notes.js?v=13',
  './js/tasks.js?v=13',
  './js/occasions.js?v=13',
  './js/calendar.js?v=13',
  './js/crypto.js?v=13',
  './js/portfolio.js?v=13',
  './js/news.js?v=13',
  './js/weather.js?v=13',
  './js/search.js?v=13',
  './js/backup.js?v=13',
  './js/settings.js?v=13',
  './js/assistant.js?v=13',
  './js/app.js?v=13',
  './manifest.webmanifest?v=13',
  './assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Network-first for JS/CSS to pick up updates faster
      const isAsset = /\.(js|css)(\?|$)/.test(url.pathname + url.search);
      if (isAsset) {
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached || caches.match('./index.html'));
      }
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
