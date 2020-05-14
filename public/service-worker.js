const version = 1.8;
const CACHE = 'phonograph-core-' + version;


const ignoreMe = (url) => {

  if(url.indexOf('itunes.apple.com')){
    return true;
  }

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

const shouldUpdate = (url) => {
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


self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName &&  cacheName.startsWith("phonograph")) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('activate', function (){
  caches.keys().then(function(names) {
    for (let name of names) caches.delete(name);
  });
});

self.addEventListener("fetch", function (evt) {

  evt.respondWith(getOrGetAndStore(evt.request));

  // evt.waitUntil(
  //   update(evt.request)
  // );

});

function getOrGetAndStore(request) {

  let other;

  if (request.method !== 'GET') {
    return fetch(request);
  }

  if (ignoreMe(request.url)) {
    return fetch(request);
  }

  if (request.url.indexOf('/library') > -1) {
    const ref = request.referrer + 'library';
    const final = request.url.slice(ref)[0];
    if (final) {
      other = request.referrer;
    }
  }

  if (request.url.indexOf('/podcast') > -1) {
    const ref = request.referrer + 'podcast';
    const final = request.url.slice(ref)[0];
    if (final) {
      other = request.referrer;
    }
  }

  if (request.url.indexOf('/discover') > -1) {
    const ref = request.referrer + 'discover';
    const final = request.url.slice(ref)[0];
    if (final) {
      other = request.referrer;
    }
  }

  if (request.url.indexOf('/settings') > -1) {
    const ref = request.referrer + 'settings';
    const final = request.url.slice(ref)[0];
    if (final) {
      other = request.referrer;
    }
  }

 return caches.open(CACHE)
  .then(function(cache) {
    return cache.match(other || request)
    .then(function(res) {
      if(res){
        return res;
      }else{
        return fetch(other || request)
        .then(function(response) {
          if (!response.ok) {
            return response;
          }
          cache.put((other || request), response.clone());
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
