import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cboi-blue/5 via-white to-cboi-blue/10">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ marginLeft: collapsed ? 68 : 240 }}
      >
        <Header sidebarCollapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        
        <main className="flex-1 pt-24 px-6 pb-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
