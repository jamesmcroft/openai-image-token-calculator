// Service worker for PWA installability and offline support.
const CACHE_NAME = "aoai-calc-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["./"]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // For navigation requests (HTML pages), serve the cached shell
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("./", { ignoreSearch: true }),
      ),
    );
    return;
  }

  // For other requests, try network first then cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
