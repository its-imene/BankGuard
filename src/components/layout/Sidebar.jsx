import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, FileText, Users, Archive, Share2, 
  History, Settings, Shield 
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const NavItem = ({ icon: Icon, label, to }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `
      flex items-center px-4 py-3 cursor-pointer transition-all duration-200 rounded-lg mx-2
      ${isActive 
        ? 'bg-[#112034]  border-l-4 border-orange-500' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'}
      ${!isOpen ? 'justify-center px-0 mx-0' : ''}
    `}
  >
    <Icon size={20} className="transition-transform duration-200 group-hover:scale-110" />
    {isOpen && <span className="ml-4 text-sm font-medium">{label}</span>}
  </NavLink>
);
  return (
<aside 
  ref={sidebarRef}
  className={`
    h-screen bg-[#031124] text-white flex flex-col 
    transition-all duration-300 ease-in-out
    ${isOpen ? 'w-64' : 'w-20'}
  `}
>
      <div className="h-20 flex items-center px-6 mb-4">
        {isOpen ? (
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(false)}>
            <div className="bg-orange-600 p-1.5 rounded-md"><Shield size={20} /></div>
            <h1 className="text-xl font-bold tracking-tight">BankGuard</h1>
          </div>
        ) : (
          <button onClick={() => setIsOpen(true)} className="mx-auto p-2 hover:bg-white/10 rounded-lg"><Menu size={24} /></button>
        )}
      </div>

     <nav className="flex-1 px-2 space-y-1">
  {/* Add /app to every "to" path */}
  <NavItem icon={FileText} label="Blacklists" to="/app/blacklists" />
 
  <NavItem icon={Archive} label="Archives" to="/app/archives" />
  <NavItem icon={Share2} label="Distribution" to="/app/distribution" />
  <NavItem icon={History} label="Audit Logs" to="/app/logs" />
   <NavItem icon={Users} label="Manage Users" to="/app/users" />
  <NavItem icon={Settings} label="Settings" to="/app/settings" />
</nav>
   <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-[#0E1B31] ${!isOpen ? 'justify-center bg-transparent p-0' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-xs font-bold border border-white/10">MS</div>
          {isOpen && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">Mouloud Smail</span>
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Admin</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;