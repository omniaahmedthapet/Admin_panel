export default function RequestSkeleton() {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #e8edf5 0%, #f5f7fc 50%, #e8edf5 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.6s infinite',
    borderRadius: '12px',
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      {/* Avatar placeholder */}
      <div style={{
        ...shimmerStyle,
        width: '88px',
        height: '88px',
        borderRadius: '22px',
        flexShrink: 0,
      }} />

      {/* Name */}
      <div style={{ ...shimmerStyle, width: '65%', height: '18px' }} />

      {/* Specialty badge */}
      <div style={{ ...shimmerStyle, width: '45%', height: '14px', borderRadius: '8px' }} />

      {/* Date */}
      <div style={{ ...shimmerStyle, width: '35%', height: '12px', borderRadius: '6px' }} />

      {/* Button */}
      <div style={{
        ...shimmerStyle,
        width: '100%',
        height: '44px',
        borderRadius: '14px',
        marginTop: '4px',
      }} />
    </div>
  );
}
