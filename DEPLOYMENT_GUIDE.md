# 🚀 دليل رفع المشروع على Netlify

## ✅ الملفات اللي اتعدلت
| الملف | التعديل |
|-------|---------|
| `App.jsx` | تعطيل (comment) كود الـ Service Worker وـ Notifications |
| `src/pages/Requests.jsx` | تعطيل (comment) كل كود الـ Notifications والـ FCM |
| `netlify.toml` | إضافة API proxy + SPA fallback |
| `public/_redirects` | إضافة API proxy + SPA fallback (نسخة احتياطية) |

## ❌ مفيش ملفات اتحذفت

## ✅ الملفات اللي تسيبها زي ما هي (بدون تعديل)
- `firebase.js` — موجود بس معطّل من المكان اللي بيستخدمه
- `firebase-messaging-sw.js` — موجود بس مش بيتسجّل
- `proxy-server.cjs` — خاص بـ development فقط، مش بيتنفذ على Netlify
- `Login.jsx` — بدون أي تعديل
- `RequestDetails.jsx` — بدون أي تعديل
- `index.css`, `App.css` — بدون أي تعديل
- `vite.config.js` — بدون أي تعديل (الـ proxy خاص بـ dev server فقط)
- `index.html` — بدون أي تعديل

---

## 🔨 خطوات عمل الـ Build

```bash
# 1. تأكد إن Node.js مثبت (نسخة 18 أو أحدث)
node -v

# 2. ثبّت الـ dependencies
npm install

# 3. ابني المشروع
npm run build
```

بعد الأمر ده هيتعمل فولدر اسمه `dist/` — ده اللي هترفعيه.

---

## 🌐 خطوات الرفع على Netlify

### الطريقة الأولى: Drag & Drop (أسرع طريقة)

1. افتحي [netlify.com](https://netlify.com) وسجلي دخول
2. من الـ Dashboard، اضغطي على **"Add new site"** ثم **"Deploy manually"**
3. اسحبي فولدر `dist/` كاملاً وحطيه على الصفحة
4. انتظري ثواني وخلاص — الموقع هيكون شغال ✅

### الطريقة الثانية: GitHub (للـ auto-deploy)

1. ارفعي المشروع على GitHub
2. من Netlify: **"Add new site"** → **"Import an existing project"**
3. اختاري GitHub وحددي الـ repo
4. في إعدادات الـ Build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. اضغطي **"Deploy site"**

---

## ✔️ إزاي تتأكدي إن كل حاجة شغالة

### 1. تأكدي من الـ SPA Routing
- افتحي الموقع
- اتنقلي بين الصفحات
- اعملي Refresh وهي على صفحة `/requests` — لازم تفضل على نفس الصفحة مش ترجع 404

### 2. تأكدي من الـ API
- سجلي دخول — لو رجع token → الـ API شغال ✅
- لو جالك خطأ CORS أو Network Error → راجعي الـ API URL في الـ Netlify Logs

### 3. تشيكي الـ Deploy Logs
من Netlify Dashboard → موقعك → **"Deploys"** → افتحي آخر deploy وشوفي الـ logs

---

## 🔔 إزاي ترجعي الـ Notifications لما تحتاجيهم

كل الكود موجود ومـcomment — عشان تفعّليه:

**في `App.jsx`:**
```js
// شيلي الـ // من السطور دي:
import { requestPermission, onMessageListener } from "./firebase";

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')...
}

useEffect(() => { requestPermission(); }, []);
```

**في `Requests.jsx`:**
```js
// شيلي الـ // من:
import { onMessageListener, requestPermission, cleanupNotifications } from "../firebase";
// + كل الـ setupNotifications function
// + السطور في useEffect والـ handleLogout
```

---

## ⚠️ ملاحظات مهمة

- الـ API بتاعك HTTP مش HTTPS — ده مش هيشتغل لو Netlify enforced HTTPS على الطلبات الخارجية. لو فيه مشكلة، السيرفر بتاعك لازم يعمل HTTPS.
- الـ `proxy-server.cjs` ده بس للـ development المحلي، مش بيتستخدم على Netlify.
- الـ `vite.config.js` كمان بس للـ development، الـ `netlify.toml` هو اللي بيعمل الـ proxy على الـ production.
