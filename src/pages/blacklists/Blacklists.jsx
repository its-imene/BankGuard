
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import BlacklistsTable from './components/BlacklistsTable';
import AddBlacklistModal from './components/AddBlacklistModal';

import ViewEntriesModal from './components/ViewEntriesModal'; // We will create this later for viewing entries of a blacklist

// New Imports
import BlacklistMethodModal from './BlacklistMethodModal';
import AddEntriesModal from './components/AddEntriesModal';

const Blacklists = () => {
  const [blacklists, setBlacklists] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingItem, setViewingItem] = useState(null);

  // Modal States
  const [showMethodSelector, setShowMethodSelector] = useState(false); // First popup choice
  const [isAddOpen, setIsAddOpen] = useState(false);                   // File Upload modal
  const [isManualOpen, setIsManualOpen] = useState(false);             // Manual Entry modal
  const [editingItem, setEditingItem] = useState(null);

  const filteredData = filterStatus === 'all'
    ? blacklists
    : blacklists.filter(item => item.status === filterStatus);

  // Unified save function for both manual and file uploads
  const addBlacklist = (newItem) => {
    setBlacklists([...blacklists, { ...newItem, id: Date.now() }]);
    setIsAddOpen(false);
    setIsManualOpen(false);
  };

  const updateBlacklist = (updatedItem) => {
    setBlacklists(blacklists.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  const deleteBlacklist = (id) => {
    if (window.confirm("Are you sure you want to delete this blacklist?")) {
      setBlacklists(blacklists.filter(item => item.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blacklists</h1>
          <p className="text-slate-500">Manage and upload regulatory blacklists.</p>
        </div>
        <button
          onClick={() => setShowMethodSelector(true)} // Opens the selection popup
          className="flex items-center gap-2 bg-[#031124] hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} /> Add New Blacklist
        </button>
      </div>

      <BlacklistsTable
        data={filteredData}
        currentFilter={filterStatus}
        onFilterChange={setFilterStatus}
        onEdit={setEditingItem}
        onDelete={deleteBlacklist}
        onView={setViewingItem}
      />

      {/* 1. Choice Popup */}
      {showMethodSelector && (
        <BlacklistMethodModal
          onClose={() => setShowMethodSelector(false)}
          onSelectUpload={() => {
            setShowMethodSelector(false);
            setIsAddOpen(true); // "Drives" to file upload
          }}
          onSelectManual={() => {
            setShowMethodSelector(false);
            setIsManualOpen(true); // "Drives" to manual entry
          }}
        />
      )}

      {/* 2. File Upload Modal */}
      {isAddOpen && (
        <AddBlacklistModal
          onClose={() => setIsAddOpen(false)}
          onSave={addBlacklist}
        />
      )}

      {/* 3. Manual Entry Modal */}
      {isManualOpen && (
        <AddEntriesModal
          onClose={() => setIsManualOpen(false)}
          onSave={addBlacklist}
        />
      )}

      {editingItem && (
        <AddEntriesModal
          initialData={editingItem} // Pass the item to be edited
          onClose={() => setEditingItem(null)}
          onSave={updateBlacklist}
        />

      )}
      {
        viewingItem && (
          <ViewEntriesModal
            item={viewingItem}
            onClose={() => setViewingItem(null)}
            onUpdateBatch={updateBlacklist} // <--- Add this line
          />
        )
}
    </div>
  );
};

export default Blacklists;