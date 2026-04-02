import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  Menu, FileText, Users, Archive, Share2,
  History, Settings, Shield, ChevronRight, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: FileText, label: 'Blacklists',    to: '/app/blacklists' },
  { icon: Archive,  label: 'Archives',      to: '/app/archives'   },
  { icon: Share2,   label: 'Distribution',  to: '/app/distribution'},
  { icon: History,  label: 'Audit Logs',    to: '/app/logs'       },
  { icon: Users,    label: 'Manage Users',  to: '/app/users'      },
  { icon: Settings, label: 'Settings',      to: '/app/settings'   },
];

/* ─── tiny tooltip for collapsed state ─── */
const Tooltip = ({ label, children }) => (
  <div className="relative group/tip">
    {children}
    <span
      className="
        pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
        whitespace-nowrap rounded-md bg-[#0e1d30] border border-white/10
        px-2.5 py-1 text-xs font-medium text-white shadow-xl
        opacity-0 translate-x-1 transition-all duration-150
        group-hover/tip:opacity-100 group-hover/tip:translate-x-0
      "
    >
      {label}
    </span>
  </div>
);

/* ─── single nav link ─── */
const NavItem = ({ icon: Icon, label, to, collapsed }) => {
  const base = `
    group relative flex items-center gap-3 rounded-lg
    transition-all duration-200 outline-none
    focus-visible:ring-2 focus-visible:ring-orange-500/60
  `;
  const expanded  = 'px-3 py-2.5 mx-2';
  const condensed = 'justify-center p-2.5 mx-auto w-10 h-10';

  const link = (
    <NavLink
      to={to}
      className={({ isActive }) => `
        ${base}
        ${collapsed ? condensed : expanded}
        ${isActive
          ? 'bg-orange-500/10 text-orange-400 shadow-[inset_2px_0_0_0] shadow-orange-500'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'}
      `}
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          {!collapsed && (
            <span className="text-sm font-medium leading-none">{label}</span>
          )}
          {!collapsed && isActive && (
            <ChevronRight size={14} className="ml-auto opacity-50" />
          )}
        </>
      )}
    </NavLink>
  );

  return collapsed ? <Tooltip label={label}>{link}</Tooltip> : link;
};

/* ─── main sidebar ─── */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarRef = useRef(null);
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!collapsed && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [collapsed]);

  return (
    <aside
      ref={sidebarRef}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={`
        relative h-screen bg-[#040f1d] text-white flex flex-col
        border-r border-white/[0.06]
        transition-[width] duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-60'}
      `}
    >
      {/* subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Logo / toggle ── */}
      <div className="relative z-10 flex h-16 shrink-0 items-center border-b border-white/[0.06] px-4">
        {!collapsed ? (
          <button
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-white/5 transition-colors w-full group"
            aria-label="Collapse sidebar"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-orange-500 shadow-lg shadow-orange-500/30">
              <Shield size={16} strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight">BankGuard</span>
            <Menu size={16} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
          </button>
        ) : (
          <Tooltip label="Expand sidebar">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <Menu size={18} />
            </button>
          </Tooltip>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden py-4">
        <div className={`flex flex-col gap-0.5 ${collapsed ? 'items-center px-0' : 'px-1'}`}>
          {!collapsed && (
            <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
              Main Menu
            </p>
          )}
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* ── User card ── */}
      <div className="relative z-10 shrink-0 border-t border-white/[0.06] p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5 transition-colors group">
            <Avatar initials={userInitials} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold leading-tight">{fullName}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500/80">
                {user?.role || 'Admin'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Log out"
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <Tooltip label={`${fullName} — ${user?.role || 'Admin'}`}>
            <div className="flex justify-center">
              <Avatar initials={userInitials} />
            </div>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

/* ─── avatar ─── */
const Avatar = ({ initials }) => (
  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0e1d30] text-[11px] font-bold text-white shadow-inner">
    {initials}
  </div>
);

export default Sidebar;