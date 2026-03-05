const VERSION = "1.11";
const CORE_CACHE = "phonograph-core-" + VERSION;
const RUNTIME_CACHE = "phonograph-runtime-" + VERSION;
const IMAGE_CACHE = "phonograph-images-" + VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => {
        // Populated by swGenerator.js at build time.
        return cache.addAll(["/","/index.html","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon.png","/assets/Alert-DQpOxi8r.js","/assets/Bookmark-eKQV8r8q.js","/assets/Box-d0Id9DtW.js","/assets/Button-C5s9_Qq1.js","/assets/Card-C1dmhkvd.js","/assets/Chip-5ujdzoIy.js","/assets/Footer-C_FnZ8Pt.js","/assets/IconButton-BNhp0AnJ.js","/assets/InputLabel-BO1pK9w2.js","/assets/Library-BSJmpB3J.js","/assets/MediaControl-BAzighHs.js","/assets/NightsStay-ZhdBsfmv.js","/assets/Playlist-BLRNaM51.js","/assets/Settings-B-gpHcNW.js","/assets/Toolbar-BuF7zGMS.js","/assets/genres-BIHI7g3E.js","/assets/getThemeProps-D6H5iHiF.js","/assets/index-BLOqWZHN.js","/assets/index-BdmTxJTs.js","/assets/index-C3s066cY.js","/assets/phono-BvkXXBod.js","/assets/phono-MQU5S9LX.svg","/assets/podcastPalette-ClxEuOLx.js","/assets/useSlotProps-5TaRNajk.js","/assets/warper_wasm-BprzSiyn.js","/assets/warper_wasm_bg-imKzLXKO.wasm","/assets/worker-D2CeV9X9.js","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/loading.svg","/manifest.webmanifest","/mstile-144x144.png","/mstile-150x150.png","/mstile-310x150.png","/mstile-310x310.png","/mstile-70x70.png","/phono.svg","/robots.txt","/safari-pinned-tab.svg"]);
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

// Conservative allowlist of common podcast artwork hosts. Keep this list intentionally
// small to avoid caching arbitrary third-party images.
const ARTWORK_HOSTS = [
  "mzstatic.com",
  "simplecastcdn.com",
  "simplecast.com",
  "art19.com",
  "megaphone.fm",
  "podcastcdn.com",
  "podbean.com",
  "audioboom.com",
  "cloudinary.com",
  "feedburner.com",
  "amazonaws.com",
  "gravatar.com",
  "twimg.com",
  "googleusercontent.com"
];

const isArtworkOrigin = (url) => {
  const host = (url.hostname || "").toLowerCase();
  return ARTWORK_HOSTS.some((h) => host === h || host.endsWith("." + h));
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
    // Apply a strict cache-first strategy for known artwork hosts to avoid
    // unnecessary network requests when images are already cached.
    if (isArtworkOrigin(url)) {
      event.respondWith(
        caches.open(IMAGE_CACHE).then((cache) => {
          return cache.match(request).then((cached) => {
            if (cached) return cached;

            return fetch(request)
              .then((response) => {
                // Cross-origin image requests are often opaque (status 0).
                if (response && (response.ok || response.type === "opaque")) {
                  cache.put(request, response.clone()).catch(() => {});
                }
                return response;
              })
              .catch(() => cached);
          });
        })
      );

      return;
    }

    // For other images keep the existing behavior (serve cached if available,
    // but still revalidate in the background) to avoid changing unrelated rules.
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
