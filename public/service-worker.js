const version = 1.7;
const CACHE = 'phonograph-core-' + version;


const ignoreMe = (url) => {

  if (url.indexOf('chrome-extension') > -1) {
    return true;
  }
  
  if (url.indexOf('/api/') > -1) {
    return true;
  }
  
  if (url.indexOf('/rss-full/') > -1) {
    return true;
  }
  
  if (url.indexOf('/ln/') > -1) {
    return true;
  }

  if (url.indexOf('wss://') > -1) {
    return true;
  }

  if (url.indexOf('/ignoreme/') > -1) {
    return true;
  }

  return false;
} 

const shouldUpdate = () => {
  if (url.indexOf('.png') > -1) {
    return false;
  }
  if (url.indexOf('.jpg') > -1) {
    return false;
  }
  if (url.indexOf('.mp3') > -1) {
    return false;
  }
  return true;
}


self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
    .open(CACHE)
    .then(function (cache) {
      return cache.addAll([]);
    })
    .then(function () {
      console.log('WORKER: install completed');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
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

  if (evt.request.method !== 'GET') {
    return fetch(evt.request);
  }
  if (ignoreMe(evt.request.url)) {
    return fetch(evt.request);
  }

  evt.respondWith(getOrGetAndStore(evt.request));

  evt.waitUntil(
    update(evt.request)
  );

});

function getOrGetAndStore(request) {
  
  return caches.open(CACHE)
  .then(function(cache) {
    return cache.match(request)
    .then(function(res) {
      if(res){
        return res;
      }else{
        return fetch(request)
        .then(function(response) {
          if (!response.ok) {
            return response;
          }
          cache.put(request, response.clone());
          return response;
        })
      }
    })
  });
}

function update(request) {
  if (ignoreMe(request.url)){
    return;
  }
  if(!shouldUpdate(request.url)){
    return;
  }

  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  });
}
