import loginPageImg from '../../assets/LoginPage.png';
const SIZES = {
  sm: 32,
  md: 44,
  lg: 60,
  xl: 76,
};

const LoginPage = ({ size = 'md', showBanner = true, style = {} }) => {
  const height = SIZES[size] ?? SIZES.md;

  const img = (
    <img
      src={loginPageImg}
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

export default LoginPage;
