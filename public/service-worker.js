// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//       caches.match(event.request)
//         .then(function(response) {
//           // Cache hit - return response
//           if (response) {
//             return response;
//           }
//           return fetch(event.request);
//         }
//       )
//     );
//   });
const version = 1;
self.addEventListener("install", function(event) {
    console.log('WORKER: install event in progress.');
    event.waitUntil(
      /* The caches built-in is a promise-based API that helps you cache responses,
         as well as finding and deleting them.
      */
      caches
        .open('phonograph-core-'+version)
        .then(function(cache) {
          return cache.addAll([
            '/index.html',
            '/favicon-16x16.png',
            '/favicon-32x32.png"'
          ]);
        })
        .then(function() {
          console.log('WORKER: install completed');
        })
    );
  });

self.addEventListener("fetch", function(event) {
    console.log('WORKER: fetch event in progress.');
    
    if (event.request.method !== 'GET') {
      return;
    }

    if(event.request.url.indexOf('/api/') > -1 ){
      return;
    }

    /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
       Fulfillment result will be used as the response, and rejection will end in a
       HTTP response indicating failure.
    */
    event.respondWith(
      caches
        /* This method returns a promise that resolves to a cache entry matching
           the request. Once the promise is settled, we can then provide a response
           to the fetch request.
        */
        .match(event.request)
        .then(function(cached) {

          console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
          console.log('lala', cached);

          return cached || fetch(event.request)
          .then(fetchedFromNetwork, unableToResolve)
          .catch(unableToResolve);
  
          function fetchedFromNetwork(response) {
            var cacheCopy = response.clone();
  
            console.log('WORKER: fetch response from network.', event.request.url);
  
            caches
              .open('phonograph-'+version)
              .then(function add(cache) {
                cache.put(event.request, cacheCopy);
              })
              .then(function() {
                console.log('WORKER: fetch response stored in cache.', event.request.url);
              });
  
              return response;
          }

          function unableToResolve () {
            /* There's a couple of things we can do here.
               - Test the Accept header and then return one of the `offlineFundamentals`
                 e.g: `return caches.match('/some/cached/image.png')`
               - You should also consider the origin. It's easier to decide what
                 "unavailable" means for requests against your origins than for requests
                 against a third party, such as an ad provider
               - Generate a Response programmaticaly, as shown below, and return that
            */
  
            console.log('WORKER: fetch request failed in both cache and network.');
  
            /* Here we're creating a response programmatically. The first parameter is the
               response body, and the second one defines the options for the response.
            */
            return new Response('<h1>Service Unavailable</h1>', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          }

        })
    );
  });