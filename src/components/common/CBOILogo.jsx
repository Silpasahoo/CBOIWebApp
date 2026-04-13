import cboiLogo from '../../assets/cboi logo.png';

const SIZES = {
  sm: 32,
  md: 44,
  lg: 60,
  xl: 76,
};

const CBOILogo = ({ size = 'md', showBanner = true, style = {} }) => {
  const height = SIZES[size] ?? SIZES.md;

  const img = (
    <img
      src={cboiLogo}
      alt="CBOI Bank"
      style={{ height, width: 'auto', display: 'block', ...style }}
    />
  );

  if (!showBanner) return img;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#006B3C',
        borderRadius: 6,
        padding: '4px 10px',
      }}
    >
      {img}
    </div>
  );
};

export default CBOILogo;
