'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// Add list of files to cache here.
const FILES_TO_CACHE = [
  '/index.html',
  '/offline.html',
  '/offline2.html'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Install...');
    // 1. Specjalna metoda SW która czeka na poprawną instalację by przejsc do kolejnych kroków
    event.waitUntil(
        // 2. Tworzysz cache o nazwie CACHE_NAME w którym będą przechowywane konkretne zasoby
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
          /*lub 3. Tworzysz listę plików które mają byc tym cache podaj pośrednie linki tak jak w przykładzie
                '/wp-content/themes/index.php',
                '/wp-content/themes/main.bundle.js'
            ]);
            */
        }, error => {
            // 4. W razie błędów
            console.log(`Installation failed with error: ${error}`);
        })
    );
  //metoda to oszczędność życia. Zapewnia, że ​​każda nowa wersja pracownika serwisu przejmie stronę i zostanie natychmiast aktywowana.
  //https://bitsofco.de/what-self-skipwaiting-does-to-the-service-worker-lifecycle/
  self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activate');
    // 1. Lista cache które mają zostac w pamieci
    let cacheKeepList = [CACHE_NAME];
    event.waitUntil(
        // 2. Lista dostępnych cache
        caches.keys().then( keyList => {
            // 3. Sprawdź kolejno kazdo cache w SW
            return Promise.all(keyList.map(function(key) {
            // 4. Jeśli cache nie jest aktualne to je usuń
            if (cacheKeepList.indexOf(key) === -1) {
                console.log('[ServiceWorker] Removing old cache', key);
                return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    // 1. Jeśli nie pobierasz zasobów to nie uruchamiasz mechanizmu
    if (event.request.method != 'GET') return;
    if (event.request.mode !== 'navigate') {
      // Not a page navigation, bail.
      return;
    }
    event.respondWith(
        fetch(event.request)
            .catch(() => {
              return caches.open(CACHE_NAME)
                  .then((cache) => {
                    return cache.match('index.html');
                  });
            })
    );
    
  /*  // 2. Analiza wyników
    event.respondWith(async function() {
        // 3. Sprawdzasz zawarotśc cache i porownojesz z wynikami GETow
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            // 4. Jesli cache sie zgadza z pobieranymi zasobami to uzyj cache SW
            // i uzupelnij cache o nowe zasoby ktore sie pojawiaja
            event.waitUntil(cache.add(event.request));
            return cachedResponse;
        }
        // 5. Jesli zadnych potrzebych zasobow nie ma w zdefiniowanym cache to pobieraj z sieci
        return fetch(event.request);
    }());
    */
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  
  const title = 'Push Codelab';
  const options = {
    body: 'MSG: '+event.data.text(),
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://developers.google.com/web/')
  );
});
