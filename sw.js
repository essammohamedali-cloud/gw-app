/* Service Worker v2 — حصر كاميرات الأمن: أوفلاين كامل */
const CACHE='gw-cams-v2';
const ASSETS=['.','./index.html','./manifest.json'];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 e.respondWith(
  fetch(e.request).then(res=>{
   try{const cl=res.clone();caches.open(CACHE).then(c=>c.put(e.request,cl))}catch(x){}
   return res;
  }).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
 );
});
