import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBL9sAx5EqQowfJdmQeEYXqodoMwt0fskM",
  authDomain: "medicall-notification.firebaseapp.com",
  projectId: "medicall-notification",
  storageBucket: "medicall-notification.firebasestorage.app",
  messagingSenderId: "82277317687",
  appId: "1:82277317687:web:49032d1502c3dc96a993b2"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ─── متغير لتتبع الـ foreground listener ─────────────
let messageUnsubscribe = null;

// ─── حفظ التوكن في الباك اند ─────────────────────────
const saveTokenToBackend = async (token) => {
  try {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      console.warn("⚠️ No auth token found, skipping FCM token save.");
      return;
    }

    let storedDeviceId = localStorage.getItem("medicall_browser_id");
    if (!storedDeviceId) {
      storedDeviceId = 'web-' + crypto.randomUUID();
      localStorage.setItem("medicall_browser_id", storedDeviceId);
    }

    const requestBody = {
      UserId: Number(localStorage.getItem("userId")) || 1,
      DeviceId: storedDeviceId,
      DeviceToken: token,
      Token: token,
      IsAdmin: true
    };

    const response = await fetch("/api/Notifications/SaveToken", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${userToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      console.log("✅ FCM Token saved successfully!");
    } else {
      console.error("❌ Server Error saving token:", response.status);
    }
  } catch (error) {
    console.error("❌ Network Error saving token:", error);
  }
};

// ─── طلب الإذن وتسجيل الـ Service Worker وجلب التوكن ──
export const requestPermission = async () => {
  try {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      console.warn("⚠️ User not logged in. Skipping notification setup.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("⚠️ Notification permission denied.");
      return null;
    }

    let registration;
    try {
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      registration = existingRegs.find(r =>
        r.active?.scriptURL?.includes('firebase-messaging-sw.js')
      );

      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      }
    } catch (swError) {
      console.error("❌ Service Worker registration failed:", swError);
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: "BKL3YmHjXEjtc3i1WS_xpuB4kPW91UY3ORe-VaPrBhVAzwsHcI_WLsdEEfgH8t6eMrDkbJdZyziknQXIYEEfhWE",
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log("✅ FCM Token obtained:", token);
      localStorage.setItem("fcmToken", token);
      await saveTokenToBackend(token);
      return token;
    } else {
      console.warn("⚠️ No FCM token returned.");
      return null;
    }
  } catch (err) {
    console.error("❌ requestPermission failed:", err);
    return null;
  }
};

// ─── استقبال الإشعارات والصفحة مفتوحة (Foreground) ────
export const onMessageListener = (callback) => {
  if (messageUnsubscribe) {
    messageUnsubscribe();
    messageUnsubscribe = null;
  }

  const userToken = localStorage.getItem("token");
  if (!userToken) {
    console.warn("⚠️ User not logged in. Skipping foreground message listener.");
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      console.warn("⚠️ Message received but user is logged out. Ignoring.");
      return;
    }
    console.log("📩 Foreground Message received:", payload);
    callback(payload);
  });

  messageUnsubscribe = unsubscribe;
  return unsubscribe;
};

// ─── إلغاء كل الإشعارات عند الـ Logout ────────────────
export const cleanupNotifications = async () => {
  try {
    // 1. إيقاف الـ foreground listener
    if (messageUnsubscribe) {
      messageUnsubscribe();
      messageUnsubscribe = null;
      console.log("✅ Foreground message listener removed.");
    }

    // 2. حذف الـ FCM token من Firebase
    try {
      await deleteToken(messaging);
      console.log("✅ FCM token deleted from Firebase.");
    } catch (e) {
      console.warn("⚠️ Could not delete FCM token:", e);
    }

    // 3. إبلاغ الـ Service Worker بالـ logout
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'LOGOUT' });
    }

    console.log("✅ Notifications cleanup complete.");
  } catch (error) {
    console.error("❌ Error during notifications cleanup:", error);
  }
};