const VERSION = "1.11";
const CORE_CACHE = "phonograph-core-" + VERSION;
const RUNTIME_CACHE = "phonograph-runtime-" + VERSION;
const IMAGE_CACHE = "phonograph-images-" + VERSION;
const APPLE_CACHE = "phonograph-apple-" + VERSION;
const APPLE_META_CACHE = "phonograph-apple-meta-" + VERSION;

const APPLE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => {
        // Populated by swGenerator.js at build time.
        return cache.addAll(["/","/index.html","/android-chrome-192x192.png","/android-chrome-512x512.png","/apple-touch-icon.png","/assets/Alert-5Xj23BFr.js","/assets/Bookmark-D4tDZhBT.js","/assets/Box-DIW-Sde5.js","/assets/Button-CaCJWOdn.js","/assets/Card-BvPQdIXC.js","/assets/Chip-D1m4n-mr.js","/assets/Footer-CgXkG4LO.js","/assets/IconButton-DgU2BvGS.js","/assets/InputLabel-B16Nk4xB.js","/assets/Library-BmNslLyk.js","/assets/MediaControl-jXNjKZyQ.js","/assets/NightsStay-BcNFu5HB.js","/assets/Playlist-CYlqeCst.js","/assets/Settings-Dfo5bCJ5.js","/assets/ToggleButtonGroup-7txxIp5d.js","/assets/Toolbar-BiNy1S--.js","/assets/genres-BIHI7g3E.js","/assets/getThemeProps-uPdpvQUk.js","/assets/index-BZeUhDsM.js","/assets/index-D6E-3vLQ.js","/assets/index-DFfA7fn2.js","/assets/phono-BvkXXBod.js","/assets/phono-MQU5S9LX.svg","/assets/podcastPalette-CLfRQ2ZP.js","/assets/warper_wasm-BprzSiyn.js","/assets/warper_wasm_bg-imKzLXKO.wasm","/assets/worker-D2CeV9X9.js","/browserconfig.xml","/favicon-16x16.png","/favicon-32x32.png","/favicon.ico","/loading.svg","/manifest.webmanifest","/mstile-144x144.png","/mstile-150x150.png","/mstile-310x150.png","/mstile-310x310.png","/mstile-70x70.png","/phono.svg","/robots.txt","/safari-pinned-tab.svg"]);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([CORE_CACHE, RUNTIME_CACHE, IMAGE_CACHE, APPLE_CACHE, APPLE_META_CACHE]);
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

const isAppleApiRequest = (url) => url.pathname.startsWith("/apple/");

const metaRequestFor = (requestUrl) => {
  const u = new URL(requestUrl);
  u.searchParams.set("__sw_meta", "1");
  return new Request(u.toString(), { method: "GET" });
};

const handleAppleApi = async (request) => {
  const cache = await caches.open(APPLE_CACHE);
  const metaCache = await caches.open(APPLE_META_CACHE);
  const metaReq = metaRequestFor(request.url);

  const cached = await cache.match(request);
  if (cached) {
    const meta = await metaCache.match(metaReq);
    if (meta) {
      try {
        const data = await meta.json();
        const cachedAt = Number(data && data.cachedAt);
        if (Number.isFinite(cachedAt) && Date.now() - cachedAt < APPLE_TTL_MS) {
          return cached;
        }
      } catch {
        // ignore meta parsing issues
      }
    } else {
      // If we have a response but no meta, treat it as fresh to avoid a network hit.
      metaCache.put(metaReq, new Response(JSON.stringify({ cachedAt: Date.now() }), { headers: { "Content-Type": "application/json" } })).catch(() => {});
      return cached;
    }
  }

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {});
      metaCache
        .put(metaReq, new Response(JSON.stringify({ cachedAt: Date.now() }), { headers: { "Content-Type": "application/json" } }))
        .catch(() => {});
    }
    return response;
  } catch {
    return cached || Response.error();
  }
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

  // Apple discovery API (same-origin proxy). Cache for 7 days; never re-hit the same URL within TTL.
  if (url.origin === self.location.origin && isAppleApiRequest(url)) {
    event.respondWith(handleAppleApi(request));
    return;
  }

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
