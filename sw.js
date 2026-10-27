/* 🛡️ Service Worker — حصر كاميرات الأمن */
const CACHE='giza-cam-v1';
/* الملفات الأساسية + أهم مكتبات الـ CDN (بنسختها المحلية أول مرة) */
const CORE=['./index.html','./manifest.json'];
const CDN=[
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];
self.addEventListener('install',e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* استراتيجية: الشبكة أولاً مع كاش احتياطي — البيانات من Firebase لازم تفضل طازة */
self.addEventListener('fetch',e=>{
 const url=new URL(e.request.url);
 /* مكتبات CDN: كاش أول مرة، ولو الشبكة قصّت نجيب من الكاش */
 if(CDN.some(u=>e.request.url.startsWith(u))){
  e.respondWith(
   caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
    if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
    return res;
   }).catch(()=>cached))
  );
  return;
}
 /* بيانات Firebase (Firestore/Auth): الشبكة بس — عشان الأوفلاين ميترجعش كاش قديم */
 if(url.hostname.includes('firebase')||url.hostname.includes('googleapis')||url.hostname.includes('google')){
  return; /* سيبها للشبكة العادية */
 }
 /* الملفات المحلية: كاش أولاً ثم شبكة */
 e.respondWith(
  caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
   if(res&&res.ok&&(e.request.method==='GET')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
   return res;
  }))
 );
});
/* رسالة تحديث الكاش من الصفحة */
self.addEventListener('message',e=>{
 if(e.data==='SKIP_WAITING')self.skipWaiting();
 if(e.data==='CLEAR_CACHE')caches.keys().then(ks=>ks.forEach(k=>caches.delete(k)));
});
