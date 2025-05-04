const cacheName = 'koty-pwa-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/memy.html',
  '/fakty.html',
  '/style.css',
  '/js/main.js',
  '/js/firebase-config.js',
  '/images/cat1.jpg',
  '/images/mem1.jpg',
  '/images/mem2.jpg',
  '/images/mem3.jpg',
  '/images/pwa-icon-128.png',
  '/images/pwa-icon-144.png',
  '/images/pwa-icon-192.png',
  '/images/pwa-icon-256.png',
  '/images/pwa-icon-512.png',
  '/images/pwa-icon-152.png',
  '/images/apple-splash-640-1136.jpg',
  '/images/apple-splash-750-1334.jpg',
  '/images/apple-splash-828-1792.jpg',
  '/images/apple-splash-1125-2436.jpg',
  '/images/apple-splash-1242-2688.jpg',
  '/images/apple-splash-1536-2048.jpg',
  '/images/apple-splash-1668-2224.jpg',
  '/images/apple-splash-1668-2388.jpg',
  '/images/apple-splash-2048-2732.jpg',
  '/images/apple-icon-180.png',
  '/images/favicon.ico'
];

// Zaimportowanie Firebase Messaging SW
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging-compat.js');
importScripts('/js/firebase-config.js');

// Konfiguracja Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Instalacja Service Workera
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

// Dynamiczne buforowanie i obsługa żądań
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        if (event.request.method === 'GET') {
          return caches.open(cacheName).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        }
        return fetchResponse;
      });
    }).catch(() => {
      // Fallback dla braku połączenia
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Aktywacja i czyszczenie starych cache'ów
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [cacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (!cacheWhitelist.includes(cache)) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Obsługa wiadomości push od Firebase
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Otrzymano wiadomość w tle ', payload);

  const notificationTitle = payload.notification.title || 'Koty internetowe';
  const notificationOptions = {
    body: payload.notification.body || 'Nowa wiadomość o kotach!',
    icon: 'images/pwa-icon-192.png',
    badge: 'images/pwa-icon-128.png',
    vibrate: [100, 50, 100],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Obsługa kliknięcia w powiadomienie
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Sprawdzenie czy jakieś okno jest już otwarte
      for (let i = 0; i < windowClients.length; i++) {
        let client = windowClients[i];
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Jeśli nie ma otwartego okna, otwarcie nowego
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});