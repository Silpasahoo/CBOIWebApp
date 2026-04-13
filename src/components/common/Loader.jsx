const Loader = ({ size = 40, color = '#006B40', text = '' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(0,107,64,0.12)`,
        borderTop: `3px solid ${color}`,
        borderRadius: '50%',
        animation: 'idbi-spin 0.75s linear infinite',
      }}
    />
    {text && (
      <span style={{ fontSize: 13, color: '#4A6358', fontWeight: 500 }}>{text}</span>
    )}
    <style>{`@keyframes idbi-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
    }}
  >
    <Loader size={48} text="Loading..." />
  </div>
);

export default Loader;
