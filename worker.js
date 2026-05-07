// Remi AI Store V1 worker.js
const CACHE_NAME='remi-store-v111-auth-final-clean';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(['./','./index.html','./db.js','./worker.js','./assets/owner-pp.jpg'])).catch(()=>{}));});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));await self.clients.claim();})());
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
});
