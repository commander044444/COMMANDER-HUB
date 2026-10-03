/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v19';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=19',
  './css/components.css?v=19',
  './css/themes.css?v=19',
  './css/responsive.css?v=19',
  './js/i18n.js?v=19',
  './js/storage.js?v=19',
  './js/state.js?v=19',
  './js/security.js?v=19',
  './js/widgets.js?v=19',
  './js/dashboard.js?v=19',
  './js/workspaces.js?v=19',
  './js/notes.js?v=19',
  './js/tasks.js?v=19',
  './js/occasions.js?v=19',
  './js/calendar.js?v=19',
  './js/crypto.js?v=19',
  './js/portfolio.js?v=19',
  './js/news.js?v=19',
  './js/weather.js?v=19',
  './js/search.js?v=19',
  './js/backup.js?v=19',
  './js/settings.js?v=19',
  './js/assistant.js?v=19',
  './js/app.js?v=19',
  './manifest.webmanifest?v=19',
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
