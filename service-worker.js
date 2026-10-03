/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v18';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=18',
  './css/components.css?v=18',
  './css/themes.css?v=18',
  './css/responsive.css?v=18',
  './js/i18n.js?v=18',
  './js/storage.js?v=18',
  './js/state.js?v=18',
  './js/security.js?v=18',
  './js/widgets.js?v=18',
  './js/dashboard.js?v=18',
  './js/workspaces.js?v=18',
  './js/notes.js?v=18',
  './js/tasks.js?v=18',
  './js/occasions.js?v=18',
  './js/calendar.js?v=18',
  './js/crypto.js?v=18',
  './js/portfolio.js?v=18',
  './js/news.js?v=18',
  './js/weather.js?v=18',
  './js/search.js?v=18',
  './js/backup.js?v=18',
  './js/settings.js?v=18',
  './js/assistant.js?v=18',
  './js/app.js?v=18',
  './manifest.webmanifest?v=18',
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
