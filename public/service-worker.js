const VERSION = "1.10";
const CORE_CACHE = "phonograph-core-" + VERSION;
const RUNTIME_CACHE = "phonograph-runtime-" + VERSION;

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
  const keep = new Set([CORE_CACHE, RUNTIME_CACHE]);
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
  // Only same-origin requests reach here.
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
  
  // const shouldUpdate = (url) => {
  //   if (url.indexOf('.png') > -1) {
  //     return false;
  //   }
  //   if (url.indexOf('.jpg') > -1) {
  //     return false;
  //   }
  //   if (url.indexOf('.mp3') > -1) {
  //     return false;
  //   }
  
  //   return true;
  // }


  // const localURLs = ['library', 'podcast', 'discover', 'settings' ]
  // .map(path => event.request.referrer + path );

  // if (request.url.indexOf('/library') > -1) {
  //   const ref = request.referrer + 'library';
  //   const final = request.url.slice(ref)[0];
  //   if (final) {
  //     other = request.referrer;
  //   }
  // }

  // if (request.url.indexOf('/podcast') > -1) {
  //   const ref = request.referrer + 'podcast';
  //   const final = request.url.slice(ref)[0];
  //   if (final) {
  //     other = request.referrer;
  //   }
  // }

  // if (request.url.indexOf('/discover') > -1) {
  //   const ref = request.referrer + 'discover';
  //   const final = request.url.slice(ref)[0];
  //   if (final) {
  //     other = request.referrer;
  //   }
  // }

  // if (request.url.indexOf('/settings') > -1) {
  //   const ref = request.referrer + 'settings';
  //   const final = request.url.slice(ref)[0];
  //   if (final) {
  //     other = request.referrer;
  //   }
  // }


// function update(request) {
//   if (ignoreMe(request.url)){
//     return;
//   }
//   if(!shouldUpdate(request.url)){
//     return;
//   }

//   return caches.open(CACHE).then(function (cache) {
//     return fetch(request).then(function (response) {
//       return cache.put(request, response.clone()).then(function () {
//         return response;
//       });
//     });
//   });
// }
