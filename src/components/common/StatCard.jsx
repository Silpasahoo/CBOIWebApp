const StatCard = ({ icon: Icon, label, value, sub, color = '#006B40', bgColor = '#E6F4EE', trend }) => (
  <div
    style={{
      background: '#FFFFFF',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      boxShadow: '0 2px 12px rgba(0,107,64,0.06)',
      border: '1px solid #E2EFEA',
      flex: 1,
      minWidth: 180,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Icon size={22} color={color} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#7A9489', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 700, color: '#1A2E24', lineHeight: 1.2 }}>
        {value}
      </p>
      {sub && (
        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#4A6358' }}>{sub}</p>
      )}
      {trend !== undefined && (
        <p
          style={{
            margin: '4px 0 0',
            fontSize: 11,
            color: trend >= 0 ? '#16A34A' : '#DC2626',
            fontWeight: 600,
          }}
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs yesterday
        </p>
      )}
    </div>
  </div>
);

export default StatCard;
