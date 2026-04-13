import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { API_URLS } from '../api/apiClient';

const TransactionReport = () => {
  const auth = useAuth();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter state based on Figma: "today", "monthly", "custom"
  const [dateFilter, setDateFilter] = useState('monthly');
  const [monthlyOption, setMonthlyOption] = useState('Last 3 Month Report');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    let queryStart = startDate;
    let queryEnd = endDate;

    // Use UTC date to match the API server's timezone and avoid "future date" errors
    // (IST is +05:30, so local midnight is still the previous day in UTC)
    const today = new Date();
    const todayStr = `${String(today.getUTCDate()).padStart(2, '0')}/${String(today.getUTCMonth() + 1).padStart(2, '0')}/${today.getUTCFullYear()}`;

    if (dateFilter === 'today') {
      queryStart = todayStr;
      queryEnd = todayStr;
    } else if (dateFilter === 'monthly') {
      const monthsBack = parseInt(monthlyOption.split(' ')[1] || '3');
      const firstDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthsBack, 1));
      queryStart = `${String(firstDay.getUTCDate()).padStart(2, '0')}/${String(firstDay.getUTCMonth() + 1).padStart(2, '0')}/${firstDay.getUTCFullYear()}`;
      queryEnd = todayStr;
    } else if (dateFilter === 'custom') {
      if (!queryStart || !queryEnd) {
        setErrorMsg("Please select both start and end dates.");
        setLoading(false);
        return; 
      }
      
      // Convert YYYY-MM-DD (HTML date input) to DD/MM/YYYY for API
      if (queryStart.includes('-')) {
        const [sy, sm, sd] = queryStart.split('-');
        queryStart = `${sd}/${sm}/${sy}`;
      }
      if (queryEnd.includes('-')) {
        const [ey, em, ed] = queryEnd.split('-');
        queryEnd = `${ed}/${em}/${ey}`;
      }

      // Guard: prevent end date from exceeding today (UTC) to avoid server rejection
      const [ed, em, ey] = queryEnd.split('/');
      const endDateUTC = new Date(Date.UTC(parseInt(ey), parseInt(em) - 1, parseInt(ed)));
      const todayMidnightUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      if (endDateUTC > todayMidnightUTC) {
        setErrorMsg("End date cannot be in the future. Please select today or an earlier date.");
        setLoading(false);
        return;
      }
    }

    const authMobile = localStorage.getItem('authMobile');
    const activeVpaId = localStorage.getItem('activeVpaId');
    const username = auth.user?.profile?.preferred_username || authMobile;
    
    // Always use the selected activeVpaId from the Dashboard as highest priority
    const fetchId = activeVpaId || username;

    try {
      const payload = {
         vpa_id: fetchId,
         startDate: queryStart,
         endDate: queryEnd,
         mode: "both" // stream to screen
      };
      
      // Explicit NO AUTH fetch as requested
      const response = await axios.post(API_URLS.TRANSACTION_REPORT, payload);
      
      // If response itself has data and is an array (per your success stream case)
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setReports(response.data.data);
      } else if (response.data && response.data.status === "SUCCESS") {
        setReports([]); // Success but maybe excel mode which has no stream data
      } else {
        setErrorMsg(response.data.statusDescription || 'Failed to fetch reports');
        setReports([]);
      }
    } catch (error) {
      console.error('Report Fetch Error:', error);
      setErrorMsg(error?.response?.data?.message || 'Error fetching transaction reports');
      // Mock data just for visual demonstration of the Figma UI if network fails
      setReports([
        { Transaction_Id: 'e1b181ff4a4563898', Transaction_Amount: 10000, "Date_&_Time": '24/02/2026, 12:23 PM', status: 'Received' },
        { Transaction_Id: 'e1b181ff4a4563898', Transaction_Amount: 10000, "Date_&_Time": '24/02/2026, 12:23 PM', status: 'Received' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount based on initial config
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []); // Only mount

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  // Local filtering & pagination logic
  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    return reports.filter(r => 
      (r.Transaction_Id && r.Transaction_Id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.Transaction_Amount && r.Transaction_Amount.toString().includes(searchQuery))
    );
  }, [reports, searchQuery]);

  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredReports.slice(start, start + rowsPerPage);
  }, [filteredReports, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);

  return (
    <div className="animate-in fade-in max-w-7xl mx-auto pb-10">
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">Transaction Reports</h2>

      {/* Filter Section mapped exactly to Figma */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-6">
        <p className="text-sm font-medium text-gray-500 mb-4">Select a Report Filter</p>
        
        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="filterType" 
              checked={dateFilter === 'today'}
              onChange={() => setDateFilter('today')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Today</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="filterType" 
              checked={dateFilter === 'monthly'}
              onChange={() => setDateFilter('monthly')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Monthly</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="filterType" 
              checked={dateFilter === 'custom'}
              onChange={() => setDateFilter('custom')}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 font-medium">Custom Range</span>
          </label>
        </div>

        <div className="flex items-end gap-4 animate-in slide-in-from-top-2">
          {dateFilter === 'monthly' && (
            <div className="w-64">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Monthly</label>
              <select 
                value={monthlyOption}
                onChange={(e) => setMonthlyOption(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option>Last 3 Month Report</option>
                <option>Last 6 Month Report</option>
              </select>
            </div>
          )}

          {dateFilter === 'custom' && (
            <>
              <div className="w-48">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="w-48">
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}

          {dateFilter !== 'today' && (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
            >
              Submit
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            type="text" 
            placeholder="Search here..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-sm transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Download All
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-16 flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100/80">
                  <th className="font-semibold text-gray-700 text-xs py-4 px-6">&uarr;&darr; S. No.</th>
                  <th className="font-semibold text-gray-700 text-xs py-4 px-6">&uarr;&darr; Transaction ID</th>
                  <th className="font-semibold text-gray-700 text-xs py-4 px-6">&uarr;&darr; Amount</th>
                  <th className="font-semibold text-gray-700 text-xs py-4 px-6">&uarr;&darr; Date</th>
                  <th className="font-semibold text-gray-700 text-xs py-4 px-6">&uarr;&darr; Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {paginatedReports.length > 0 ? paginatedReports.map((txn, index) => (
                  <tr key={txn.Transaction_Id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-700 font-medium">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {txn.Transaction_Id || txn.VPA_ID || '-'}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                      {Number(txn.Transaction_Amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {txn["Date_&_Time"] || txn.created_date || '-'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                        {txn.status || 'Received'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500 text-sm">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>Row per page</span>
                <select 
                  value={rowsPerPage} 
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="border border-gray-200 rounded p-1 text-gray-700 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span>Go to</span>
                <input 
                  type="number" 
                  min="1" 
                  max={Math.max(1, totalPages)}
                  value={currentPage}
                  onChange={(e) => {
                    let val = parseInt(e.target.value);
                    if(val >= 1 && val <= totalPages) setCurrentPage(val);
                  }}
                  className="border border-gray-200 rounded p-1 w-12 text-center text-gray-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 px-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >&lt;</button>
              
              {/* Simplified mock pagination rendering */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                 const pageNum = i + 1;
                 const isActive = currentPage === pageNum;
                 return (
                   <button 
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`w-8 h-8 rounded text-sm ${isActive ? 'bg-blue-50 text-blue-600 font-medium border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
                   >
                     {pageNum}
                   </button>
                 )
              })}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 px-2 border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionReport;
