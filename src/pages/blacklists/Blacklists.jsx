import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Shield } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useConfirm } from '../../context/ConfirmContext';
import BlacklistsTable from './components/BlacklistsTable';
import AddBlacklistModal from './components/AddBlacklistModal';
import { blacklistService } from '../../services/blacklistService';
import ViewEntriesModal from './components/ViewEntriesModal';
import BlacklistMethodModal from './BlacklistMethodModal';
import AddEntriesModal from './components/AddEntriesModal';

const Blacklists = () => {
  const { searchQuery } = useOutletContext();
  const confirm = useConfirm();
  const [blacklists, setBlacklists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewingItem, setViewingItem] = useState(null);

  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { fetchBlacklists(); }, []);

  const fetchBlacklists = async () => {
    setIsLoading(true);
    try {
      const data = await blacklistService.getBlacklists();
      setBlacklists(data);
    } catch (err) {
      console.error('Failed to fetch blacklists', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = blacklists.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.blacklistId?.toLowerCase().includes(q) ||
      item.source?.toLowerCase().includes(q) ||
      item.name?.toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const addBlacklist = async (payload) => {
    try {
      if (payload.file) {
        await blacklistService.uploadBlacklist(payload.file, payload.metadata);
      } else if (payload.url) {
        await blacklistService.importFromUrl(payload.url, payload.metadata);
      } else if (payload.manualData) {
        await blacklistService.bulkCreateBlacklist({
          source: payload.source,
          blacklistId: payload.blacklistId,
          entries: payload.manualData,
        });
      } else {
        await blacklistService.createBlacklist(payload);
      }
      toast.success('Batch ingested successfully!');
      await fetchBlacklists();
      setIsAddOpen(false);
      setIsManualOpen(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add blacklist';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      console.error('Failed to add blacklist', err);
      throw err;
    }
  };

  const updateBlacklist = async (updatedItem) => {
    try {
      const { id, createdAt, updatedAt, entityProfiles, evidenceDocuments, reviews, createdBy, createdById, ...dto } = updatedItem;
      await blacklistService.updateBlacklist(id, dto);
      toast.success('Batch updated successfully');
      await fetchBlacklists();
      setEditingItem(null);
    } catch (err) {
      toast.error('Failed to update blacklist');
      console.error('Failed to update blacklist', err);
      throw err;
    }
  };

  const deleteBlacklist = async (id) => {
    const item = blacklists.find(b => b.id === id);
    if (!item) return;
    const displayName = item.source || item.blacklistId || 'this list';
    
    const isConfirmed = await confirm({
      title: 'Delete Blacklist?',
      message: `Are you sure you want to delete "${displayName}"? This will archive all associated entries.`,
      confirmText: 'Delete Now',
      type: 'danger'
    });

    if (isConfirmed) {
      try {
        await blacklistService.deleteBlacklist(id);
        toast.success('Batch archived successfully');
        await fetchBlacklists();
      } catch (err) {
        toast.error('Failed to delete blacklist');
        console.error('Failed to delete blacklist', err);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#031124] flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Shield size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Blacklists</h1>
            <p className="text-sm text-slate-500">Manage and upload regulatory blacklists</p>
          </div>
        </div>
        <button
          onClick={() => setShowMethodSelector(true)}
          className="flex items-center gap-2 bg-[#031124] hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-900/20 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} />
          Add New Blacklist
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: blacklists.length, color: 'text-slate-700' },
          { label: 'Valid',      value: blacklists.filter(b => b.status === 'VALID').length,      color: 'text-emerald-600' },
          { label: 'Erroneous', value: blacklists.filter(b => b.status === 'ERRONEOUS').length,  color: 'text-red-600'     },
          { label: 'Processing', value: blacklists.filter(b => b.status === 'PROCESSING').length, color: 'text-blue-600'    },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin mb-4 text-orange-400" size={36} />
          <p className="font-medium text-sm">Loading blacklists…</p>
        </div>
      ) : (
        <BlacklistsTable
          data={filteredData}
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
          onEdit={setEditingItem}
          onDelete={deleteBlacklist}
          onView={setViewingItem}
        />
      )}

      {showMethodSelector && (
        <BlacklistMethodModal
          onClose={() => setShowMethodSelector(false)}
          onSelectUpload={() => { setShowMethodSelector(false); setIsAddOpen(true); }}
          onSelectManual={() => { setShowMethodSelector(false); setIsManualOpen(true); }}
        />
      )}

      {isAddOpen && <AddBlacklistModal onClose={() => setIsAddOpen(false)} onSave={addBlacklist} />}

      {isManualOpen && <AddEntriesModal onClose={() => setIsManualOpen(false)} onSave={addBlacklist} />}

      {editingItem && (
        <AddEntriesModal initialData={editingItem} onClose={() => setEditingItem(null)} onSave={updateBlacklist} />
      )}

      {viewingItem && (
        <ViewEntriesModal item={viewingItem} onClose={() => setViewingItem(null)} onUpdateBatch={updateBlacklist} />
      )}
    </div>
  );
};

export default Blacklists;