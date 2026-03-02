const VERSION = "1.10";
const CORE_CACHE = "phonograph-core-" + VERSION;
const RUNTIME_CACHE = "phonograph-runtime-" + VERSION;
const IMAGE_CACHE = "phonograph-images-" + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => {
        // Populated by swGenerator.js at build time.
        return cache.addAll([]);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([CORE_CACHE, RUNTIME_CACHE, IMAGE_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((names) => {
        return Promise.all(
          names.map((name) => {
            if (keep.has(name)) return null;
            return caches.delete(name);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

const shouldIgnore = (url) => {
  // Only same-origin requests should be checked here.
  const pathname = url.pathname;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.startsWith("/rss-full/")) return true;
  if (pathname.startsWith("/raw/")) return true;
  if (pathname.startsWith("/lhead/")) return true;
  if (pathname.startsWith("/podcasts/")) return true;
  if (pathname.startsWith("/search/")) return true;
  if (pathname.startsWith("/ln/")) return true;
  if (pathname.startsWith("/image/")) return true;
  if (pathname.startsWith("/media/")) return true;
  if (pathname.startsWith("/ignoreme/")) return true;
  return false;
};

const isNavigationRequest = (request) => {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html");
};

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // iOS Safari relies heavily on Range requests for media.
  // Cache API matching ignores headers, so caching a partial response can break playback.
  if (request.headers.has("range")) return;

  const url = new URL(request.url);

  // Cache images (including cross-origin) to avoid repeatedly depending on slow podcast hosts.
  const acceptHeader = request.headers.get("accept") || "";
  const isImageRequest = request.destination === "image" || acceptHeader.includes("image");
  if (isImageRequest && (url.protocol === "http:" || url.protocol === "https:")) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((response) => {
              // Cross-origin image requests are often opaque (status 0).
              if (response && (response.ok || response.type === "opaque")) {
                cache.put(request, response.clone()).catch(() => {});
              }
              return response;
            })
            .catch(() => cached);

          return cached || fetchPromise;
        });
      })
    );
    return;
  }

  // The rest of the caching strategy is same-origin only.
  if (url.origin !== self.location.origin) return;
  if (shouldIgnore(url)) return;

  if (isNavigationRequest(request)) {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        return cached || fetch("/index.html");
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (!response || !response.ok) return response;

          const copy = response.clone();
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, copy))
            .catch(() => {});

          return response;
        })
        .catch(() => cached);
    })
  );
});
