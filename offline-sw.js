/* gw-app service worker — Network first + Precache عشان يفتح أوفلاين من أول مرة */
const CACHE='gw-app-20261029-1139';
const CORE=[
 './',
 './index.html',
 './manifest.json',
 './icon-192.png',
 './icon-512.png',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];
self.addEventListener('install',e=>{
 e.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  /* cache.addAll بيفشل لو رابط واحد فشل، فبنخزن كل ملف لوحده */
  await Promise.all(CORE.map(u=>cache.add(u).catch(()=>{})));
  self.skipWaiting();
 })());
});
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
   if(res&&res.ok&&(res.type==='basic'||res.type==='cors'))cache.put(req,res.clone());
   return res;
  }catch(err){
   const cached=await cache.match(req);
   if(cached)return cached;
   /* fallback للصفحة الرئيسية لو حد فتح مسار تاني */
   if(e.request.mode==='navigate')return (await cache.match('./index.html'))||(await cache.match('./'));
   throw err;
  }
 })());
});
