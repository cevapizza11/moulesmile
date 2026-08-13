// Service Worker Firebase Cloud Messaging — Moule & Smile
// Ce fichier gère les notifications reçues quand l'app n'est PAS au premier plan
// (téléphone verrouillé, autre appli ouverte, etc.)

importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDUb3LtVsMAq986DgtHwkMBeQFr8A8A2nU",
  authDomain: "commandemoulesmile.firebaseapp.com",
  projectId: "commandemoulesmile",
  storageBucket: "commandemoulesmile.firebasestorage.app",
  messagingSenderId: "303564394584",
  appId: "1:303564394584:web:cbde6960f99cac83517a2d"
});

const messaging = firebase.messaging();

// Notification reçue alors que l'app est en arrière-plan / fermée
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || '🐚 Moule & Smile';
  const options = {
    body: payload.notification?.body || "Un serveur s'occupe de votre commande !",
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [300, 100, 300, 100, 300],
    tag: 'moule-smile-notif',
    requireInteraction: false
  };
  self.registration.showNotification(title, options);
});

// Clic sur la notification → ouvrir/focus l'app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/index.html');
    })
  );
});
