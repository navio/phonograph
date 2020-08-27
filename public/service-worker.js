const version = 1.10;
const CACHE = 'phonograph-core-' + version;
const CACHERUNTIME = 'phonograph-runtime-' + version;



self.addEventListener('install', function (event){
  event.waitUntil(
    caches.open(CACHE)
    .then(function (cache) {
      return cache.addAll([]);
    })
    .then(self.skipWaiting())
  );
});


self.addEventListener('activate', event => {
  const currentCaches = [CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});


self.addEventListener("fetch", function (evt) {
  if (evt.request.method === 'GET' && !ignoreMe(evt.request.url) ) {
    fetchTask(evt);
  }
});

function fetchTask(event) {

    const {request} = event;
    const path = checkPath(request.url) ? new Request(self.origin) : request;

    event.respondWith(
      caches.match(path).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return caches.open(CACHERUNTIME)
              .then(function(cache) { 
                return fetch(path).then(response => {
                  if (!response.ok) {
                    return response;
                  }
                  return cache.put(path, response.clone())
                  .then(() => {
                    return response;
                  });
                });
              });
      })
    )

  }


  const ignoreMe = (url) => {
    if(url.indexOf('itunes.apple.com') > -1 ){
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

  const localURLs = ['library', 'podcast', 'podcast/', 'discover', 'settings' ];
  
  const checkPath = (url) => {
    return !!localURLs.find((current) => {
      const origin = `${self.origin}/${current}`
      return (url.indexOf(origin) > -1)
    })
  } 
  
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
