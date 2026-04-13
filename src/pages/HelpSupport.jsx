import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Paperclip, X, Search, Download, MoreVertical } from 'lucide-react';
import axios from 'axios';
import { API_URLS, getHeaders } from '../api/apiClient';
import { encryptRequestData, decryptResponseData } from '../utils/encrypt';
import { useAuth } from 'react-oidc-context';

const ISSUE_TYPES = [
  'Transaction Issue',
  'Device Issue',
  'QR Code Issue',
  'Account Issue',
  'Language Issue',
  'Other',
];

const ISSUE_SUB_TYPES = {
  'Transaction Issue': ['Failed Transaction', 'Pending Transaction', 'Wrong Debit', 'Refund Issue'],
  'Device Issue': ['Device Not Working', 'Device Lost', 'Battery Issue', 'Connectivity Issue'],
  'QR Code Issue': ['QR Not Generating', 'QR Not Scanning', 'Wrong QR Details'],
  'Account Issue': ['Account Locked', 'Profile Update', 'Wrong Details'],
  'Language Issue': ['Language Not Updating', 'Wrong Language Shown'],
  'Other': ['General Query', 'Feedback', 'Complaint'],
};

const TICKET_STATUSES = ['ALL', 'OPEN', 'IN PROGRESS', 'RESOLVED', 'CLOSED'];

