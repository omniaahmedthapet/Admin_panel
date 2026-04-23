import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';

import doctorImg from '../assets/doctor_girl.png';
import certImg from '../assets/download.jpg';

/* ── Info chip component ── */
function InfoChip({ icon, label, value }) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(26,110,255,0.12), rgba(0,201,167,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#A0AEC0', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
          <div style={{
            fontSize: '15px', color: '#0A1628', fontWeight: '800',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {value || '—'}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function RequestDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestFromList = location.state?.request;
  const requestIdFromUrl = searchParams.get("id");
  const requestId = requestFromList?.id || requestIdFromUrl;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ─── Logic unchanged ───────────────────────
  const fetchDetails = async () => {
    if (!requestId) { setLoading(false); return; }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/Admin/ProviderDetails/${requestId}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (err) { console.error("❌ Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDetails(); }, [requestId]);

  const handleAction = async (status, finalReason = "") => {
    if (status === "rejected" && !finalReason.trim()) {
      alert("يجب كتابة سبب للرفض");
      return;
    }
    const endpoint = status === "accepted"
      ? `/api/Admin/ApproveProvider/${requestId}`
      : `/api/Admin/RejectProvider/${requestId}`;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(finalReason || "")
      });
      if (response.ok) {
        setToast({
          type: status === "accepted" ? "success" : "error",
          message: status === "accepted" ? "تم تفعيل الحساب بنجاح ✅" : "تم رفض الطلب ❌"
        });
        setShowRejectModal(false);
        setTimeout(() => navigate('/requests'), 2200);
      }
    } catch (err) { console.error("❌ Error:", err); }
  };
  // ──────────────────────────────────────────

  if (loading) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(145deg, #EBF1FF 0%, #F4F7FC 100%)',
      gap: '18px',
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid rgba(26,110,255,0.15)',
          borderTopColor: '#1A6EFF',
        }}
      />
      <span style={{ color: '#6B7FA3', fontWeight: '600', fontSize: '15px' }}>جاري التحميل...</span>
    </div>
  );

  const displayData = details || requestFromList;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #EBF1FF 0%, #F4F7FC 50%, #E8F4F2 100%)',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      padding: '24px 0 130px',
    }}>

      {/* Bg decorations */}
      <div style={{
        position: 'fixed', top: -150, right: -150, width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(26,110,255,0.06)',
        filter: 'blur(70px)', pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              background: toast.type === 'success'
                ? 'linear-gradient(135deg, #00C9A7, #00A88A)'
                : 'linear-gradient(135deg, #FF4757, #C0392B)',
              color: 'white', padding: '14px 32px',
              borderRadius: '20px', zIndex: 10001,
              fontWeight: '800', fontSize: '16px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
              display: 'flex', alignItems: 'center', gap: '10px',
              whiteSpace: 'nowrap',
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ maxWidth: '660px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
        >
          <div>
            <h1 style={{ fontSize: '24px', color: '#0A1628', fontWeight: '900', margin: 0 }}>مراجعة البيانات</h1>
            <p style={{ color: '#6B7FA3', fontSize: '13px', fontWeight: '500', marginTop: '4px' }}>
              تحقق من بيانات مزود الخدمة قبل الموافقة
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/requests')}
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid rgba(26,110,255,0.15)',
              color: '#6B7FA3', padding: '9px 18px',
              borderRadius: '14px', cursor: 'pointer',
              fontWeight: '700', fontSize: '14px',
              fontFamily: "'Tajawal', sans-serif",
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 10px rgba(10,22,40,0.07)',
            }}
          >
            ← رجوع
          </motion.button>
        </motion.div>

        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <Card style={{ padding: '32px 24px', textAlign: 'center', marginBottom: '1.5rem' }}>
            {/* Gradient header strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '80px',
              background: 'linear-gradient(135deg, rgba(26,110,255,0.08) 0%, rgba(0,201,167,0.06) 100%)',
              borderRadius: '24px 24px 0 0',
            }} />

            <div style={{ position: 'relative' }}>
              {/* Avatar */}
              <div style={{ display: 'inline-block', position: 'relative', marginBottom: '16px' }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '34px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 32px rgba(10,22,40,0.14)',
                  border: '4px solid rgba(255,255,255,0.95)',
                  background: '#EBF1FF',
                }}>
                  <img
                    src={displayData.profilePictureUrl || doctorImg}
                    alt="Doctor"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                {/* Pending badge */}
                <div style={{
                  position: 'absolute', bottom: -6, right: -6,
                  background: 'linear-gradient(135deg, #C9A84C, #F0D980)',
                  borderRadius: '12px', padding: '4px 10px',
                  fontSize: '11px', fontWeight: '800', color: '#5A4200',
                  boxShadow: '0 4px 12px rgba(201,168,76,0.35)',
                  border: '2px solid #fff',
                }}>
                  ⏳ قيد المراجعة
                </div>
              </div>

              <h2 style={{ fontSize: '24px', color: '#0A1628', fontWeight: '900', margin: '0 0 8px' }}>
                {displayData.name}
              </h2>
              <span style={{
                display: 'inline-block',
                fontSize: '13px', color: '#1A6EFF', fontWeight: '700',
                backgroundColor: 'rgba(26,110,255,0.09)',
                padding: '6px 18px', borderRadius: '20px',
              }}>
                🏥 {displayData.specialty}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* Info chips grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '1.8rem' }}
        >
          <InfoChip icon="📞" label="رقم التواصل" value={displayData.phoneNumber} />
          <InfoChip icon="🪪" label="كود التعريف" value={`#${displayData.id}`} />
        </motion.div>

        {/* Certificates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 style={{
            fontSize: '17px', color: '#0A1628',
            fontWeight: '900', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '30px', height: '30px', borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(26,110,255,0.12), rgba(0,201,167,0.08))',
              fontSize: '15px',
            }}>📄</span>
            المستندات والشهادات
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {displayData.certificates?.length ? (
              displayData.certificates.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + index * 0.07, type: 'spring', stiffness: 200 }}
                >
                  <Card style={{ height: '155px', overflow: 'hidden' }}>
                    <img
                      src={cert.url || cert.imageUrl || certImg}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      alt={`Cert ${index + 1}`}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(10,22,40,0.5))',
                      padding: '20px 12px 10px',
                    }}>
                      <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700', opacity: 0.9 }}>
                        شهادة {index + 1}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center', padding: '2.5rem',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '18px',
                border: '1px dashed rgba(26,110,255,0.2)',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
                <p style={{ color: '#A0AEC0', fontWeight: '600', fontSize: '14px' }}>لا توجد ملفات مرفقة</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Action bar ── */}
      <div style={{
        position: 'fixed', bottom: '20px', left: '50%',
        transform: 'translateX(-50%)',
        width: '92%', maxWidth: '520px',
        display: 'flex', gap: '12px',
        padding: '14px 16px',
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '28px',
        boxShadow: '0 16px 50px rgba(10,22,40,0.14)',
        border: '1px solid rgba(255,255,255,0.8)',
        zIndex: 999,
      }}>
        <Button
          color="primary"
          style={{ flex: 2, height: '52px', borderRadius: '18px', fontSize: '15px' }}
          onClick={() => handleAction("accepted")}
        >
          ✅ تفعيل الحساب
        </Button>
        <Button
          color="secondary"
          style={{
            flex: 1, height: '52px', borderRadius: '18px',
            background: 'rgba(255,71,87,0.09)',
            color: '#FF4757',
            boxShadow: 'none',
            fontSize: '14px',
          }}
          onClick={() => setShowRejectModal(true)}
        >
          ❌ رفض
        </Button>
      </div>

      {/* ── Reject Modal ── */}
      <AnimatePresence>
        {showRejectModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 20000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(10,22,40,0.4)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal */}
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              style={{
                position: 'relative',
                background: '#FFFFFF',
                width: '90%', maxWidth: '420px',
                padding: '32px 28px',
                borderRadius: '32px',
                boxShadow: '0 30px 70px rgba(10,22,40,0.22)',
              }}
            >
              {/* Top accent */}
              <div style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: '3px',
                background: 'linear-gradient(90deg, #FF4757, #C0392B)',
                borderRadius: '0 0 4px 4px',
              }} />

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>⚠️</div>
                <h3 style={{ margin: 0, color: '#0A1628', fontWeight: '900', fontSize: '20px' }}>سبب الرفض</h3>
                <p style={{ color: '#6B7FA3', fontSize: '13px', marginTop: '6px', fontWeight: '500' }}>
                  يرجى توضيح سبب رفض الطلب لإعلام مزود الخدمة
                </p>
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اكتب سبب الرفض هنا..."
                style={{
                  width: '100%', height: '110px',
                  borderRadius: '18px',
                  border: `1.5px solid ${rejectReason ? 'rgba(255,71,87,0.3)' : 'rgba(26,110,255,0.15)'}`,
                  padding: '14px 16px',
                  fontSize: '14px', outline: 'none',
                  resize: 'none',
                  backgroundColor: '#FAFBFF',
                  fontFamily: "'Tajawal', sans-serif",
                  color: '#0A1628', fontWeight: '500',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                <Button
                  style={{ flex: 2, height: '50px', borderRadius: '16px' }}
                  onClick={() => handleAction("rejected", rejectReason)}
                >
                  تأكيد الرفض
                </Button>
                <Button
                  style={{
                    flex: 1, height: '50px', borderRadius: '16px',
                    background: '#F4F7FC', color: '#6B7FA3',
                    boxShadow: 'none',
                  }}
                  onClick={() => setShowRejectModal(false)}
                >
                  إلغاء
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
