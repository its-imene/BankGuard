import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <Outlet /> {/* This is where Blacklists or Dashboard will show up */}
        </main>
      </div>
    </div>
  );
}

export default App;