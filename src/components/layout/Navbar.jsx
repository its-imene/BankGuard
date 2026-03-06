import React from 'react';
import { Search, Bell } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 w-full bg-white flex items-center justify-between px-8 border-b border-gray-100">
      {/* Search Bar */}
      <div className="relative w-64">
        <span className="absolute inset-y-0 left-3 flex items-center">
          <Search size={16} className="text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Search Blacklists..."
          className="w-full bg-[#F8FAFC] text-gray-500 text-sm py-2 pl-10 pr-4 rounded-full focus:outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        <button className="relative p-1">
          <Bell size={20} className="text-indigo-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* Profile Circle */}
        <div className="w-9 h-9 bg-[#F1F1F1] rounded-full flex items-center justify-center text-[#5B7596] text-xs font-bold cursor-pointer">
          MS
        </div>
      </div>
    </header>
  );
};

export default Navbar;