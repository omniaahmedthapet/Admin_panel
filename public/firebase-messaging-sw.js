importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBL9sAx5EqQowfJdmQeEYXqodoMwt0fskM",
  authDomain: "medicall-notification.firebaseapp.com",
  projectId: "medicall-notification",
  messagingSenderId: "82277317687",
  appId: "1:82277317687:web:49032d1502c3dc96a993b2"
});

const messaging = firebase.messaging();

// ✅ لما تدوسي على النوتيفيكيشن
sself.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const requestId = event.notification.data?.id;
  const targetUrl = requestId 
    ? `/request-details?id=${requestId}` 
    : '/requests';

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});

// ✅ استقبال في الخلفية
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background Message:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "New Notification";

  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: '/logo192.png'
  };

  // 🔥 أهم حاجة: نبعت message للصفحات المفتوحة
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: "NEW_REQUEST",
        id: payload.data?.id
      });
    });
  });

  return self.registration.showNotification(notificationTitle, {
    ...notificationOptions,
    data: {
      id: payload.data?.id || payload.notification?.id
    }
  });
});