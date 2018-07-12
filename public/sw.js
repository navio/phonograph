// Licensed under a CC0 1.0 Universal (CC0 1.0) Public Domain Dedication
// http://creativecommons.org/publicdomain/zero/1.0/

// HTML files: try the network first, then the cache.
// Other files: try the cache first, then the network.
// Both: cache a fresh version if possible.
// (beware: the cache will grow and grow; there's no cleanup)

const cacheName = 'files';
const rss = 'rss-pg';
const rssless = 'rss-less-pg';

self.addEventListener('fetch', fetchEvent => {
  const request = fetchEvent.request;

  if (request.method !== 'GET') return;
  if ( (request.url.indexOf(rss) > -1 ) || 
       (request.url.indexOf(rssless) > -1 ) ||
       (request.url.indexOf("http:") > -1 ) ) return;

  fetchEvent.respondWith(async function() {
    const fetchPromise = fetch(request);
    fetchEvent.waitUntil(async function() {
      const responseFromFetch = await fetchPromise;
      const responseCopy = responseFromFetch.clone();
      const myCache = await caches.open(cacheName);
      try{
        return myCache.put(request, responseCopy);
      }catch(error){
        return;
      }
      
    }());
    if (request.headers.get('Accept').includes('text/html')) {
      try {
        return fetchPromise;
      }
      catch(error) {
        return caches.match(request);
      }
    } else {
      const responseFromCache = await caches.match(request);
      return responseFromCache || fetchPromise;
    }
  }());
});