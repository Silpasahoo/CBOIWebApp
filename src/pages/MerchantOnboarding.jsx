import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { API_URLS, getHeaders } from '../api/apiClient';

const MerchantOnboarding = () => {
  const auth = useAuth();

  const initialFormData = {
    entityId: "centralbank",
    mobileNo: "9292123456",
    paymentAddress: "9292123456@cbin",
    merchantAccountNo: "9292123456",
    accountType: "CURRENT",
    ifsc: "CBINO908392",
    merchantLegalName: "Test User",
    channelId: "UPI",
    mcc: "9399",
    gstIn: "27ABCDE1234F1Z8",
    storeId: "123459",
    merchantGenre: "OFFLINE",
    onboardingType: "BANK",
    isVerified: "N",
    address: "Patia, Bhubaneswar",
    city: "Bhubaneswar",
    state: "Odisha",
    pincode: 751031
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pincode' ? parseInt(value) || '' : value
    }));
  };

  const clearStatus = () => {
    setStatusMsg(null);
    setValidationErrors([]);
  };

  const handleOnboard = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearStatus();

    try {
      const response = await axios.post(API_URLS.MERCHANT_ONBOARD, formData, {
        headers: getHeaders(auth.user?.access_token)
      });

      const payload = response.data;
      if (payload.status === 0) {
        setStatusMsg({ type: 'success', text: payload.message || 'Merchant onboarded successfully.' });
      } else {
        setStatusMsg({ type: 'error', text: payload.message || 'Onboarding failed.' });
        if (payload.error) {
          setValidationErrors(payload.error);
        }
      }
    } catch (error) {
      console.error("Onboarding Error:", error);
      setStatusMsg({ type: 'error', text: error?.response?.data?.message || 'Network Error during onboarding.' });
      if (error?.response?.data?.error) {
        setValidationErrors(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold text-cboi-blue tracking-tight mb-2">Merchant Registration</h2>
      <p className="text-gray-500 mb-8 font-medium">Bulk onboard merchants with automated profile provisioning.</p>

      <div className="glass-panel p-8 md:p-10 border-t-4 border-t-cboi-orange shadow-lg relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-cboi-blue/5 rounded-full blur-3xl pointer-events-none"></div>

        {statusMsg && (
          <div className={`mb-8 p-4 rounded-xl text-sm font-medium flex flex-col gap-2 shadow-sm animate-in zoom-in-95 ${statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <div className="flex items-center gap-3">
              {statusMsg.type === 'success' ? (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
              <p className="font-bold text-base">{statusMsg.text}</p>
            </div>

            {validationErrors.length > 0 && (
              <div className="mt-2 bg-white/50 p-3 rounded-lg border border-red-100">
                <ul className="text-xs list-none space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span><span className="font-bold uppercase tracking-wider text-[10px] bg-red-100 px-1 py-0.5 rounded">{err.path}</span> {err.msg}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleOnboard} className="relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 mb-8 group">

            {/* Generating form fields dynamically from initial structure */}
            {Object.keys(initialFormData).map((field) => (
              <div key={field} className="relative">
                <label className="form-label mb-1.5 flex justify-between items-center bg-transparent">
                  <span>{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {field !== 'gstIn' && <span className="text-cboi-orange text-xs font-bold px-1.5 py-0.5 rounded-sm bg-orange-50">*</span>}
                </label>
                <input
                  type={field === 'pincode' ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  required={field !== 'gstIn'}
                  className="input-field h-12 bg-white hover:bg-gray-50/50 shadow-sm focus:shadow-md transition-all duration-200 border-gray-200"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-gray-200/60 pt-8 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full md:w-auto min-w-[200px] h-14 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantOnboarding;
