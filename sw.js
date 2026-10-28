/* gw-app service worker — Network first عشان أي تعديل يظهر فوراً */
const CACHE='gw-app-20261028-1434';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{
 e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
 })());
});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const req=e.request;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const res=await fetch(req,{cache:'no-store'});
   if(res&&res.ok&&new URL(req.url).origin===location.origin)cache.put(req,res.clone());
   return res;
  }catch(err){
   const cached=await cache.match(req);
   if(cached)return cached;
   throw err;
  }
 })());
});
