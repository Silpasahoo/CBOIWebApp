import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { Shield, Activity, FileText } from 'lucide-react';
import CBOILogo from '../components/common/CBOILogo';
import LoginPage from '../components/common/LoginPage';

const Landing = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSignIn = () => {
    auth.signinRedirect();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
      <div className="w-full max-w-5xl bg-[#0b3b60] md:bg-transparent flex flex-col md:flex-row overflow-hidden shadow-2xl rounded-2xl mx-4">

        {/* Left Side */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-[#082e4d] p-0">
          <div className="flex flex-col items-center justify-center bg-white/95 rounded-2xl shadow-xl p-10 mt-16 mb-16 w-[90%] max-w-md">
            <CBOILogo size="xl" showBanner={false} style={{ height: 120 }} />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-[#0b3b60] mb-2">Central Bank of India</h2>
              <p className="text-[#666] text-base font-medium">Empowering Merchants Across India</p>
            </div>
          </div>
        </div>


        <div className="w-full md:w-1/2 bg-white p-10 flex flex-col justify-center">
          <div className="mb-8">
            <div className="border inline-block border-gray-200 p-2 rounded mb-6 mt-4">
              <span className="text-[#0b3b60] font-bold text-lg tracking-tighter flex items-center gap-2">
                <LoginPage size="xl" showBanner={false} style={{ height: 60 }} />
                CBOI BANK
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
            <p className="text-sm text-gray-500 mt-1">You'll be redirected to CBOI's secure login page</p>
          </div>

          <button
            onClick={handleSignIn}
            className="w-full bg-[#0b3b60] hover:bg-[#0d4a7a] text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >

            Sign in with CBOI &rarr;
          </button>

          <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4">How it works</h3>
            <ol className="text-xs text-gray-500 space-y-3 list-decimal list-inside">
              <li>Click <strong>Sign in with CBOI</strong></li>
              <li>Enter your mobile number & password on the next screen</li>
              <li>You'll be returned here automatically</li>
            </ol>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-2 rounded-lg flex items-center">
                <CBOILogo size="sm" showBanner={false} style={{ height: 28, marginRight: 8 }} />
                <span className="text-[#0b3b60] font-bold text-xs ml-2">CBOI Bank</span>
              </div>
              <span className="text-sm font-medium opacity-90">Instant Report Generation & Export</span>
            </div>
          </div>

          <div className="mt-8 text-center flex flex-col items-center gap-1 opacity-70">
            <p className="text-[10px] text-gray-500 font-medium">Secured by Central Bank of India • Powered by iServeU</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Shield className="w-3 h-3 text-[#f08c00]" />
              OAuth 2.0 + PKCE Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
