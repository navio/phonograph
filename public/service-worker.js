const version = 1.7;
const CACHE = 'phonograph-core-' + version
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
    .open(CACHE)
    .then(function (cache) {
      return cache.addAll();
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

  if (evt.request.url.indexOf('chrome-extension') > -1) {
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
  );

});

function fromCache(request) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request)
    .catch(function() {
      return fetch(request);
    })
    .then(function(res) {
      cache.put(request, res);
      return res.clone();
    })
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
