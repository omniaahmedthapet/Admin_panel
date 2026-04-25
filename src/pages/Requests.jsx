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

/* ══════════════════════════════════════════
   🔔 BEAUTIFUL TOAST NOTIFICATION COMPONENT
   ══════════════════════════════════════════ */
function NotificationToast({ toast, onClose, onNavigate }) {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    setProgress(100);

    // شريط التقدم
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - (100 / 50); // 5 ثواني = 50 خطوة × 100ms
      });
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [toast]);

  if (!toast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 120, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.85, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => {
        if (toast.id) onNavigate(toast.id);
        onClose();
      }}
      style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        zIndex: 99999,
        cursor: 'pointer',
        userSelect: 'none',
        width: '340px',
      }}
    >
      {/* الكارد الرئيسي */}
      <div style={{
        background: 'linear-gradient(135deg, #0A1628 0%, #102040 100%)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 24px 60px rgba(10,22,40,0.45), 0 0 0 1px rgba(26,110,255,0.25)',
        position: 'relative',
      }}>

        {/* خلفية زخرفية */}
        <div style={{
          position: 'absolute',
          top: -30, right: -30,
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,110,255,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -20, left: 10,
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,201,167,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* المحتوى */}
        <div style={{
          padding: '18px 20px 14px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* الهيدر */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            marginBottom: '10px',
          }}>
            {/* أيقونة الجرس مع نبضة */}
            <motion.div
              animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #1A6EFF, #00C9A7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 6px 20px rgba(26,110,255,0.4)',
                fontSize: '20px',
              }}
            >
              🔔
            </motion.div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(26,110,255,0.2)',
                border: '1px solid rgba(26,110,255,0.35)',
                borderRadius: '20px',
                padding: '2px 10px',
                marginBottom: '5px',
              }}>
                <span style={{
                  width: '6px', height: '6px',
                  borderRadius: '50%',
                  background: '#00C9A7',
                  boxShadow: '0 0 6px #00C9A7',
                  display: 'inline-block',
                }} />
                <span style={{
                  fontSize: '10px',
                  color: '#A0C4FF',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                  fontFamily: 'Tajawal, sans-serif',
                }}>
                  MediCall Admin
                </span>
              </div>

              <div style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#FFFFFF',
                lineHeight: 1.3,
                fontFamily: 'Tajawal, sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {toast.title}
              </div>
            </div>

            {/* زرار الإغلاق */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '8px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '14px',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              ✕
            </motion.button>
          </div>

          {/* النص */}
          <p style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 14px',
            fontFamily: 'Tajawal, sans-serif',
            lineHeight: 1.5,
            paddingRight: '58px',
          }}>
            {toast.body}
          </p>

          {/* زرار المراجعة */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, #1A6EFF, #0052CC)',
              borderRadius: '12px',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(26,110,255,0.35)',
            }}
          >
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#fff',
              fontFamily: 'Tajawal, sans-serif',
            }}>
              مراجعة الطلب
            </span>
            <span style={{ fontSize: '16px' }}>←</span>
          </motion.div>
        </div>

        {/* شريط التقدم */}
        <div style={{
          height: '3px',
          background: 'rgba(255,255,255,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #1A6EFF, #00C9A7)',
              boxShadow: '0 0 8px rgba(26,110,255,0.6)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
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

/* ══════════════════════════════════════════
   MAIN REQUESTS COMPONENT
   ══════════════════════════════════════════ */
export default function Requests() {
  const navigate = useNavigate();
  const [allRequests, setAllRequests] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ─── Fetch Requests ────────────────────────────────────
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
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

  // ─── إظهار الـ Toast ───────────────────────────────────
  const showToast = (toastData) => {
    // امسح الـ timer القديم لو موجود
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast(toastData);

    // إخفاء بعد 5 ثواني
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // ─── Logout ────────────────────────────────────────────
  const handleLogout = async () => {
    // إخفاء أي toast موجود فوراً
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    // إلغاء الـ listener فوراً قبل أي حاجة تانية
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      await cleanupNotifications();

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
      localStorage.removeItem("token");
      localStorage.removeItem("fcmToken");
      localStorage.removeItem("medicall_browser_id");
      navigate('/');
    }
  };

  // ─── إعداد الـ Notifications ───────────────────────────
  const setupNotifications = () => {
    // Foreground listener (الصفحة مفتوحة)
    const unsubscribe = onMessageListener((payload) => {
      // تأكد إن المستخدم لسه logged in
      if (!localStorage.getItem("token")) return;

      showToast({
        type: 'info',
        title: payload.notification?.title || "طلب تسجيل جديد",
        body: payload.notification?.body || "تم إضافة طلب جديد، راجعه الآن",
        id: payload.data?.id
      });

      // ✅ ريلود الطلبات تلقائياً
      fetchRequests();
    });
    unsubscribeRef.current = unsubscribe;

    // Background/SW message listener
    const swMessageHandler = (event) => {
      if (event.data?.type === "NEW_REQUEST") {
        if (!localStorage.getItem("token")) return;
        console.log("📩 SW Message: New request received");
        // ✅ ريلود الطلبات تلقائياً من الـ SW
        fetchRequests();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener("message", swMessageHandler);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener("message", swMessageHandler);
      }
    };
  };

  // ─── useEffect ─────────────────────────────────────────
  useEffect(() => {
    fetchRequests();
    requestPermission();
    const cleanup = setupNotifications();

    return () => {
      cleanup();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ─── JSX ───────────────────────────────────────────────
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

      {/* ══ BEAUTIFUL TOAST NOTIFICATION ══ */}
      <AnimatePresence>
        {toast && (
          <NotificationToast
            toast={toast}
            onClose={() => {
              setToast(null);
              if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            }}
            onNavigate={(id) => navigate('/request-details', { state: { request: { id } } })}
          />
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
