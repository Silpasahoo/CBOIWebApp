import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

const Layout = () => {
  const location = useLocation();
  const auth = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Transactions', path: '/transactions' },
    { name: 'QR Code', path: '/qr' },
    { name: 'Onboarding', path: '/onboarding' },
    { name: 'Language Setting', path: '/language' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center">
             <div className="font-bold text-2xl text-blue-700 mr-2 flex items-center">
                 <div className="w-8 h-8 bg-blue-600 rounded-md mr-3 mr-2"></div> Central Bank
             </div>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-gray-500 hover:text-blue-600">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                 M
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">{auth.user?.profile?.preferred_username || 'Merchant User'}</span>
                <span className="text-xs text-gray-500">Administrator</span>
              </div>
            </div>
            <button 
              onClick={() => auth.signoutRedirect()}
              className="text-gray-400 hover:text-red-600 ml-4 border border-gray-200 p-2 rounded-md transition-colors"
              title="Sign Out"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-grow h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto pt-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-6 py-3.5 text-sm font-medium transition-all duration-200 border-l-4 ${
                    isActive
                      ? 'bg-[#EAF2FF] text-[#0056D2] border-[#0056D2]'
                      : 'text-gray-600 hover:bg-gray-50 border-transparent hover:text-gray-900'
                  }`}
                >
                  <svg className={`w-5 h-5 mr-3 ${isActive ? 'text-[#0056D2]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page Content View */}
        <main className="flex-grow bg-[#F5F7F9] p-8 overflow-y-auto">
          {/* Breadcrumb Area */}
          <div className="mb-6 text-sm text-gray-500">
             CBOI App <span className="mx-2">/</span> <span className="font-semibold text-gray-800 capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
