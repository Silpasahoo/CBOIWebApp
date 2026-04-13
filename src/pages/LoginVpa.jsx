import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/common/LoginPage';

const LoginVpa = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  
  useEffect(() => {
    const tempMobile = localStorage.getItem('tempMobile');
    if (!tempMobile) {
      navigate('/login-mobile');
    } else {
      setMobile(tempMobile);
    }
  }, [navigate]);

  const handleLoadDashboard = () => {
    // Set authenticated state and store the user context
    localStorage.setItem('mockAuthenticated', 'true');
    // Save mobile number for Dashboard use
    localStorage.setItem('authMobile', mobile);
    navigate('/dashboard');
  };

  const handleChangeMobile = () => {
    localStorage.removeItem('tempMobile');
    navigate('/login-mobile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[400px] flex flex-col items-center">
        
        <div className="border border-gray-200 p-2 rounded mb-6 text-center">
          <span className="text-[#0b3b60] font-bold tracking-tighter flex items-center gap-2">
            <LoginPage size="xl" showBanner={false} style={{ height: 60 }} />
            CBOI BANK</span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-1">Select VPA ID</h2>
        <div className="text-xs text-gray-500 mb-6 text-center w-full">
          Mobile: <span className="font-bold text-gray-800">+91 {mobile}</span>
          <div className="text-[10px] text-gray-400 mt-1">1 VPA ID found — select one to continue</div>
        </div>
        
        <div className="w-full mb-6">
          <label className="block text-xs font-bold text-[#0b3b60] mb-2">VPA ID (UPI Address)</label>
          <div className="relative">
            <select className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0b3b60]/20 appearance-none text-center font-medium">
              <option>cboitestuser.iserveu@cboi - Test User</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleLoadDashboard}
          className="w-full bg-[#0b3b60] hover:bg-[#0d4a7a] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all mb-3 shadow-md"
        >
          Load Dashboard &rarr;
        </button>
        
        <button 
          onClick={handleChangeMobile}
          className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 py-3 rounded-lg font-semibold flex items-center justify-center text-sm transition-all"
        >
          Change Mobile Number
        </button>
        
      </div>
    </div>
  );
};

export default LoginVpa;
