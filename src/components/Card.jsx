import React from 'react';
import { motion } from "framer-motion";

export default function Card({ children, style, className = "", onClick }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { type: "spring", stiffness: 260, damping: 20 }
        }
      }}
      whileHover={onClick ? {
        y: -8,
        scale: 1.02,
        boxShadow: "0 24px 50px rgba(26, 110, 255, 0.14)",
        transition: { type: "spring", stiffness: 300, damping: 18 }
      } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`card ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: '0 4px 20px rgba(10, 22, 40, 0.07)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'border-color 0.3s ease',
        ...style
      }}
    >
      {/* Top shimmer line */}
      <span style={{
        position: 'absolute',
        top: 0, left: '15%', right: '15%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(26,110,255,0.25), transparent)',
        pointerEvents: 'none',
      }} />
      {children}
    </motion.div>
  );
}
