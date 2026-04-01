import React, { useState } from 'react';
import { FileText, Edit3, Trash2, Download, Filter, Check } from 'lucide-react';

const BlacklistsTable = ({ data, currentFilter, onFilterChange, onEdit, onDelete, onView }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const statuses = ['all', 'ready', 'erroneous', 'valid', 'processing'];

  const getStatusStyle = (status) => {
    switch (status) {
      case "ready": return "bg-black text-white";
      case "erroneous": return "bg-red-600 text-white";
      case "valid": return "bg-emerald-500 text-white";
      case "processing": return "bg-blue-500 text-white";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const handleDownload = (row) => {
    // Check if it's a manual entry (no fileObject)
    if (!row.fileObject) {
      alert("This is a manual entry. Click the File icon to view and export data.");
      return;
    }
    const url = URL.createObjectURL(row.fileObject);
    const link = document.createElement('a');
    link.href = url;
    link.download = row.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Table Header & Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">All Blacklists</h2>
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentFilter !== 'all' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} />
            Status {currentFilter !== 'all' && `(${currentFilter})`}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    onFilterChange(status);
                    setIsFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 capitalize"
                >
                  {status}
                  {currentFilter === status && <Check size={14} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="pb-4 font-bold">Blacklist ID</th>
              <th className="pb-4 font-bold">Source</th>
              <th className="pb-4 font-bold">Reception Date</th>
              <th className="pb-4 font-bold">Entries</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 text-sm font-bold text-slate-700">{row.version}</td>
                  <td className="py-4 text-sm font-bold text-slate-700">{row.source}</td>
                  <td className="py-4 text-sm text-slate-600">{row.date}</td>
                  
                  {/* AUTOMATIC COUNTER LOGIC */}
                  <td className="py-4 text-sm text-slate-600">
                    {row.manualData && row.manualData.length > 0 
                      ? row.manualData.length 
                      : (row.entriesCount || row.entries || 0)}
                  </td>

                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(row.status)}`}>
                      {row.status}
                    </span>
                  </td>
                  
                  <td className="py-4">
                    <div className="flex justify-center items-center gap-2">
                      {/* VIEW ENTRIES */}
                      <button 
                        onClick={() => onView(row)} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Entries"
                      >
                        <FileText size={18} /> 
                      </button>

                      {/* EDIT BATCH */}
                      <button 
                        onClick={() => onEdit(row)} 
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit Batch"
                      >
                        <Edit3 size={18} />
                      </button>

                      {/* DELETE BATCH */}
                      <button 
                        onClick={() => onDelete(row.id)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Batch"
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* DOWNLOAD ORIGINAL FILE */}
                      <button 
                        onClick={() => handleDownload(row)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Download Original"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400 italic">
                  No blacklists found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlacklistsTable;