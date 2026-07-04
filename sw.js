const CACHE_NAME = 'fiby-v1';
const ASSETS = [
  '/PROVA1/index.html',
  '/PROVA1/manifest.json',
  '/PROVA1/icon-192.png',
  '/PROVA1/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Fiby', {
      body: data.body || 'Hai un nuovo messaggio',
      icon: '/PROVA1/icon-192.png',
      badge: '/PROVA1/icon-192.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/PROVA1/index.html' },
      requireInteraction: false
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data.url;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(wins => {
      const win = wins.find(w => w.focused || w.visibilityState === 'visible');
      if (win) { win.focus(); win.navigate(url); }
      else clients.openWindow(url);
    })
  );
});
