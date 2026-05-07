// Remi AI Store V1 worker.js
const CACHE_NAME = "remi-store-v1-v102";
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(["./","./index.html","./db.js"])).catch(()=>{}));
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  const req = event.request;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
