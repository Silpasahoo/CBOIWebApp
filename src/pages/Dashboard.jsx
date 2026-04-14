import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { API_URLS, getHeaders } from '../api/apiClient';
import { encryptRequestData, decryptResponseData } from '../utils/encrypt';

const Dashboard = () => {
  const auth = useAuth();

  const [merchantList, setMerchantList] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const [showVpaModal, setShowVpaModal] = useState(false);
  const [tempSelectedVpa, setTempSelectedVpa] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [timeFilter, setTimeFilter] = useState('Today');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Dashboard Stats State
  const [stats, setStats] = useState({ count: 0, amount: 0 });
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    if (auth.isLoading) return;

    const authMobile = localStorage.getItem('authMobile');
    const username = auth.user?.profile?.preferred_username || authMobile;

    if (username) {
      const type = username.includes('@') ? 'vpa_id' : 'mobile_number';
      fetchMerchantData(type, username);
    }
  }, [auth.user, auth.isLoading]);

  // Fetch stats whenever selectedMerchant or timeFilter changes
  useEffect(() => {
    if (selectedMerchant) {
      fetchDashboardStats();
    }
  }, [selectedMerchant, timeFilter]);

  const fetchDashboardStats = async () => {
    if (!selectedMerchant) return;
    
    setStatsLoading(true);
    setStatsError(null);

    try {
      // Prepare dates in DD/MM/YYYY format
      const today = new Date();
      let queryStart, queryEnd;

      if (timeFilter === 'Today') {
        const todayStr = `${String(today.getUTCDate()).padStart(2, '0')}/${String(today.getUTCMonth() + 1).padStart(2, '0')}/${today.getUTCFullYear()}`;
        queryStart = todayStr;
        queryEnd = todayStr;
      } else if (timeFilter === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setUTCDate(today.getUTCDate() - 1);
        const yesterdayStr = `${String(yesterday.getUTCDate()).padStart(2, '0')}/${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}/${yesterday.getUTCFullYear()}`;
        queryStart = yesterdayStr;
        queryEnd = yesterdayStr;
      }

      console.log(`Fetching dashboard stats for ${timeFilter} (${queryStart} to ${queryEnd})`);

      const payload = {
        vpa_id: selectedMerchant.vpa_id,
        startDate: queryStart,
        endDate: queryEnd,
        mode: "both"
      };

      // Call Transaction Report API for stats
      const response = await axios.post(API_URLS.TRANSACTION_REPORT, payload);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const txns = response.data.data;
        const totalCount = txns.length;
        const totalAmount = txns.reduce((sum, txn) => sum + Number(txn.Transaction_Amount || 0), 0);
        
        setStats({ count: totalCount, amount: totalAmount });
      } else {
        setStats({ count: 0, amount: 0 });
      }
    } catch (error) {
      console.error('Fetch Stats Error:', error);
      setStatsError('Failed to fetch stats');
      setStats({ count: 0, amount: 0 });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMerchantData = async (type, value) => {
    if (!value) return;
    setLoading(true);
    setErrorMsg(null);
    setMerchantList([]);
    setSelectedMerchant(null);

    try {
      const payload = { [type]: value };
      const encryptedPayload = encryptRequestData(payload);

      const token = auth.user?.id_token || auth.user?.access_token;
      console.log('Sending token for FetchById:', token ? token.substring(0, 20) + '...' : 'UNDEFINED!');

      const response = await axios.post(API_URLS.FETCH_BY_ID, { RequestData: encryptedPayload }, {
        headers: getHeaders(token)
      });

      let pd = response.data;

      const encryptedResponseData = pd.ResponseData ? pd.ResponseData : pd;
      if (typeof encryptedResponseData === 'string') {
        const decryptedStr = decryptResponseData(encryptedResponseData);
        if (decryptedStr) pd = decryptedStr;
      }
      if (pd.status === 0 && pd.data && pd.data.length > 0) {
        setMerchantList(pd.data);
        setSelectedMerchant(pd.data[0]);
        localStorage.setItem('activeVpaId', pd.data[0].vpa_id);


        if (pd.data.length > 1) {
          setTempSelectedVpa(pd.data[0].vpa_id);
          setShowVpaModal(true);
        }
      } else {
        setErrorMsg(pd.message || 'No user details found.');
        if (pd.error) {
          setErrorMsg(pd.error[0]?.msg || 'Validation Error');
        }
      }
    } catch (error) {
      console.error('FetchById Error:', error);
      setErrorMsg(error?.response?.data?.message || 'Network error fetching user details.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = async () => {
    const selected = merchantList.find(m => m.vpa_id === tempSelectedVpa);
    if (!selected) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // API call to fetch selected VPA details
      const payload = { vpa_id: tempSelectedVpa };
      const encryptedPayload = encryptRequestData(payload);

      const token = auth.user?.id_token || auth.user?.access_token;
      console.log('Proceeding with VPA:', tempSelectedVpa);
      console.log('Encrypted payload for proceed:', encryptedPayload);

      const response = await axios.post(API_URLS.FETCH_BY_ID, { RequestData: encryptedPayload }, {
        headers: getHeaders(token)
      });

      let decryptedData = response.data;


      const encryptedResponseData = decryptedData.ResponseData ? decryptedData.ResponseData : decryptedData;
      if (typeof encryptedResponseData === 'string') {
        const decryptedStr = decryptResponseData(encryptedResponseData);
        if (decryptedStr) decryptedData = decryptedStr;
      }

      console.log('Decrypted proceed response:', decryptedData);

      if (decryptedData.status === 0 && decryptedData.data && decryptedData.data.length > 0) {

        const merchantData = decryptedData.data[0];
        setSelectedMerchant(merchantData);
        localStorage.setItem('activeVpaId', merchantData.vpa_id);
        localStorage.setItem('merchantCache', JSON.stringify(merchantData));

        console.log('✓ Merchant data cached successfully:', merchantData);
      } else {
        setErrorMsg(decryptedData.message || 'Could not fetch merchant details for selected VPA.');
        if (decryptedData.error) {
          setErrorMsg(decryptedData.error[0]?.msg || 'Validation Error');
        }
      }
    } catch (error) {
      console.error('Proceed error:', error);
      setErrorMsg(error?.response?.data?.message || 'Network error fetching merchant details.');
    } finally {
      setLoading(false);
      setShowVpaModal(false);
    }
  };

  const handleCancelModal = () => {
    setShowVpaModal(false);
  };

  return (
    <div className="w-full pr-4">
      <h2 className="text-xl font-semibold text-gray-800 tracking-tight mb-6">Dashboard</h2>

      {loading && (
        <div className="mb-4 flex items-center gap-3 text-cboi-blue text-sm font-medium">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your data...
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
          {errorMsg}
        </div>
      )}

      {selectedMerchant && (
        <div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-[13px] text-gray-700">
              <span className="font-semibold text-gray-900">VPA ID : </span>
              <span className="text-blue-600">{selectedMerchant.vpa_id}</span>
            </p>

            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white border border-gray-300 text-[13px] font-medium text-gray-700 px-3 py-1.5 rounded flex items-center justify-between gap-2 cursor-pointer w-[110px] select-none"
              >
                {timeFilter}
                <svg className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-md z-10 w-[110px] overflow-hidden">
                  <div
                    onClick={() => { setTimeFilter('Today'); setIsDropdownOpen(false); }}
                    className={`px-3 py-2 text-[13px] cursor-pointer border-b border-gray-100 transition-colors ${timeFilter === 'Today' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    Today
                  </div>
                  <div
                    onClick={() => { setTimeFilter('Yesterday'); setIsDropdownOpen(false); }}
                    className={`px-3 py-2 text-[13px] cursor-pointer transition-colors ${timeFilter === 'Yesterday' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'}`}
                  >
                    Yesterday
                  </div>
                </div>
              )}
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
            {statsLoading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            )}

            {/* Total No Of Transaction */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-md">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-normal">Total No Of Transaction</span>
              </div>
              <span className="text-[22px] font-bold text-gray-900">
                {stats.count > 999 ? (stats.count / 1000).toFixed(1) + 'K' : stats.count}
              </span>
            </div>

            {/* Total Amount */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-md">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-normal">Total Amount</span>
              </div>
              <span className="text-[22px] font-bold text-gray-900">
                {stats.amount.toLocaleString('en-IN')} <span className="text-sm font-normal text-gray-500">cr</span>
              </span>
            </div>

          </div>
        </div>
      )}


      {/* VPA Selection Modal Overlay */}
      {showVpaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Select VPA</h3>
              <p className="text-sm text-gray-500 mt-1">Select a VPA to Proceed</p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {merchantList.map(m => (
                  <label
                    key={m.vpa_id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${tempSelectedVpa === m.vpa_id
                        ? 'border-blue-500 bg-blue-50/30'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-300 bg-white">
                      {tempSelectedVpa === m.vpa_id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="vpa"
                      className="hidden"
                      checked={tempSelectedVpa === m.vpa_id}
                      onChange={() => setTempSelectedVpa(m.vpa_id)}
                    />
                    <span className="text-sm font-semibold text-gray-700 select-none">
                      {m.vpa_id}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-4">
              <button
                onClick={handleCancelModal}
                className="text-red-500 font-bold text-sm px-4 py-2 rounded hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded shadow-sm transition-all active:scale-95"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
