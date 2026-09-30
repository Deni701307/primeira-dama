const CACHE_NAME = "memora-v5";
const APP_URL = new URL(self.registration.scope);

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== "GET" ||
    url.origin !== APP_URL.origin ||
    !url.pathname.startsWith(APP_URL.pathname)
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        const response = await fetch(request, {
          cache: "no-store"
        });

        if (response.ok) {
          await cache.put(request, response.clone())
            .catch(() => {});
        }

        return response;
      } catch (error) {
        const saved = await cache.match(request);
        if (saved) return saved;

        if (request.mode === "navigate") {
          const home = await cache.match(APP_URL.href);
          if (home) return home;
        }

        throw error;
      }
    })()
  );
});
