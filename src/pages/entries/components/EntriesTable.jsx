import React, { useState } from 'react';
import { FileText, Edit3, Trash2, Download, Filter, Check } from 'lucide-react';

const EntriesTable = ({ data, currentFilter, onFilterChange, onEdit, onDelete }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statuses = ['all', 'ready', 'erroneous', 'valid',`processing`];

  const getStatusStyle = (status) => {
    switch (status) {
      case "ready": return "bg-black text-white";
      case "erroneous": return "bg-red-600 text-white";
      case "valid": return "bg-emerald-500 text-white";
      case "processing": return "bg-blue-500 text-white";
      default: return "bg-slate-100 text-slate-700";
    }
  };
  const handleDownload = (item) => {
    if (!item.fileObject) {
      alert("No file associated with this entry.");
      return;
    }
    // Create a temporary URL for the file object to trigger a download
    const url = URL.createObjectURL(item.fileObject);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800">All Blacklists</h2>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentFilter !== 'all' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            <Filter size={14} />
            Status {currentFilter !== 'all' && `(${currentFilter})`}
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
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
                <td className="py-4 text-sm font-bold text-slate-700">{row.blacklistId || '—'}</td>
                <td className="py-4 text-sm font-bold text-slate-700">{row.source}</td>
                <td className="py-4 text-sm text-slate-600">{row.date}</td>
                <td className="py-4 text-sm text-slate-600">{row.entries}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex justify-center items-center gap-4 text-slate-400">
                    <button className="hover:text-indigo-600"><FileText size={18} /></button>
                    <button onClick={() => onEdit(row)} className="hover:text-amber-600"><Edit3 size={18} /></button>
                    <button onClick={() => onDelete(row.id)} className="hover:text-red-600"><Trash2 size={18} /></button>
                    <button onClick={() => handleDownload(row)}className="hover:text-slate-800 transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-10 text-center text-slate-400 italic">
                No blacklists found with status "{currentFilter}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BlacklistsTable;