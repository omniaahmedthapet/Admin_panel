importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBL9sAx5EqQowfJdmQeEYXqodoMwt0fskM",
  authDomain: "medicall-notification.firebaseapp.com",
  projectId: "medicall-notification",
  storageBucket: "medicall-notification.firebasestorage.app",
  messagingSenderId: "82277317687",
  appId: "1:82277317687:web:49032d1502c3dc96a993b2"
});

const messaging = firebase.messaging();

// ─── متغير لتتبع حالة الـ logout ──────────────────────
let isLoggedOut = false;

// ─── استقبال رسائل من الصفحة (logout وغيره) ──────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'LOGOUT') {
    isLoggedOut = true;
    console.log("🔕 SW: User logged out. Background notifications paused.");
  }
  if (event.data?.type === 'LOGIN') {
    isLoggedOut = false;
    console.log("🔔 SW: User logged in. Background notifications resumed.");
  }
});

// ─── لما تدوس على النوتيفيكيشن ────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const requestId = event.notification.data?.id;
  const targetUrl = requestId
    ? `/request-details?id=${requestId}`
    : '/requests';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // لو في نافذة مفتوحة، روح عليها
      for (const client of windowClients) {
        if (client.url.includes('/requests') || client.url.includes('/request-details')) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // لو مفيش، افتح نافذة جديدة
      return clients.openWindow(targetUrl);
    })
  );
});

// ─── استقبال في الخلفية (Background) ─────────────────
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background Message:", payload);

  // لو المستخدم عمل logout، متظهرش الـ notification
  if (isLoggedOut) {
    console.log("🔕 SW: Skipping notification (user logged out).");
    return;
  }

  const notificationTitle =
    payload.notification?.title ||
    payload.data?.title ||
    "طلب تسجيل جديد 🏥";

  const notificationBody =
    payload.notification?.body ||
    payload.data?.body ||
    "تم إضافة طلب انضمام جديد، راجعه الآن";

  const notificationOptions = {
    body: notificationBody,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // اللون والاتجاه
    dir: 'rtl',
    lang: 'ar',
    // بيانات إضافية للـ notificationclick
    data: {
      id: payload.data?.id || payload.notification?.id
    },
    // خيارات إضافية للشكل
    requireInteraction: false,
    silent: false,
    tag: `medicall-request-${payload.data?.id || Date.now()}`,
  };

  // إبلاغ الصفحات المفتوحة بالطلب الجديد (لو الصفحة مفتوحة)
  self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(windowClients => {
    windowClients.forEach(client => {
      client.postMessage({
        type: "NEW_REQUEST",
        id: payload.data?.id
      });
    });
  });

  return self.registration.showNotification(notificationTitle, notificationOptions);
});