/* sw.js */
const CACHE_NAME = "directorio-cache-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./residentes.json"
];;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Network-first para residentes.json (si hay internet, trae nuevo; si no, usa cache)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.pathname === "./residentes.json") {
    event.respondWith(
      fetch(event.request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first para el resto (app shell)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
