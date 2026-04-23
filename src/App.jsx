import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Requests from "./pages/Requests";
import RequestDetails from "./pages/RequestDetails";
import './index.css';
import { requestPermission, onMessageListener } from "./firebase";

// ✅ تسجيل الـ Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log("Service Worker registered:", registration);
    })
    .catch((err) => {
      console.error("Service Worker registration failed:", err);
    });
}

export default function App() {
  const [notifications, setNotifications] = useState([]);

 useEffect(() => {
  requestPermission();
}, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/requests" element={<Requests notifications={notifications} />} />
        <Route path="/request-details" element={<RequestDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
