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
        return cache.addAll(["/","/index.html","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon.png","/assets/Alert-Ho9PHsCK.js","/assets/Bookmark-CuLPRN6e.js","/assets/Box-6xtEx085.js","/assets/Button-CBwsM5yQ.js","/assets/Card-5sM0Ea55.js","/assets/Chip-DGrW4oxe.js","/assets/Footer-AJWU_zQ8.js","/assets/Grid-Bbc0mj7F.js","/assets/IconButton-Mo8qj0eT.js","/assets/InputLabel-kdtVJIzX.js","/assets/Library-BWPlu1QX.js","/assets/MediaControl-CH2Y9TvG.js","/assets/Playlist-BVcy34ZV.js","/assets/Settings-DPlwCFAr.js","/assets/ToggleButtonGroup-DSWXZwIv.js","/assets/Toolbar-Do1SsA3s.js","/assets/genres-BIHI7g3E.js","/assets/getThemeProps-BVtbYPp6.js","/assets/index-Dw3vdOGA.js","/assets/index-IYgdcH2L.js","/assets/index-d-YJxQtm.js","/assets/phono-BvkXXBod.js","/assets/phono-MQU5S9LX.svg","/assets/podcastPalette-hGHTsg1a.js","/assets/useSlotProps-qa3GVWS3.js","/assets/worker-D2CeV9X9.js","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/loading.svg","/manifest.webmanifest","/mstile-144x144.png","/mstile-150x150.png","/mstile-310x150.png","/mstile-310x310.png","/mstile-70x70.png","/phono.svg","/robots.txt","/safari-pinned-tab.svg"]);
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
  if (request.destination === "image" && (url.protocol === "http:" || url.protocol === "https:")) {
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
