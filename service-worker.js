/* COMMANDER HUB - Service Worker */
const CACHE_NAME = 'commander-hub-v1';
const SHELL = [
  './',
  './index.html',
  './css/main.css',
  './css/components.css',
  './css/themes.css',
  './css/responsive.css',
  './js/i18n.js',
  './js/storage.js',
  './js/state.js',
  './js/security.js',
  './js/widgets.js',
  './js/dashboard.js',
  './js/workspaces.js',
  './js/notes.js',
  './js/tasks.js',
  './js/calendar.js',
  './js/crypto.js',
  './js/portfolio.js',
  './js/news.js',
  './js/weather.js',
  './js/search.js',
  './js/backup.js',
  './js/settings.js',
  './js/app.js',
  './manifest.webmanifest',
  './assets/icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
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
  // Only cache same-origin shell assets
  if (url.origin !== self.location.origin) {
    return; // let network handle external APIs
  }
  event.respondWith(
    caches.match(event.request).then((cached) => {
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
