const CACHE_NAME = 'My-Site-Cache-v1';
const FILES_TO_CACHE = [
    "/",
    "/idb.js",
    "/index.js",
    "/css/styles.css",
    "/manifest.json",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png"
];

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ');
                return request
            } else {       // if there are no cache, try fetching request
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})

//Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(e.request);
                    });
            }).catch(err => console.log(err))
        );
        return;
    }
    //Respond with return cached home page
    e.respondWith(
        fetch(e.request).catch(function () {
            return caches.match(e.request).then(function (response) {
                if (response) {
                    return response;
                } else if (e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/');
                }
            })
        })
    )
});

// self.addEventListener('activate', function (e) {
//     e.waitUntil(
//         caches.keys().then(function (keyList) {
//             let cacheKeepList = keyListfilter(function (key) {
//                 return key.indexOf(APP_PREFIX);
//             });
//             cacheKeepList.push(CACHE_NAME);
//             return Promise.all(
//                 keyList.map(function (key, i) {
//                     if (cacheKeepList.indexOf(key) === -1) {
//                         console.log('deleting cache : ' + keyList[i]);
//                         return caches.delete(keyList[i]);
//                     }
//                 })
//             );
//         })
//     );
// });
