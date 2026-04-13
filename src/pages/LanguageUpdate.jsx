import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { OTHER_KEYS } from '../auth/authConfig';
import { API_URLS, getHeaders } from '../api/apiClient';
import { encryptRequestData, decryptResponseData } from '../utils/encrypt';

const LanguageUpdate = () => {
  const auth = useAuth();

  // States
  const activeVpaId = localStorage.getItem('activeVpaId') || '3456789pabaitra@cbin';
  const [tid, setTid] = useState('');
  const [tidLoading, setTidLoading] = useState(true);

  const [currentLang, setCurrentLang] = useState('Loading...');
  const [availableLangs, setAvailableLangs] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const showError = (msg) => { setErrorModalMessage(msg); setShowErrorModal(true); };

  const getToken = () => auth.user?.id_token || auth.user?.access_token || localStorage.getItem('authToken');


  useEffect(() => {
    try {
      const merchantCache = localStorage.getItem('merchantCache');
      if (merchantCache) {
        const merchant = JSON.parse(merchantCache);
        const serialNumber = merchant.serial_number || merchant.tid || '';
        if (serialNumber) {
          setTid(serialNumber);
          console.log('✓ Fetched TID from cache:', serialNumber);
        } else {
          console.warn('No serial_number found in merchant cache');
          setTid('Not found');
        }
      } else {
        console.warn('No merchant cache found');
        setTid('No data');
      }
    } catch (error) {
      console.error('Error reading merchant cache:', error);
      setTid('Error');
    } finally {
      setTidLoading(false);
    }
  }, []);


  const fetchCurrentLanguage = async (deviceTid, signal) => {
    if (!deviceTid || deviceTid.length < 3) return;
    try {
      const token = getToken();
      const headers = getHeaders(token);
      const url = `${API_URLS.CURRENT_LANGUAGE}${deviceTid}`;

      console.log('=== CURRENT LANGUAGE REQUEST ===');
      console.log('URL:', url);
      console.log('Headers:', {
        'Content-Type': headers['Content-Type'],
        'Pass_key': headers['Pass_key'] ? 'SET' : 'MISSING',
        'Authorization': headers['Authorization'] ? headers['Authorization'].substring(0, 30) + '...' : 'MISSING'
      });

      const resp = await axios.get(url, {
        headers,
        timeout: 10000,
        signal: signal
      });
      console.log('Raw Response Status:', resp.status);
      console.log('Raw Response Data:', resp.data);

      let decryptedData = resp.data;


      if (decryptedData && decryptedData.ResponseData && typeof decryptedData.ResponseData === 'string') {
        console.log('Found ResponseData field (encrypted), decrypting...');
        decryptedData = decryptResponseData(decryptedData.ResponseData);
        console.log('Decrypted ResponseData:', decryptedData);
      }

      else if (typeof resp.data === 'string') {
        console.log('Response is encrypted STRING, decrypting...');
        decryptedData = decryptResponseData(resp.data);
        console.log('Decrypted data:', decryptedData);
      }

      console.log('Final Decrypted Response:', decryptedData);


      const langValue =
        decryptedData?.data ||
        decryptedData?.language ||
        decryptedData?.current_language ||
        decryptedData?.lang ||
        null;

      if (langValue) {
        setCurrentLang(langValue);
        console.log('✓ Current language set:', langValue);
      } else {
        console.log('Response available but no language field. Keys:', Object.keys(decryptedData || {}));
        setCurrentLang('N/A');
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        console.log('Request canceled (component unmounted)');
        return;
      }
      console.error('=== CURRENT LANGUAGE ERROR ===');
      console.error('Error message:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      if (error.config) {
        console.error('Request URL:', error.config.url);
      }
      setCurrentLang('N/A');
    }
  };

  const handleFetchLanguages = async (signal) => {
    try {
      const token = getToken();
      const headers = getHeaders(token);
      const url = API_URLS.FETCH_LANGUAGES;

      console.log('=== FETCH LANGUAGES REQUEST ===');
      console.log('URL:', url);
      console.log('Headers:', {
        'Content-Type': headers['Content-Type'],
        'Pass_key': headers['Pass_key'] ? 'SET' : 'MISSING',
        'Authorization': headers['Authorization'] ? headers['Authorization'].substring(0, 30) + '...' : 'MISSING'
      });

      const resp = await axios.get(url, {
        headers,
        timeout: 10000,
        signal: signal
      });
      console.log('Raw Response Status:', resp.status);
      console.log('Raw Response Data:', resp.data);


      let decryptedData = resp.data;

      if (typeof resp.data === 'string') {
        console.log('Response is encrypted STRING, decrypting...');
        decryptedData = decryptResponseData(resp.data);
        console.log('Decrypted data:', decryptedData);
      }


      if (decryptedData && decryptedData.ResponseData && typeof decryptedData.ResponseData === 'string') {
        console.log('Found ResponseData field (encrypted), decrypting...');
        decryptedData = decryptResponseData(decryptedData.ResponseData);
      }

      console.log('Final Decrypted Response:', decryptedData);


      if (decryptedData && decryptedData.data && Array.isArray(decryptedData.data)) {
        setAvailableLangs(decryptedData.data);
        console.log('✓ Languages set:', decryptedData.data);
      } else if (decryptedData && Array.isArray(decryptedData)) {
        setAvailableLangs(decryptedData);
        console.log('✓ Languages set (direct array):', decryptedData);
      } else {
        console.log('Response available but unexpected structure. Keys:', Object.keys(decryptedData || {}));
        setAvailableLangs([]);
      }
    } catch (error) {
      if (error.name === 'CanceledError') {
        console.log('Request canceled (component unmounted)');
        return;
      }
      console.error('=== FETCH LANGUAGES ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response statusText:', error.response.statusText);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      }
      if (error.config) {
        console.error('Request URL:', error.config.url);
        console.error('Request headers:', error.config.headers);
      }
      setAvailableLangs([]);
    }
  };


  useEffect(() => {
    const abortController = new AbortController();

    const loadLanguageData = async () => {
      if (auth.isLoading) return;

      const token = getToken();
      if (!token) {
        console.warn('No token available');
        return;
      }
      if (!tid || tid.length < 3) {
        console.warn('Invalid TID:', tid);
        return;
      }

      console.log('=== LOADING LANGUAGE DATA ===');
      console.log('TID:', tid);
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'UNDEFINED');


      await Promise.all([
        fetchCurrentLanguage(tid, abortController.signal),
        handleFetchLanguages(abortController.signal)
      ]);
    };

    loadLanguageData();


    return () => abortController.abort();
  }, [tid, auth.isLoading, auth.user]);


  const handleUpdate = async () => {
    if (!selectedLang || !tid) return;
    setIsUpdating(true);

    try {
      const payload = {
        tid: tid,
        update_language: selectedLang
      };

      console.log('Updating language with payload:', payload);

      const encryptedPayload = encryptRequestData(payload);

      const response = await axios.post(API_URLS.UPDATE_LANGUAGE, { RequestData: encryptedPayload }, {
        headers: getHeaders(getToken())
      });

      let decryptedData = response.data;


      if (decryptedData && decryptedData.ResponseData && typeof decryptedData.ResponseData === 'string') {
        console.log('Found ResponseData wrapper, decrypting...');
        decryptedData = decryptResponseData(decryptedData.ResponseData);
      }

      else if (typeof response.data === 'string') {
        console.log('Response is encrypted string, decrypting...');
        decryptedData = decryptResponseData(response.data);
      }

      console.log('Update Language Final Response:', decryptedData);

      const isSuccess =
        decryptedData?.result === 'success' ||
        decryptedData?.message?.toLowerCase().includes('success');

      if (isSuccess) {
        setModalMessage("Language update request\nInitiated Successfully");
        setShowSuccessModal(true);
        setCurrentLang(selectedLang);
        console.log('✓ Language update successful');
      } else {
        const errMsg = decryptedData?.statusDesc || decryptedData?.message || 'Update failed';
        showError(errMsg);
        console.error('✗ Update failed:', decryptedData);
      }
    } catch (error) {
      console.error('Language Update Error:', error.response?.data || error.message);
      showError('Network or Database Error Occurred.');
    } finally {
      setIsUpdating(false);
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setSelectedLang('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Language Update</h2>


      <div className="bg-white border rounded shadow-sm p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">VPA ID</label>
            <input
              type="text"
              readOnly
              value={activeVpaId}
              className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Device Serial Number</label>
            <input
              type="text"
              readOnly
              value={tidLoading ? 'Loading...' : (tid || 'Not found')}
              className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-600 outline-none"
            />
          </div>


          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Current Language</label>
            <input
              type="text"
              readOnly
              value={currentLang}
              className="w-full bg-gray-50 border border-gray-200 rounded p-2.5 text-sm text-gray-600 outline-none capitalize"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase">Language Update</label>
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded p-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 cursor-pointer appearance-none capitalize"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center" }}
            >
              <option value="" disabled>Select Language Update</option>
              {availableLangs.map((lang) => (
                <option key={lang} value={lang} className="capitalize">{lang?.toLowerCase()}</option>
              ))}
            </select>
          </div>

        </div>


        <div className="flex justify-end items-center border-t border-gray-100 pt-6 gap-4">
          <button
            type="button"
            className="text-red-500 font-medium text-sm px-4 py-2 hover:bg-red-50 rounded transition-colors"
            onClick={() => setSelectedLang('')}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={!selectedLang || isUpdating}
            className="bg-[#1e6bb8] hover:bg-[#165593] text-white font-medium text-sm px-8 py-2 rounded transition-colors disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
        </div>

      </div>


      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-300">

            <div className="p-8 pb-6 flex flex-col items-center text-center">
              <h3 className="text-gray-800 text-lg font-medium leading-snug whitespace-pre-line mb-6">
                {modalMessage}
              </h3>

              <div className="w-24 h-24 rounded-full bg-[#e8fbf0] flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#1fc76a] flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={closeModal}
                className="w-full block text-center bg-[#1e6bb8] hover:bg-[#165593] text-white font-medium py-3 rounded transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}


      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px] overflow-hidden">
            <div className="p-8 pb-6 flex flex-col items-center text-center">

              <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-gray-800 text-base font-medium leading-snug whitespace-pre-line">
                {errorModalMessage}
              </h3>
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full block text-center bg-[#1e6bb8] hover:bg-[#165593] text-white font-medium py-3 rounded transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LanguageUpdate;
