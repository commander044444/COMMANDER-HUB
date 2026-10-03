/* COMMANDER HUB - Service Worker v3 */
const CACHE_NAME = 'commander-hub-v17';
const SHELL = [
  './',
  './index.html',
  './css/main.css?v=17',
  './css/components.css?v=17',
  './css/themes.css?v=17',
  './css/responsive.css?v=17',
  './js/i18n.js?v=17',
  './js/storage.js?v=17',
  './js/state.js?v=17',
  './js/security.js?v=17',
  './js/widgets.js?v=17',
  './js/dashboard.js?v=17',
  './js/workspaces.js?v=17',
  './js/notes.js?v=17',
  './js/tasks.js?v=17',
  './js/occasions.js?v=17',
  './js/calendar.js?v=17',
  './js/crypto.js?v=17',
  './js/portfolio.js?v=17',
  './js/news.js?v=17',
  './js/weather.js?v=17',
  './js/search.js?v=17',
  './js/backup.js?v=17',
  './js/settings.js?v=17',
  './js/assistant.js?v=17',
  './js/app.js?v=17',
  './manifest.webmanifest?v=17',
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
