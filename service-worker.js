/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v14';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=14',
  './css/components.css?v=14',
  './css/themes.css?v=14',
  './css/responsive.css?v=14',
  './js/i18n.js?v=14',
  './js/storage.js?v=14',
  './js/state.js?v=14',
  './js/security.js?v=14',
  './js/widgets.js?v=14',
  './js/dashboard.js?v=14',
  './js/workspaces.js?v=14',
  './js/notes.js?v=14',
  './js/tasks.js?v=14',
  './js/occasions.js?v=14',
  './js/calendar.js?v=14',
  './js/crypto.js?v=14',
  './js/portfolio.js?v=14',
  './js/news.js?v=14',
  './js/weather.js?v=14',
  './js/search.js?v=14',
  './js/backup.js?v=14',
  './js/settings.js?v=14',
  './js/assistant.js?v=14',
  './js/app.js?v=14',
  './manifest.webmanifest?v=14',
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
