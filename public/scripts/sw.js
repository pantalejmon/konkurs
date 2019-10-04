var cacheName = "pwa";
var filesToCache = [
    "/",
    "/index.html",
    "/css/style.css",
    "/css/materialize.min.css",
    "/scripts/mainScript.js",
    "/scripts/loginScript.js",
    "/scripts/registerScript.js",
    "/info.html",
    "/contact.html",
    "/process.html"

];

self.addEventListener("install", function (e) {
    console.log("[ServiceWorker] Install");
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log("[ServiceWorker] Caching app shell");
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", function (evt) {
    // Snooze logs...
    // console.log(event.request.url);
    evt.respondWith(
        // Firstly, send request..
        fetch(evt.request).catch(function () {
            // When request failed, return file from cache...
            return caches.match(evt.request);
        })
    );
});