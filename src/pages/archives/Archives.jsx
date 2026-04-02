import React, { useState, useEffect } from 'react';
import { Package, Download, FileText, RotateCcw, Trash2, Loader2, RefreshCw, Archive } from 'lucide-react';
import { blacklistService } from '../../services/blacklistService';

const Archives = () => {
  const [archivedData, setArchivedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    setIsLoading(true);
    try {
      const data = await blacklistService.getArchivedBlacklists();
      setArchivedData(data);
    } catch (err) {
      console.error("Failed to fetch archived blacklists", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (id) => {
    if (window.confirm("Restore this blacklist to active list?")) {
      try {
        await blacklistService.restoreBlacklist(id);
        fetchArchived();
      } catch (err) {
        alert("Failed to restore. Please try again.");
      }
    }
  };

  const handlePermanentDelete = async (id) => {
    if (window.confirm("PERMANENT DELETE: This cannot be undone. Are you sure?")) {
      try {
        await blacklistService.permanentDeleteBlacklist(id);
        fetchArchived();
      } catch (err) {
        alert("Failed to delete permanently. Please try again.");
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString() + ' ' + new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-8 md:p-6 space-y-8 bg-[#f8fafc] min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
            <Archive size={24} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#031124] tracking-tight">Archives</h1>
            <p className="text-slate-500 mt-0.5 text-sm font-medium">Manage and restore your soft-deleted blacklist batches.</p>
          </div>
        </div>
        
        <button 
          onClick={fetchArchived}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={40} className="animate-spin text-indigo-500" />
            <p className="font-bold text-sm uppercase tracking-widest">Fetching Archives...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] font-black tracking-[0.2em] border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-4">Blacklist ID</th>
                  <th className="px-8 py-4">Source</th>
                  <th className="px-8 py-4">Deleted On</th>
                  <th className="px-8 py-4">Entries</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-50">
                {archivedData.length > 0 ? (
                  archivedData.map((doc) => (
                    <tr key={doc.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 text-[#031124] font-bold text-sm font-mono">
                        {doc.blacklistId || doc.version || "No ID"}
                      </td>

                      <td className="px-8 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-tight">
                          {doc.source || 'Unknown'}
                        </span>
                      </td>

                      <td className="px-8 py-4 text-slate-500 text-xs font-semibold">
                        {formatDate(doc.deletedAt)}
                      </td>

                      <td className="px-8 py-4 text-slate-600 font-bold">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText size={16} className="text-slate-300" />
                          {doc.entriesCount || 0}
                        </div>
                      </td>

                      <td className="px-8 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button 
                            onClick={() => handleRestore(doc.id)}
                            className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Restore to Active"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button 
                            onClick={() => handlePermanentDelete(doc.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Permanent Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Package size={64} strokeWidth={1} className="opacity-20" />
                        <p className="text-lg font-bold text-slate-400">Your archive is empty</p>
                        <p className="text-sm text-slate-400 max-w-xs">Deleted blacklists and batches will safely appear here for recovery.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archives;