import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { API_URLS, getHeaders } from '../api/apiClient';
import { encryptRequestData, decryptResponseData } from '../utils/encrypt';
import cboiLogo from '../assets/cboi logo.png';

const QrLayout = ({ base64, type, amount }) => {
  const handleDownload = () => {
    if (!base64) return;
    const a = document.createElement("a");
    a.href = base64;
    a.download = `CBOI_Merchant_QR.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
      {type === 'dynamic' && amount && (
        <div className="text-center mb-4">
          <p className="text-gray-600 font-semibold text-sm">Amount to be Collected</p>
          <p className="text-red-500 font-bold text-xl">₹ {amount}</p>
        </div>
      )}
      
      {/* The base64 returned by the Bank API already contains the beautiful CBOI formatting! */}
      <div className="overflow-hidden relative flex flex-col items-center max-w-[340px]">
        <img src={base64} alt="CBOI Merchant QR" className="w-full h-auto object-contain drop-shadow-xl" />
      </div>

      {type === 'dynamic' && (
        <p className="mt-4 text-red-500 font-semibold text-sm">Valid till 1:29</p>
      )}

      {type === 'static' && (
        <button 
          onClick={handleDownload}
          className="mt-8 bg-[#1e67b2] hover:bg-[#154a80] text-white font-semibold px-10 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Download QR
        </button>  
      )}
    </div>
  );
};


const QRPage = () => {
  const auth = useAuth();
  
  const [qrType, setQrType] = useState('static'); // 'static' or 'dynamic'
  const [amount, setAmount] = useState('');
  
  const [qrBase64, setQrBase64] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const activeVpaId = localStorage.getItem('activeVpaId') || auth.user?.profile?.preferred_username || 'default@cbin';
  const merchantName = localStorage.getItem('authMobile') === 'Test User 92' ? 'Test User 92' : 'KRIPA SINDHU PAIRA'; // mock visual name

  const handleStaticSubmit = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setQrBase64(null);
    try {
      // Create raw unencrypted string
      const rawString = `upi://pay?pa=${activeVpaId}&pn=${encodeURIComponent(merchantName)}&cu=INR&mode=02`;
      // Backend expects encrypted RequestData using CBC encryptRequestData
      const payload = { RequestData: encryptRequestData({ qrString: rawString }) };
      
      const response = await axios.post(API_URLS.QR_TO_BASE64, payload, {
        headers: getHeaders(auth.user?.access_token || localStorage.getItem('authToken'))
      });
      
      const data = response.data;
      if (data.base64Image) {
        setQrBase64(`data:image/png;base64,${data.base64Image}`);
      } else if (data.ResponseData) {
         try {
           const decrypted = decryptResponseData(data.ResponseData);
           if (decrypted && decrypted.base64Image) setQrBase64(`data:image/png;base64,${decrypted.base64Image}`);
         } catch (e) {
           setErrorMsg("Failed to decrypt image payload from bank.");
         }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error generating static QR base64.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDynamicSubmit = async () => {
    if (!amount) {
      setErrorMsg("Amount is required for dynamic QR code.");
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setQrBase64(null);

    try {
      // 1. Generate local string since the Dynamic API is currently failing
      // We mimic the static string structure and append &am=amount for dynamic functionality
      const qrStr = `upi://pay?pa=${activeVpaId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&mode=02`;

      // 2. Convert to Base64 using secure payload
      const b64Response = await axios.post(API_URLS.QR_TO_BASE64, {
        RequestData: encryptRequestData({ qrString: qrStr })
      }, {
        headers: getHeaders(auth.user?.access_token || localStorage.getItem('authToken'))
      });

      const data = b64Response.data;
      if (data.base64Image) {
        setQrBase64(`data:image/png;base64,${data.base64Image}`);
      } else if (data.ResponseData) {
         try {
           const decrypted = decryptResponseData(data.ResponseData);
           if (decrypted && decrypted.base64Image) setQrBase64(`data:image/png;base64,${decrypted.base64Image}`);
         } catch (e) {
           setErrorMsg("Failed to decrypt dynamic image payload from bank.");
         }
      }

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error generating dynamic QR flow.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">QR Details</h2>

      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <p className="text-sm font-medium text-gray-500 mb-6">Select The Type of QR</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={qrType === 'static'}
                onChange={() => { setQrType('static'); setQrBase64(null); setErrorMsg(null); }}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">Static</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                checked={qrType === 'dynamic'}
                onChange={() => { setQrType('dynamic'); setQrBase64(null); setErrorMsg(null); }}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 font-medium">Dynamic</span>
            </label>
          </div>

          {qrType === 'static' && (
            <button 
              onClick={handleStaticSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Submit'}
            </button>
          )}
        </div>

        {qrType === 'dynamic' && (
          <div className="mt-8 animate-in slide-in-from-top-2">
            <p className="text-sm font-medium text-gray-400 mb-6">Enter an amount to instantly generate your dynamic QR code</p>
            
            <div className="flex items-end gap-4">
               <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Amount to be collected</label>
                  <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter the amount to be collected"
                    className="w-80 border border-gray-200 rounded p-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  />
               </div>
               <button 
                  onClick={handleDynamicSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
               >
                 {isLoading ? 'Generating...' : 'Generate QR'}
               </button>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Presentation Field */}
      {(qrBase64 || isLoading) && (
        <div className="bg-white border rounded-xl shadow-sm p-10 flex flex-col items-center justify-center min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center">
               <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="text-blue-600 font-medium">Rendering Board...</span>
            </div>
          ) : (
            <QrLayout 
              type={qrType} 
              base64={qrBase64} 
              merchantName={merchantName} 
              vpaId={activeVpaId} 
              amount={amount} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default QRPage;
