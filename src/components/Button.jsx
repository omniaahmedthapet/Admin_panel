import React from 'react';

export default function Button({ children, onClick, color = 'primary', style, disabled }) {
  const isPrimary = color === 'primary';

  const base = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    borderRadius: '18px',
    padding: '13px 26px',
    fontSize: '1rem',
    fontWeight: '800',
    fontFamily: "'Tajawal', sans-serif",
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: '100%',
    letterSpacing: '0.3px',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    overflow: 'hidden',
    opacity: disabled ? 0.6 : 1,
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const primary = {
    background: 'linear-gradient(135deg, #1A6EFF 0%, #0052CC 100%)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(26, 110, 255, 0.30)',
  };

  const secondary = {
    background: 'linear-gradient(135deg, #FF4757 0%, #C0392B 100%)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(255, 71, 87, 0.28)',
  };

  const computed = { ...base, ...(isPrimary ? primary : secondary), ...style };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
    e.currentTarget.style.boxShadow = isPrimary
      ? '0 14px 35px rgba(26, 110, 255, 0.38)'
      : '0 14px 35px rgba(255, 71, 87, 0.35)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = isPrimary
      ? '0 6px 20px rgba(26, 110, 255, 0.30)'
      : '0 6px 20px rgba(255, 71, 87, 0.28)';
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = 'translateY(1px) scale(0.99)';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={computed}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Shine overlay */}
      <span style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.16) 0%, transparent 100%)',
        borderRadius: 'inherit',
        pointerEvents: 'none',
      }} />
      {children}
    </button>
  );
}
