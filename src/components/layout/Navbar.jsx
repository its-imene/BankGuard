import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Settings, LogOut, X, User, CheckCheck, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socketService';

/* ─── helpers ─── */
const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ─── notification dot colours keyed by title keyword ─── */
const dotColor = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('error') || t.includes('fail'))  return 'bg-red-400';
  if (t.includes('warn'))                          return 'bg-orange-400';
  if (t.includes('success') || t.includes('ok'))  return 'bg-emerald-400';
  return 'bg-indigo-400';
};

/* ─── reusable dropdown overlay ─── */
const Overlay = ({ onClose }) => (
  <div className="fixed inset-0 z-10" onClick={onClose} />
);

const Navbar = ({ onSearch }) => {
  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifsOpen,  setNotifsOpen]    = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm,  setSearchTerm]    = useState('');
  const searchRef = useRef(null);
  const navigate  = useNavigate();

  const userStr = localStorage.getItem('user');
  const user    = userStr ? JSON.parse(userStr) : null;
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest User';

  const unread = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    socketService.connect(user.id);
    socketService.onNotification(n => setNotifications(prev => [n, ...prev]));
    return () => socketService.disconnect();
  }, []);

  const fetchNotifications = async () => {
    try { setNotifications(await notificationService.getNotifications()); }
    catch (e) { console.error('Failed to fetch notifications', e); }
  };

  const markAllAsRead = async () => {
    try { await notificationService.markAllAsRead(); fetchNotifications(); }
    catch (e) { console.error(e); }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onSearch?.(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch?.('');
    searchRef.current?.focus();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="h-16 w-full bg-white flex items-center justify-between px-6 border-b border-gray-100 relative z-30">

      {/* ── Search ── */}
      <div className="relative w-72 group">
        <Search
          size={15}
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none
            ${searchTerm ? 'text-indigo-500' : 'text-gray-400 group-focus-within:text-indigo-400'}`}
        />
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by ID, source or status…"
          className="
            w-full bg-gray-50 text-[#031124] text-sm
            py-2.5 pl-10 pr-9 rounded-xl
            border border-transparent
            focus:outline-none focus:bg-white focus:border-indigo-200 focus:ring-2 focus:ring-indigo-500/10
            transition-all duration-200 placeholder:text-gray-400
          "
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifsOpen(o => !o); setProfileOpen(false); }}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Bell size={18} className="text-gray-500" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full border-2 border-white text-[9px] flex items-center justify-center font-bold text-white leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifsOpen && (
            <>
              <Overlay onClose={() => setNotifsOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 z-20 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Notifications</span>
                    {unread > 0 && (
                      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">
                        {unread} new
                      </span>
                    )}
                  </div>
                  {unread > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="overflow-y-auto max-h-[360px] flex flex-col divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
                      <Bell size={28} className="opacity-30" />
                      <span className="text-xs">You're all caught up</span>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 transition-colors ${n.isRead ? 'opacity-50' : 'hover:bg-gray-50/60'}`}
                      >
                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-gray-200' : dotColor(n.title)}`} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide mb-0.5">{n.title}</p>
                          <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-2" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifsOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0">
              {userInitials}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-xs font-semibold text-gray-800 max-w-[96px] truncate">{fullName}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                {user?.role || 'Admin'}
              </span>
            </div>
            <ChevronDown
              size={13}
              className={`text-gray-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {profileOpen && (
            <>
              <Overlay onClose={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl shadow-black/10 border border-gray-100 overflow-hidden z-20">
                {/* Info */}
                <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">{fullName}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                </div>

                {/* Actions */}
                <div className="py-1">
                  {[
                    { icon: User,     label: 'Profile'  },
                    { icon: Settings, label: 'Settings' },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={15} className="text-gray-400 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} className="shrink-0" />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;