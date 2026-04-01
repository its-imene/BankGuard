import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* On passe la fonction de mise à jour à la Navbar */}
        <Navbar onSearch={setSearchQuery} />
        
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          {/* On partage l'état de recherche avec tous les composants enfants (Blacklists, Archives, etc.) */}
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}

export default App;