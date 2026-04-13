import { Bell, HelpCircle, ChevronDown, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_URLS, getHeaders } from '../../api/apiClient';
import { encryptRequestData, decryptResponseData } from '../../utils/encrypt';
import ViewProfileDetailsModal from '../ViewProfileDetailsModal';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transaction Reports',
  '/qr': 'QR Details',
  '/language': 'Language Update',
  '/help': 'Help & Support',
};

const Header = ({ sidebarCollapsed, onToggle }) => {
  const auth = useAuth();
  const user = auth.user?.profile;
  const logout = () => auth.signoutRedirect();

  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfileDetail, setShowProfileDetail] = useState(false);
  const [profileDetailData, setProfileDetailData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const pageTitle = PAGE_TITLES[location.pathname] || 'Portal';
  const merchantData = JSON.parse(localStorage.getItem('merchantCache') || 'null');

  const handleViewProfile = async () => {
    let vpaId = localStorage.getItem('activeVpaId');
    if (!vpaId) {
      console.warn('No VPA ID found in localStorage. Using requested fallback for testing.');
      vpaId = '20250906043107-iservuqrsbrp@cbin';
    }

    setProfileLoading(true);
    try {
      const payload = { vpa_id: vpaId };
      const encryptedPayload = encryptRequestData(payload);

      const token = auth.user?.id_token || auth.user?.access_token;
      console.log('Fetching profile details for VPA:', vpaId);

      const response = await axios.post(
        API_URLS.FETCH_BY_ID,
        { RequestData: encryptedPayload },
        { headers: getHeaders(token) }
      );

      let responseData = response.data;

      // Decrypt if response data is string or has ResponseData key
      const encryptedResponseData = responseData.ResponseData ? responseData.ResponseData : responseData;
      if (typeof encryptedResponseData === 'string') {
        const decryptedStr = decryptResponseData(encryptedResponseData);
        if (decryptedStr) responseData = decryptedStr;
      }

      console.log('Profile details fetched:', responseData);

      if (responseData.status === 0 && responseData.data && responseData.data.length > 0) {
        setProfileDetailData(responseData.data[0]);
        setShowProfileDetail(true);
      } else {
        console.error('Failed to fetch profile details:', responseData.message);
      }
    } catch (error) {
      console.error('Error fetching profile details:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-6 z-[99] transition-all duration-300 shadow-[0_4px_20px_-10px_rgba(11,59,96,0.1)]`}
        style={{ left: sidebarCollapsed ? 68 : 240 }}
      >
        {/* Left: Sidebar toggle icon */}
        <div className="flex items-center">
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-9 h-9 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {/* Sidebar toggle icon: 4 bars + solid filled left arrow on middle 2 */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Top bold line */}
              <rect x="4" y="4.5" width="16" height="2.5" rx="0.5" fill="currentColor" />
              {/* Solid filled left-pointing triangle (arrow) */}
              <polygon points="9,9.5 4,12 9,14.5" fill="currentColor" />
              {/* Middle line 1 — starts after arrow */}
              <rect x="10" y="9.5" width="10" height="2" rx="0.5" fill="currentColor" />
              {/* Middle line 2 — starts after arrow */}
              <rect x="10" y="12.5" width="10" height="2" rx="0.5" fill="currentColor" />
              {/* Bottom bold line */}
              <rect x="4" y="17" width="16" height="2.5" rx="0.5" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-cboi-blue transition-colors relative"
            title="Notifications"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-cboi-orange rounded-full border-2 border-white" />
          </button>

          <button
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-center text-cboi-blue transition-colors"
            title="Help"
          >
            <HelpCircle size={18} strokeWidth={2} />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full cursor-pointer transition-all active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cboi-blue to-cboi-blue-light flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
                {(user?.name || user?.preferred_username || 'M')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-cboi-blue max-w-[120px] truncate">
                {user?.name || user?.preferred_username || 'Merchant'}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute top-[115%] right-0 bg-white/90 backdrop-blur-lg border border-gray-100 rounded-xl shadow-xl min-w-[200px] z-[200] overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                  <div className="text-sm font-bold text-cboi-blue truncate">
                    {user?.name || user?.preferred_username || 'Merchant'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {user?.email || 'merchant@cboi.com'}
                  </div>
                </div>
                <button
                  onClick={() => { handleViewProfile(); setDropdownOpen(false); }}
                  disabled={profileLoading}
                  className="w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer text-sm font-medium text-cboi-blue hover:bg-blue-50 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {profileLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      View Profile
                    </>
                  )}
                </button>
                <button
                  onClick={() => { setDropdownOpen(false); logout(); }}
                  className="w-full text-left px-4 py-3 bg-transparent border-none cursor-pointer text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* View Profile Details Modal — must be OUTSIDE <header> to use full viewport */}
      <ViewProfileDetailsModal
        isOpen={showProfileDetail}
        onClose={() => setShowProfileDetail(false)}
        profileData={profileDetailData}
      />
    </>
  );
};

export default Header;
