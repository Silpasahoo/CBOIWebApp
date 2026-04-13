import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileBarChart2,
  QrCode,
  Globe,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Tag,
  Eye,
} from 'lucide-react';
import { useAuth } from 'react-oidc-context';
import { useState } from 'react';
import CBOILogo from '../../components/common/CBOILogo';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard'          },
  { to: '/transactions', icon: FileBarChart2,   label: 'Transaction Reports' },
  { to: '/qr',          icon: QrCode,          label: 'QR Details'          },
  { to: '/language',    icon: Globe,           label: 'Language Update'     },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [helpOpen, setHelpOpen] = useState(
    location.pathname.startsWith('/help')
  );

  const isHelpActive = location.pathname.startsWith('/help');

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 transition-all duration-200 text-sm font-medium my-1 mx-2 rounded-lg
    ${collapsed ? 'justify-center p-3' : 'justify-start px-4 py-3'}
    ${isActive
      ? 'text-blue-600 bg-[#eef7ff] border-l-4 border-blue-600 rounded-l-none pl-3'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  const subNavLinkClass = (isActiveSub) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
    ${isActiveSub
      ? 'text-blue-600 bg-[#eef7ff] border-l-4 border-blue-600 rounded-l-none pl-2'
      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
    }`;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-[100] flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out`}
      style={{ width: collapsed ? 68 : 240 }}
    >
      {/* Logo */}
      <div
        className={`flex items-center min-h-[64px] border-b border-gray-200 gap-3 ${collapsed ? 'justify-center py-1' : 'justify-start px-1'}`}
      >
        {!collapsed && <CBOILogo size="xl" showBanner={false} style={{ height: 90, width: 500 }} />}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center cursor-pointer z-[101] text-gray-500 transition-transform hover:scale-110 shadow-sm"
      >
        {collapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
      </button>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto w-full custom-scrollbar">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={navLinkClass}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'text-blue-600' : ''} />
                {!collapsed && <span className="tracking-wide whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Help & Support (collapsible) ── */}
        {!collapsed && (
          <div className="mx-2 mt-2">
            {/* Section label */}
            <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider px-3 pt-3 pb-1">Others</p>

            {/* Help & Support parent button */}
            <button
              onClick={() => setHelpOpen((v) => !v)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isHelpActive && !helpOpen ? 'text-blue-600 bg-[#eef7ff] border-l-4 border-blue-600 rounded-l-none pl-3' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="flex items-center gap-3">
                <HelpCircle size={20} strokeWidth={1.8} className={(isHelpActive && !helpOpen) ? 'text-blue-600' : ''} />
                <span className="tracking-wide whitespace-nowrap">Help &amp; Support</span>
              </span>
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 text-gray-400 ${helpOpen ? 'rotate-90' : ''}`}
              />
            </button>

            {/* Sub-items */}
            {helpOpen && (
              <div className="mt-1 space-y-1">
                <NavLink
                  to="/help?tab=raise"
                  className={() => subNavLinkClass(location.search.includes('raise') || (!location.search && location.pathname === '/help'))}
                >
                  <Tag size={15} />
                  <span>Raise Ticket</span>
                </NavLink>
                <NavLink
                  to="/help?tab=view"
                  className={() => subNavLinkClass(location.search.includes('view'))}
                >
                  <Eye size={15} />
                  <span>View Ticket</span>
                </NavLink>
              </div>
            )}
          </div>
        )}

        {/* Collapsed: just icon */}
        {collapsed && (
          <button
            onClick={() => { navigate('/help'); }}
            title="Help & Support"
            className={`flex items-center justify-center p-3 mx-2 my-1 rounded-lg transition-all duration-200
              ${isHelpActive ? 'text-blue-600 bg-[#eef7ff]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <HelpCircle size={20} strokeWidth={1.8} className={isHelpActive ? 'text-blue-600' : ''} />
          </button>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