// ─────────────────────────── Raise Ticket ───────────────────────────
const RaiseTicket = () => {
  const auth = useAuth();
  const [issueType, setIssueType] = useState('');
  const [issueSubType, setIssueSubType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState('');

  const handleSubmit = async () => {
    if (!issueType || !issueSubType || !subject || !description) {
      setErrorMsg('Please fill all required fields.');
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }

    setIsSubmitting(true);
    setIsSubmitting(true);
    setErrorMsg('');
    setShowSuccessModal(false);

    try {
      const payload = {
        body: description,
        subject: subject,
        ticket_form_id: 47501075391257,
        custom_fields: [
          { id: 900013325983, value: subject },
          { id: 32240028334873, value: issueType },
          { id: 32240169914009, value: issueSubType },
          { id: 900013326003, value: description }
        ]
      };

      // Mock attachment URLs if files selected
      if (files.length > 0) {
        payload.attachmentName = files.map(f => f.name);
        payload.attachmentURL = files.map(f => `https://dummy-bucket.com/${f.name}`);
      }

      const encryptedPayload = encryptRequestData(payload);
      const token = auth.user?.id_token || auth.user?.access_token || localStorage.getItem('authToken');

      const response = await axios.post(
        API_URLS.CREATE_TICKET,
        { RequestData: encryptedPayload },
        { headers: getHeaders(token) }
      );

      let decryptedData = response.data;
      const encryptedResponseData = decryptedData.ResponseData ? decryptedData.ResponseData : decryptedData;

      if (typeof encryptedResponseData === 'string') {
        const decryptedStr = decryptResponseData(encryptedResponseData);
        if (decryptedStr) decryptedData = decryptedStr;
      }

      console.log('CreateTicket Response:', decryptedData);

      if (decryptedData.status === 'SUCCESS' || decryptedData.statusCode === 0) {
        setCreatedTicketId(decryptedData.ticket_id || decryptedData.statusDesc?.match(/\d+/)?.[0] || 'Unknown');
        setShowSuccessModal(true);
        setIssueType('');
        setIssueSubType('');
        setSubject('');
        setDescription('');
        setFiles([]);
      } else {
        setErrorMsg(decryptedData.status_desc || decryptedData.statusDesc || 'Failed to create ticket.');
      }
    } catch (error) {
      console.error('Create Ticket Error:', error);
      setErrorMsg(error?.response?.data?.message || 'Network error creating ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pr-8">
      {/* Top bar with phone/email (Matches Figma's top rounded rect layout) */}
      <div className="flex items-center justify-between mb-6">
        <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-8 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-full px-6 py-2 shadow-sm">
          <span className="flex items-center gap-2">
            <Phone size={14} className="text-[#3b5998]" />
            <span>Merchant Support No. : <strong className="font-semibold text-gray-800">9124573230</strong></span>
          </span>
          <span className="flex items-center gap-2">
            <Mail size={14} className="text-[#3b5998]" />
            <span>Email : <strong className="font-semibold text-gray-800">cboisupport@iserveu.in</strong></span>
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-4xl">

        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-600">🚩</span>
          <h3 className="text-[17px] font-medium text-gray-800 tracking-wide">Raise a Ticket</h3>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm font-medium">
            {errorMsg}
          </div>
        )}


        <div className="space-y-4">


          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              value={issueType}
              onChange={(e) => { setIssueType(e.target.value); setIssueSubType(''); }}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-blue-500 appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="" disabled>Select Issue Type</option>
              {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>


          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Issue Sub Type <span className="text-red-500">*</span>
            </label>
            <select
              value={issueSubType}
              onChange={(e) => setIssueSubType(e.target.value)}
              disabled={!issueType}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-600 bg-white outline-none focus:border-blue-500 appearance-none disabled:bg-gray-50 disabled:text-gray-400"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="" disabled>Select Issue Sub Type</option>
              {(issueType ? ISSUE_SUB_TYPES[issueType] : []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>


          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
            />
          </div>


          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Any additional details..."
              value={description}
              onChange={(e) => { if (e.target.value.length <= 300) setDescription(e.target.value); }}
              rows={5}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">Describe your issue within 300 characters</p>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Attachment</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full border border-gray-300 rounded px-3 py-2.5 text-sm text-gray-400 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <Paperclip size={15} />
              Please Add Attachment
            </div>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />

            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-blue-500 text-xs">📄</span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-700 truncate font-medium">{f.name}</p>
                        <p className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)}KB</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-4">
            <button
              onClick={() => { setIssueType(''); setIssueSubType(''); setSubject(''); setDescription(''); setFiles([]); setErrorMsg(''); setShowSuccessModal(false); }}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#c0392b] hover:bg-[#a93226] text-white rounded text-sm font-medium transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Submitting...
                </>
              ) : 'Submit'}
            </button>
          </div>
        </div>
      </div>


      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[380px] p-6 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-200">

            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>


            <div className="w-20 h-20 mb-5 mt-2 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="3" width="14" height="18" rx="2" stroke="#1e293b" strokeWidth="1.5" fill="white" />
                <rect x="7.5" y="6.5" width="9" height="10" rx="1" fill="#e0f2fe" />
                <path d="M9.5 11.5L11.5 13.5L15 9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">Ticket Created Successfully!</h3>
            <p className="text-[13px] text-gray-500 mb-8">
              You can check its status with the ticket ID: <span className="font-bold text-gray-800">{createdTicketId}</span>
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#1b5fcc] hover:bg-[#154db0] text-white font-medium py-3 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

// ─────────────────────────── View Ticket ───────────────────────────
const ViewTicket = () => {
  const auth = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [status, setStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [activeDropdown, setActiveDropdown] = useState(null);

  const getUsername = () => {
    return auth.user?.profile?.preferred_username || auth.user?.profile?.name || auth.user?.profile?.email?.split('@')[0] || 'admin';
  };

  const handleDownloadAll = () => {
    const url = `${API_URLS.DOWNLOAD_ALL_TICKETS}?user_name=${getUsername()}`;
    window.open(url, '_blank');
  };

  const handleDownloadById = (ticketId) => {
    const url = `${API_URLS.DOWNLOAD_TICKET}?ticket_id=${ticketId}&user_name=${getUsername()}`;
    window.open(url, '_blank');
    setActiveDropdown(null);
  };

  const fetchTickets = async (useFilterApi = false) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let payload = {};
      let endpoint = API_URLS.VIEW_ALL_TICKETS;

      if (useFilterApi) {
        endpoint = API_URLS.FILTER_TICKETS;
        payload = {
          status: status.toLowerCase(),
          created_after: startDate,
          created_before: endDate
        };
      } else {
        if (status !== 'ALL') {
          payload.status = status.toLowerCase();
        }
      }

      const encryptedPayload = encryptRequestData(payload);
      const token = auth.user?.id_token || auth.user?.access_token || localStorage.getItem('authToken');

      const response = await axios.post(
        endpoint,
        { RequestData: encryptedPayload },
        { headers: getHeaders(token) }
      );

      let decryptedData = response.data;
      const encryptedResponseData = decryptedData.ResponseData ? decryptedData.ResponseData : decryptedData;

      if (typeof encryptedResponseData === 'string') {
        const decryptedStr = decryptResponseData(encryptedResponseData);
        if (decryptedStr) decryptedData = decryptedStr;
      }

      console.log('ViewAllTickets Response:', decryptedData);

      if (decryptedData.status === 'SUCCESS' || decryptedData.statusCode === 0) {
        let fetchedTickets = decryptedData.data || [];

        // Map generic fallback data for fields not explicitly exposed by the generic Zendesk API yet
        fetchedTickets = fetchedTickets.map(t => {
          let issueType = '';
          let issueSub = '';

          if (t.custom_fields) {
            t.custom_fields.forEach(f => {
              if (f.id === 32240028334873) issueType = f.value || '';
              if (f.id === 32240169914009) issueSub = f.value || '';
            });
          }

          return {
            ...t,
            extractedIssueType: issueType || 'QR',
            extractedIssueSubType: issueSub || 'Damaged QR',
            vpaId: '87288268@cnrb',
            serialNo: '738978927897923',
          };
        });

        setTickets(fetchedTickets);
      } else {
        setErrorMsg(decryptedData.status_desc || decryptedData.statusDesc || 'Failed to fetch tickets.');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Network error fetching tickets.');
      console.error('ViewAllTickets Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(false);
  }, []);

  const processedTickets = tickets.filter(t => {

    if (searchTerm && !t.id?.toString().includes(searchTerm) && !t.vpaId?.includes(searchTerm)) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-lg p-6 min-h-[500px]">

      <div className="flex items-center gap-3 mb-8">
        <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <span className="text-gray-700 text-lg font-medium">View Tickets</span>
      </div>


      <div className="flex flex-wrap items-end gap-6">

        <div>
          <label className="block text-sm text-gray-800 mb-2 font-bold">Start Date</label>
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white min-w-[200px]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm text-gray-400 outline-none w-full bg-transparent appearance-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-800 mb-2 font-bold">End Date</label>
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white min-w-[200px]">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-sm text-gray-400 outline-none w-full bg-transparent appearance-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-800 mb-2 font-bold">Ticket Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-400 bg-white min-w-[180px] outline-none appearance-none"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => { setStartDate(todayStr); setEndDate(todayStr); setStatus('ALL'); setSearchTerm(''); fetchTickets(false); }}
            className="px-8 py-2 bg-[#1b5fcc] hover:bg-[#154db0] text-white rounded font-medium transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => fetchTickets(true)}
            className="px-8 py-2 bg-[#1b5fcc] hover:bg-[#154db0] text-white rounded font-medium transition-colors cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Search and Download row */}
      <div className="flex justify-between items-center mt-12 mb-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search Here"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <button onClick={handleDownloadAll} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm bg-white hover:bg-gray-50 transition-colors font-medium">
          Export To CSV <Download size={16} />
        </button>
      </div>

      {/* Table block */}
      <div className="overflow-x-auto bg-white mb-8 border border-gray-300">
        <table className="w-full min-w-[900px] text-sm text-center border-collapse">
          <thead className="bg-[#1b5fcc] text-white">
            <tr>
              <th className="px-3 py-4 font-normal border border-blue-400">Ticket ID</th>
              <th className="px-3 py-4 font-normal border border-blue-400">VPA ID</th>
              <th className="px-3 py-4 font-normal leading-tight border border-blue-400">Device Serial<br />Number</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Issue Type</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Issue Sub Type</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Subject</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Created Date</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Status</th>
              <th className="px-3 py-4 font-normal border border-blue-400">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-500 font-medium">Loading tickets...</td></tr>
            ) : errorMsg ? (
              <tr><td colSpan={9} className="text-center py-10 text-red-500 font-medium">{errorMsg}</td></tr>
            ) : processedTickets.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-500 font-medium">No tickets found for the selected filters.</td></tr>
            ) : (
              processedTickets.map((t) => (
                <tr key={t.id} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.id}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.vpaId}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.serialNo}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.extractedIssueType}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.extractedIssueSubType}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300">{t.subject || 'Damaged QR'}</td>
                  <td className="px-2 py-4 text-gray-700 border border-gray-300 whitespace-nowrap">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}
                  </td>
                  <td className="px-2 py-4 border border-gray-300">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${t.status?.toLowerCase() === 'new' ? 'bg-[#e0fcf4] border-[#c0f4e4] text-[#13bda3]' : 'bg-[#e9f5ee] border-[#bfe6ce] text-[#2c914e]'
                      }`}>
                      <span className={`w-2 h-2 rounded-full ${t.status?.toLowerCase() === 'new' ? 'bg-[#13bda3]' : 'bg-[#2c914e]'}`}></span>
                      {t.status?.toLowerCase() === 'new' ? 'New' : 'Solved'}
                    </span>
                  </td>
                  <td className="px-2 py-4 text-center border border-gray-300 relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === t.id ? null : t.id)}
                      className="text-gray-400 hover:text-gray-700 transition-colors mx-auto flex justify-center"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeDropdown === t.id && (
                      <div className="absolute right-5 md:right-10 top-10 bg-white border border-gray-200 rounded shadow-lg z-50 w-36 overflow-hidden">
                        <button
                          onClick={() => handleDownloadById(t.id)}
                          className="w-full text-left px-3 py-2.5 text-[13px] text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
                        >
                          <Download size={14} className="opacity-70" /> Download
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────── Main Page ───────────────────────────
const HelpSupport = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'raise'; // Default to raise if no param

  return (
    <div className="w-full pr-8">
      <h2 className="text-[22px] text-gray-800 font-semibold tracking-tight mb-6">Help &amp; Support</h2>

      {/* Content - wrapped in plain logic */}
      <div>
        {activeTab === 'raise' ? <RaiseTicket /> : <ViewTicket />}
      </div>
    </div>
  );
};

export default HelpSupport;
