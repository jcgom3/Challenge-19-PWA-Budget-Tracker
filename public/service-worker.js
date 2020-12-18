const APP_PREFIX = 'BudgetTrackerPWA-';     
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

//when user has accessed app and then tries to access again offline...cached files will be stored in users' device and user will still have access
const FILES_TO_CACHE = [
    "./index.html",
    "./manifest.json",
    "./js/index.js",
    "./js/idb.js",
    "./css/style.css",
    "./service-worker.js",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-72x72.png",
     "/icons/icon-96x96.png"
  ];

  // Install the service worker
self.addEventListener('install', function(evt) {
    evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
        console.log('New files were cached successfully!');
        return cache.addAll(FILES_TO_CACHE);
      })
    );
  
    self.skipWaiting();
  });

  // Activate the service worker and remove old data from the cache
self.addEventListener('activate', function(evt) {
    evt.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== APP_PREFIX && key !== CACHE_NAME) {
              console.log('Old cache removed successfully', key);
              return caches.delete(key);
            }
          })
        );
      })
    );
  
    self.clients.claim();
  });

  // Intercept fetch requests
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
          .open(CACHE_NAME)
          .then(cache => {
            return fetch(evt.request)
              .then(response => {
                // If the response was good, clone it and store it in the cache.
                if (response.status === 200) {
                  cache.put(evt.request.url, response.clone());
                }
  
                return response;
              })
              .catch(err => {
                // Network request failed, try to get it from the cache.
                return cache.match(evt.request);
              });
          })
          .catch(err => console.log(err))
      );
  
      return;
    }
  
    evt.respondWith(
      fetch(evt.request).catch(function() {
        return caches.match(evt.request).then(function(response) {
          if (response) {
            return response;
          } else if (evt.request.headers.get('accept').includes('text/html')) {
            // return the cached home page for all requests for html pages
            return caches.match('/');
          }
        });
      })
    );
  });
  
