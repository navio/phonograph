(function() {
  'use strict';

  // var filesToCache = [
  //   '.',
  //   'style/main.css',
  //   'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
  //   'images/still_life-1600_large_2x.jpg',
  //   'images/still_life-800_large_1x.jpg',
  //   'images/still_life_small.jpg',
  //   'images/still_life_medium.jpg',
  //   'index.html',
  //   'pages/offline.html',
  //   'pages/404.html'
  // ];

  var staticCacheName = 'cacheall';

  self.addEventListener('install', function(event) {
    console.log('Attempting to install service worker and cache static assets');
    // event.waitUntil(
    //   caches.open(staticCacheName)
    //   .then(function(cache) {
    //     return cache.addAll(filesToCache);
    //   })
    // );
  });

  self.addEventListener('fetch', function(event) {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
      caches.match(event.request).then(function(response) {
        if (response) {
          console.log('Found ', event.request.url, ' in cache');
          return response;
        }
        console.log('Network request for ', event.request.url);
        return fetch(event.request).then(function(response) {
          if (response.status === 404) {
            return caches.match('pages/404.html');
          }
          return caches.open(staticCacheName).then(function(cache) {
            if (event.request.url.indexOf('test') < 0) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          });
        });
      }).catch(function(error) {
        console.log('Error, ', error);
        // Offline Maybe? 
        // return caches.match('pages/offline.html');
      })
    );
  });

  self.addEventListener('activate', function(event) {
    console.log('Activating new service worker...');

    var cacheWhitelist = [staticCacheName];

    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  });

})();