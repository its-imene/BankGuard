import React, { useState } from 'react';
import { Search, Bell, User, Settings, LogOut, X } from 'lucide-react';

const Navbar = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value); // Envoie la valeur au parent en temps réel
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (onSearch) onSearch("");
  };

  return (
    <header className="h-16 w-full bg-white flex items-center justify-between px-8 border-b border-gray-100 relative z-30">
      {/* Real Search Bar */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-3 flex items-center">
          <Search size={16} className={searchTerm ? "text-indigo-500" : "text-gray-400"} />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by ID, source or status..."
          className="w-full bg-[#F8FAFC] text-[#031124] text-sm py-2.5 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500/50 transition-all placeholder:text-gray-400"
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} className="text-indigo-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="relative">
         <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 bg-[#F1F1F1] rounded-full flex items-center justify-center text-[#5B7596] text-xs font-bold cursor-pointer hover:bg-gray-200 transition-colors"
          >
            MS
          </div>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900">Jane Doe</p>
                  <p className="text-xs text-gray-500 truncate">jane.doe@bank.com</p>
                </div>

                {/* Links */}
                <div className="py-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User size={16} className="mr-3 text-gray-400" />
                    Profile
                  </button>
                  <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings size={16} className="mr-3 text-gray-400" />
                    Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-50 mt-1">
                  <button className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={16} className="mr-3" />
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