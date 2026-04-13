const VARIANTS = {
  success: { bg: '#DCFCE7', color: '#16A34A' },
  warning: { bg: '#FEF3C7', color: '#D97706' },
  error: { bg: '#FEE2E2', color: '#DC2626' },
  info: { bg: '#E0F2FE', color: '#0369A1' },
  primary: { bg: '#E6F4EE', color: '#006B40' },
  default: { bg: '#F1F5F9', color: '#4A6358' },
};

const Badge = ({ label, variant = 'default', dot = false }) => {
  const style = VARIANTS[variant] || VARIANTS.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: style.bg,
        color: style.color,
        letterSpacing: '0.02em',
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: style.color,
            display: 'inline-block',
          }}
        />
      )}
      {label}
    </span>
  );
};

export default Badge;
