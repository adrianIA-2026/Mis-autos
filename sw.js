'use strict';
const CACHE='mis-autos-shell-v10-flat-v1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./core.js','./storage.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./maskable-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mis-autos-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(error=>{if(event.request.mode==='navigate')return caches.match(new URL('./index.html',self.registration.scope));throw error;})));});
