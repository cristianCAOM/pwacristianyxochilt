const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMMUTABLE_CACHE = 'immutable-v1';

const APP_SHELL = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './img/fifa26.jpg',
    './img/icon.png'
];

const IMMUTABLE_FILES = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css'
];

self.addEventListener('install', event => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)).catch(err => console.error('Failed to cache static assets', err));
    const cacheImmutable = caches.open(IMMUTABLE_CACHE).then(cache => cache.addAll(IMMUTABLE_FILES)).catch(err => console.error('Failed to cache immutable assets', err));
    event.waitUntil(Promise.all([cacheStatic, cacheImmutable]));
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, IMMUTABLE_CACHE];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    if (IMMUTABLE_FILES.includes(event.request.url)) {
        event.respondWith(caches.match(event.request));
    } else {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(fetchResponse => {
                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(event.request, fetchResponse.clone());
                        return fetchResponse;
                    });
                });
            })
        );
    }
});