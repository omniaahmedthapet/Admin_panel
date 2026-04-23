import React, { useState } from 'react';

export default function Input({ placeholder, type = "text", icon, value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: '18px',
      padding: '0.9rem 1.4rem',
      marginBottom: '1rem',
      border: `1.5px solid ${focused ? '#1A6EFF' : 'rgba(26, 110, 255, 0.12)'}`,
      boxShadow: focused
        ? '0 0 0 4px rgba(26, 110, 255, 0.10), 0 2px 8px rgba(10,22,40,0.05)'
        : '0 2px 8px rgba(10, 22, 40, 0.05)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: focused ? 'translateY(-1px)' : 'none',
      opacity: disabled ? 0.6 : 1,
    }}>
      {icon && (
        <span style={{
          marginLeft: '12px',
          color: focused ? '#1A6EFF' : '#A0AEC0',
          transition: 'color 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          border: 'none',
          backgroundColor: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: '1rem',
          color: '#0A1628',
          fontFamily: "'Tajawal', sans-serif",
          fontWeight: '500',
        }}
      />
    </div>
  );
}
