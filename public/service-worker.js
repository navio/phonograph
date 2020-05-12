const version = 1.7;
const CACHE = 'phonograph-core-' + version
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
    .open(CACHE)
    .then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/favicon-16x16.png',
        '/favicon-32x32.png',
        '/safari-pinned-tab.svg',
        '/apple-touch-icon.png'
      ]);
    })
    .then(function () {
      console.log('WORKER: install completed');
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker Active');
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (cacheName) {
          return (cacheName.toString().indexOf('phonograph') > -1)
        }).map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});




self.addEventListener("fetch", function (evt) {
  console.log('The service worker is serving the asset.');

  if (evt.request.method !== 'GET') {
    return fetch(evt.request);
  }
  
  if (evt.request.url.indexOf('/api/') > -1) {
    return fetch(evt.request);
  }
  
  if (evt.request.url.indexOf('/rss-full/') > -1) {
    return fetch(evt.request);
  }
  
  if (evt.request.url.indexOf('/ln/') > -1) {
    return fetch(evt.request);
  }

  evt.respondWith(fromCache(evt.request));

  evt.waitUntil(
    update(evt.request)
    .then(refresh)
  );

});

function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}

function refresh(response) {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      
      const message = {
        type: 'refresh',
        url: response.url,
        eTag: response.headers.get('ETag')
      };

      client.postMessage(JSON.stringify(message));
    });
  });
}
