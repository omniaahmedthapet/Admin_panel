import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import logoImg from '../assets/Vector.png';
import { MdEmail, MdLock } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

/* ── Decorative floating blob ── */
function Blob({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(60px)',
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

/* ── Small stat badge ── */
function StatBadge({ icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      style={{
        position: 'absolute',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '16px',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 8px 24px rgba(10,22,40,0.10)',
        border: '1px solid rgba(255,255,255,0.8)',
        ...style,
      }}
    >
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '10px', color: '#6B7FA3', fontWeight: '600', lineHeight: 1 }}>{label}</div>
        <div style={{ fontSize: '14px', color: '#0A1628', fontWeight: '800', lineHeight: 1.4 }}>{value}</div>
      </div>
    </motion.div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Logic unchanged ───────────────────────
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/Authentication/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.detail || "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        setLoading(false);
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("fullName", data.fullName);
      navigate("/requests");
    } catch (err) {
      setError("تعذر الاتصال بالسيرفر، تأكد من اتصال الإنترنت.");
    } finally {
      setLoading(false);
    }
  };
  // ──────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #EBF1FF 0%, #F4F7FC 50%, #E8F4F2 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Background blobs ── */}
      <Blob style={{ width: 520, height: 520, background: 'rgba(26,110,255,0.09)', top: -180, right: -180 }} />
      <Blob style={{ width: 380, height: 380, background: 'rgba(0,201,167,0.08)', bottom: -100, left: -80 }} />
      <Blob style={{ width: 200, height: 200, background: 'rgba(201,168,76,0.06)', top: '40%', left: '5%' }} />

      {/* ── Decorative grid dots ── */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.04 }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#1A6EFF" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* ── Left Branding Panel (desktop) ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          position: 'relative',
          display: 'none',
        }}
        className="login-brand-panel"
      >
      </motion.div>

      {/* ── Login Card ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        width: '100%',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.1] }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <Card style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>

            {/* Top accent bar */}
            <div style={{
              position: 'absolute',
              top: 0, left: '20%', right: '20%',
              height: '3px',
              background: 'linear-gradient(90deg, #1A6EFF, #00C9A7)',
              borderRadius: '0 0 4px 4px',
            }} />

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, type: 'spring', stiffness: 140 }}
              style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
            >
              <div style={{
                position: 'relative',
                width: '110px',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {/* Spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    borderTopColor: 'rgba(26,110,255,0.4)',
                    borderRightColor: 'rgba(0,201,167,0.3)',
                  }}
                />
                {/* Glow bg */}
                <div style={{
                  position: 'absolute',
                  inset: '8px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(26,110,255,0.10) 0%, transparent 70%)',
                }} />
                <motion.img
                  src={logoImg}
                  alt="Logo"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '75px', height: '75px', objectFit: 'contain', position: 'relative', zIndex: 1 }}
                />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 style={{
                color: '#0A1628',
                marginBottom: '4px',
                fontWeight: '900',
                fontSize: '26px',
                letterSpacing: '-0.4px',
              }}>
                مرحباً بك
              </h2>
              <p style={{
                color: '#6B7FA3',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '2rem',
              }}>
                لوحة تحكم المشرف — قم بتسجيل الدخول للمتابعة
              </p>
            </motion.div>

            {/* Inputs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                placeholder="ادخل بريدك الالكتروني"
                icon={<MdEmail size={20} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Input
                placeholder="ادخل كلمة المرور"
                type="password"
                icon={<MdLock size={20} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    color: '#FF4757',
                    backgroundColor: 'rgba(255,71,87,0.08)',
                    padding: '13px 16px',
                    borderRadius: '14px',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255,71,87,0.18)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              style={{ marginTop: '0.8rem' }}
            >
              <Button
                onClick={handleLogin}
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <span style={{ display: 'flex', gap: '4px' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{
                          width: '6px', height: '6px',
                          borderRadius: '50%',
                          background: '#fff',
                          display: 'inline-block',
                          animation: `dot-pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                        }} />
                      ))}
                    </span>
                    جاري التحميل
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    🔐 تسجيل الدخول
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Bottom badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                marginTop: '2rem',
                padding: '10px',
                borderRadius: '12px',
                background: 'rgba(26,110,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>🏥</span>
              <span style={{ fontSize: '12px', color: '#6B7FA3', fontWeight: '600' }}>
                منصة طبية آمنة ومحمية
              </span>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#00C9A7',
                animation: 'pulse-glow 2s infinite',
                display: 'inline-block',
              }} />
            </motion.div>

          </Card>
        </motion.div>
      </div>

      <style>{`
        @keyframes dot-pulse {
          0%,80%,100% { transform: scale(0.6); opacity: 0.5; }
          40%         { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,201,167,0.5); }
          50%     { box-shadow: 0 0 0 6px rgba(0,201,167,0); }
        }
      `}</style>
    </div>
  );
}
