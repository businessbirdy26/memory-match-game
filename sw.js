// Bump this on any release that changes cached files, so old caches get evicted.
const CACHE_NAME = 'memorymatch-v2';
// Only caches under this prefix are touched by the activate-time cleanup,
// so a bumped CACHE_NAME never orphans unrelated caches from other code.
const CACHE_PREFIX = 'memorymatch-';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(ASSETS_TO_CACHE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys.filter(function (key) { return key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME; })
              .map(function (key) { return caches.delete(key); })
        );
      })
      .then(function () { return self.clients.claim(); })
  );
});

// Navigations (the HTML shell) go network-first so a fresh deploy is picked
// up on the very next load, even if this file's own bytes happen not to
// change enough for the browser to notice a service-worker update (the bug
// that shipped the safe-area fix without invalidating the old cache). Other
// same-origin GETs (icons, manifest) stay cache-first for fast, reliable
// offline support, since they change far less often.
self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, responseClone); });
          }
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) { return cached || caches.match('./index.html'); });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cached) {
      if (cached) return cached;

      return fetch(request)
        .then(function (response) {
          if (response && response.status === 200) {
            var responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) { cache.put(request, responseClone); });
          }
          return response;
        })
        .catch(function () {});
    })
  );
});
