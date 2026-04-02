import React, { useState } from 'react';
import { FileText, Edit3, Trash2, Download, Filter, Check, Loader2, ChevronDown, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { entriesService } from '../../../services/entriesService';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',    dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  READY:      { label: 'Ready',      dot: 'bg-[#031124]', badge: 'bg-slate-900 text-white'     },
  ERRONEOUS:  { label: 'Erroneous',  dot: 'bg-red-500',   badge: 'bg-red-50 text-red-600'      },
  VALID:      { label: 'Valid',      dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  PROCESSING: { label: 'Processing', dot: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-600'    },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toUpperCase()] || { label: status, dot: 'bg-slate-300', badge: 'bg-slate-50 text-slate-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const STATUSES = ['all', 'PENDING', 'READY', 'ERRONEOUS', 'VALID', 'PROCESSING'];

const BlacklistsTable = ({ data, currentFilter, onFilterChange, onEdit, onDelete, onView }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDownloadingId, setIsDownloadingId] = useState(null);

  const handleDownload = async (row) => {
    setIsDownloadingId(row.id);
    try {
      const entries = await entriesService.getEntriesByBlacklist(row.id);
      if (!entries?.length) { alert('No entries found to download.'); return; }
      const ws = XLSX.utils.json_to_sheet(entries);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Blacklist Data');
      XLSX.writeFile(wb, `${row.source || 'Blacklist'}_Export.xlsx`);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download. Please try again.');
    } finally {
      setIsDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Table toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Database size={15} className="text-slate-400" />
          <h2 className="text-sm font-bold text-slate-800">All Blacklists</h2>
          <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">{data.length}</span>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(o => !o)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              currentFilter !== 'all'
                ? 'border-orange-200 text-orange-600 bg-orange-50'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Filter size={12} />
            {currentFilter !== 'all' ? currentFilter : 'Filter by Status'}
            <ChevronDown size={12} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => { onFilterChange(s); setIsFilterOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 capitalize font-medium"
                  >
                    <span className="flex items-center gap-2">
                      {s !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[s]?.dot || 'bg-slate-300'}`} />}
                      {s === 'all' ? 'All Statuses' : s}
                    </span>
                    {currentFilter === s && <Check size={12} className="text-orange-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Responsive table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold bg-slate-50/60 border-b border-slate-100">
              <th className="px-5 py-3">Blacklist ID</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3 hidden sm:table-cell">Reception Date</th>
              <th className="px-5 py-3 hidden md:table-cell">Entries</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-700 font-mono">
                    {row.version}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                    {row.source}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 hidden sm:table-cell">
                    {row.date}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-600 hidden md:table-cell">
                    <span className="font-mono font-bold">
                      {row.manualData?.length > 0 ? row.manualData.length : (row.entriesCount || row.entries || 0)}
                    </span>
                    <span className="text-slate-400 ml-1">entries</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-center items-center gap-1">
                      {[
                        { icon: FileText, action: () => onView(row),    title: 'View Entries', hover: 'hover:text-blue-600 hover:bg-blue-50'   },
                        { icon: Edit3,    action: () => onEdit(row),    title: 'Edit Batch',   hover: 'hover:text-amber-500 hover:bg-amber-50' },
                        { icon: Trash2,   action: () => onDelete(row.id), title: 'Delete',     hover: 'hover:text-red-600 hover:bg-red-50'     },
                      ].map(({ icon: Icon, action, title, hover }) => (
                        <button
                          key={title}
                          onClick={action}
                          title={title}
                          className={`p-2 rounded-lg text-slate-300 group-hover:text-slate-400 transition-all ${hover}`}
                        >
                          <Icon size={15} />
                        </button>
                      ))}
                      <button
                        onClick={() => handleDownload(row)}
                        disabled={isDownloadingId === row.id}
                        title="Download Excel"
                        className={`p-2 rounded-lg transition-all ${
                          isDownloadingId === row.id
                            ? 'text-blue-500 bg-blue-50'
                            : 'text-slate-300 group-hover:text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isDownloadingId === row.id
                          ? <Loader2 size={15} className="animate-spin" />
                          : <Download size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Database size={28} className="opacity-30" />
                    <p className="text-sm font-medium">No blacklists found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search or filter</p>
                  </div>
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