const CACHE_NAME = 'pomodoro-cache-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './js/constants.js',
    './js/storage.js',
    './js/ui.js',
    './js/timer.js',
    './js/activity.js',
    './js/app.js',
    './manifest.json',
    './icon.png',
    './images/icons/icon-192x192.png',
    './images/icons/icon-512x512.png',
    './audio/house.mp3',
    './audio/l_mysterious.mp3',
    './audio/l_positive.mp3',
    './audio/scary.mp3',
    './audio/sound1.mp3'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
