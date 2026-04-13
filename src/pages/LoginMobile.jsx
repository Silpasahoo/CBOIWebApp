import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import LoginPage from '../components/common/LoginPage';

const LoginMobile = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');

  const handleContinue = (e) => {
    e.preventDefault();
    if (mobile.length === 10) {
      localStorage.setItem('tempMobile', mobile);
      navigate('/login-vpa');
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px] flex flex-col items-center">
        
        <div className="border border-gray-200 p-2 rounded mb-6 text-center">
          <span className="text-[#0b3b60] font-bold tracking-tighter flex items-center gap-2">
            <LoginPage size="xl" showBanner={false} style={{ height: 60 }} />
            CBOI BANK
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-1">Verify Your Account</h2>
        <p className="text-xs text-gray-500 mb-8 text-center">Enter your registered mobile number to continue</p>
        
        <form onSubmit={handleContinue} className="w-full">
          <label className="block text-xs font-bold text-gray-700 mb-2">Mobile Number</label>
          <div className="relative mb-6 text-gray-400 focus-within:text-[#0b3b60]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Smartphone className="w-4 h-4" />
            </div>
            <input 
              type="tel" 
              maxLength="10"
              placeholder="Enter 10-digit mobile number" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 focus:border-[#0b3b60] transition-colors"
            />
          </div>
          
          <button 
            type="submit"
            disabled={mobile.length !== 10}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${mobile.length === 10 ? 'bg-[#bdd3c7] hover:bg-[#a6bfb1] text-[#0b3b60]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Continue &rarr;
          </button>
        </form>
        
      </div>
    </div>
  );
};

export default LoginMobile;
