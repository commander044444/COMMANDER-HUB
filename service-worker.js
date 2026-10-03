/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v12';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=12',
  './css/components.css?v=12',
  './css/themes.css?v=12',
  './css/responsive.css?v=12',
  './js/i18n.js?v=12',
  './js/storage.js?v=12',
  './js/state.js?v=12',
  './js/security.js?v=12',
  './js/widgets.js?v=12',
  './js/dashboard.js?v=12',
  './js/workspaces.js?v=12',
  './js/notes.js?v=12',
  './js/tasks.js?v=12',
  './js/occasions.js?v=12',
  './js/calendar.js?v=12',
  './js/crypto.js?v=12',
  './js/portfolio.js?v=12',
  './js/news.js?v=12',
  './js/weather.js?v=12',
  './js/search.js?v=12',
  './js/backup.js?v=12',
  './js/settings.js?v=12',
  './js/assistant.js?v=12',
  './js/app.js?v=12',
  './manifest.webmanifest?v=12',
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
