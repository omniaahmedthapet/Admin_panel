import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import doctorImg from '../assets/doctor_girl.png';
import { onMessageListener, requestPermission, cleanupNotifications } from "../firebase";
import RequestSkeleton from '../components/RequestSkeleton';

/* ── Specialty color map ── */
const SPECIALTY_COLORS = {
  default: { bg: 'rgba(26,110,255,0.09)', text: '#1A6EFF' },
  قلب:     { bg: 'rgba(255,71,87,0.09)',  text: '#FF4757' },
  أطفال:   { bg: 'rgba(0,201,167,0.10)',  text: '#00A88A' },
  عيون:    { bg: 'rgba(201,168,76,0.10)', text: '#B8960A' },
  أسنان:   { bg: 'rgba(108,92,231,0.09)', text: '#6C5CE7' },
};

function getSpecialtyStyle(specialty = '') {
  for (const key of Object.keys(SPECIALTY_COLORS)) {
    if (key !== 'default' && specialty.includes(key)) return SPECIALTY_COLORS[key];
  }
  return SPECIALTY_COLORS.default;
}

/* ── Stats header bar ── */
function StatsBar({ count, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '2.5rem',
      }}
    >
      {[
        { icon: '📋', label: 'إجمالي الطلبات', value: loading ? '—' : count, color: '#1A6EFF' },
        { icon: '⏳', label: 'قيد المراجعة',   value: loading ? '—' : count, color: '#C9A84C' },
        
      ].map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08, type: 'spring', stiffness: 220 }}
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.75)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 14px rgba(10,22,40,0.07)',
            flex: '1 1 140px',
            minWidth: '130px',
          }}
        >
          <span style={{ fontSize: '24px' }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: '11px', color: '#6B7FA3', fontWeight: '600' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: s.color, lineHeight: 1.2 }}>{s.value}</div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Requests() {
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ ref لتخزين الـ unsubscribe function
  const unsubscribeRef = useRef(null);

  // ─── Fetch Requests ────────────────────────────────────
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      // ✅ لو مفيش token → مسجل خروج → وقف فوراً
      if (!token) return;

      const response = await fetch("/api/Admin/UnApprovedProviders", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((item, index) => ({
          id: item.id || index,
          name: item.name || "بدون اسم",
          specialty: item.specialty || "غير محدد",
          date: item.date || new Date().toLocaleDateString('ar-EG'),
          status: item.status,
          profilePictureUrl: item.profilePictureUrl
        }));
        setAllRequests(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      // ✅ 1. إيقاف الإشعارات أولاً (foreground + SW + FCM token delete)
      await cleanupNotifications();

      // ✅ 2. حذف الـ device token من الباك اند
      const userToken = localStorage.getItem("token");
      const deviceId = localStorage.getItem("medicall_browser_id");
      if (deviceId && userToken) {
        await fetch(`/api/Notifications/DeleteToken/${deviceId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${userToken}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (e) {
      console.error("Error during logout cleanup:", e);
    } finally {
      // ✅ 3. مسح كل البيانات المحلية
      localStorage.removeItem("token");
      localStorage.removeItem("fcmToken");
      localStorage.removeItem("medicall_browser_id");
      navigate('/');
    }
  };

  // ─── Setup Notifications ───────────────────────────────
  const setupNotifications = () => {
    // ✅ إعداد الـ foreground listener
    const unsubscribe = onMessageListener((payload) => {
      // ✅ تحقق من الـ login قبل العرض
      if (!localStorage.getItem("token")) return;

      // عرض الـ toast
      setToast({
        type: 'info',
        title: payload.notification?.title || "طلب جديد",
        body: payload.notification?.body || "تم إضافة طلب جديد",
        id: payload.data?.id
      });

      // ✅ auto-refresh للقائمة فوراً
      fetchRequests();

      // إخفاء الـ toast بعد 5 ثواني
      setTimeout(() => setToast(null), 5000);
    });

    unsubscribeRef.current = unsubscribe;

    // ✅ استقبال رسائل الـ Service Worker (background notifications)
    const swMessageHandler = (event) => {
      if (event.data?.type === "NEW_REQUEST") {
        // تحقق من الـ login
        if (!localStorage.getItem("token")) return;

        console.log("📩 SW Message: New request received");
        fetchRequests();
      }
    };

    navigator.serviceWorker.addEventListener("message", swMessageHandler);

    // نرجع دالة cleanup تشمل الـ SW listener كمان
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      navigator.serviceWorker.removeEventListener("message", swMessageHandler);
    };
  };

  // ─── useEffect ─────────────────────────────────────────
  useEffect(() => {
    fetchRequests();

    // ✅ requestPermission بيتحقق داخلياً من الـ login
    requestPermission();

    // ✅ تسجيل الـ listeners والحصول على دالة الـ cleanup
    const cleanup = setupNotifications();

    // ✅ Cleanup عند unmount الـ component
    return () => {
      cleanup();
    };
  }, []);

  // ─── الـ JSX (بدون أي تعديل) ──────────────────────────
  return (
    <div style={{
      backgroundColor: 'transparent',
      minHeight: '100vh',
      width: '100%',
      padding: '36px 24px 60px',
      background: 'linear-gradient(145deg, #EBF1FF 0%, #F4F7FC 50%, #E8F4F2 100%)',
      backgroundAttachment: 'fixed',
      position: 'relative',
    }}>

      {/* Background decoration */}
      <div style={{
        position: 'fixed', top: -200, right: -200,
        width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(26,110,255,0.06)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -150, left: -150,
        width: 400, height: 400, borderRadius: '50%',
        background: 'rgba(0,201,167,0.06)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 40 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="notification-toast"
            onClick={() => toast.id && navigate('/request-details', { state: { request: { id: toast.id } } })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>🔔</span>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>{toast.title}</strong>
                <p style={{ margin: '3px 0 0', fontSize: '13px', opacity: 0.8 }}>{toast.body}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: '28px', color: '#0A1628', fontWeight: '900' }}>
              طلبات التسجيل
            </h1>
            <p style={{ color: '#6B7FA3', fontSize: '14px', fontWeight: '500', marginTop: '6px' }}>
              مراجعة وإدارة طلبات انضمام مزودي الخدمة
            </p>
          </div>

          {/* Logout */}
          <motion.div
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,71,87,0.08)',
              border: '1px solid rgba(255,71,87,0.18)',
              borderRadius: '50px',
              padding: '10px 18px',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF4757" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ color: '#FF4757', fontWeight: '800', fontSize: '14px' }}>خروج</span>
          </motion.div>
        </motion.div>

        {/* ── Stats Bar ── */}
        <StatsBar count={allRequests.length} loading={loading} />

        {/* ── Grid ── */}
        <motion.div
          className="requests-grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.07, delayChildren: 0.1 }
            }
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <RequestSkeleton key={i} />)
            : allRequests.map((req) => {
              const specStyle = getSpecialtyStyle(req.specialty);
              return (
                <Card
                  key={req.id}
                  onClick={() => navigate('/request-details', { state: { request: req } })}
                  style={{ padding: '28px 22px', textAlign: 'center' }}
                >
                  <div style={{
                    position: 'absolute', top: 16, left: 16,
                    width: '9px', height: '9px', borderRadius: '50%',
                    background: '#C9A84C',
                    boxShadow: '0 0 0 3px rgba(201,168,76,0.2)',
                  }} />

                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '14px' }}>
                    <div style={{
                      width: '88px', height: '88px',
                      borderRadius: '24px',
                      background: 'linear-gradient(135deg, #EBF1FF, #E8F4F2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 6px 18px rgba(10,22,40,0.10)',
                      border: '2px solid rgba(255,255,255,0.9)',
                    }}>
                      <img
                        src={req.profilePictureUrl || doctorImg}
                        alt="Doctor"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{
                      position: 'absolute', bottom: -4, right: -4,
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1A6EFF, #00C9A7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 3px 8px rgba(26,110,255,0.35)',
                      border: '2px solid #fff',
                    }}>
                      <span style={{ fontSize: '11px' }}>🏥</span>
                    </div>
                  </div>

                  <h3 style={{
                    fontSize: '17px', color: '#0A1628',
                    margin: '0 0 6px', fontWeight: '800',
                    letterSpacing: '-0.2px',
                  }}>
                    {req.name}
                  </h3>

                  <span style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    color: specStyle.text,
                    fontWeight: '700',
                    backgroundColor: specStyle.bg,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    marginBottom: '16px',
                    letterSpacing: '0.3px',
                  }}>
                    {req.specialty}
                  </span>

                  <div style={{
                    fontSize: '11px', color: '#A0AEC0',
                    fontWeight: '600', marginBottom: '18px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '5px',
                  }}>
                    <span>📅</span> {req.date}
                  </div>

                  <Button
                    style={{
                      padding: '11px 14px',
                      fontSize: '14px',
                      borderRadius: '14px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/request-details', { state: { request: req } });
                    }}
                  >
                    مراجعة الطلب ←
                  </Button>
                </Card>
              );
            })}
        </motion.div>

        {/* Empty state */}
        {!loading && allRequests.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '28px',
              border: '1px dashed rgba(26,110,255,0.2)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: '#0A1628', fontWeight: '800', marginBottom: '8px' }}>لا توجد طلبات حالياً</h3>
            <p style={{ color: '#6B7FA3', fontSize: '14px' }}>سيظهر هنا طلبات التسجيل الجديدة تلقائياً</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}