import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  X, Download, Shield, AlertCircle,
  Paperclip, Upload, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../../services/api';
import { entriesService }  from '../../../services/entriesService';
import { documentService } from '../../../services/documentService';
import { reviewService }   from '../../../services/reviewService';

const ALL_COLUMNS = [
  'name6','name1','name2','name3','name4','name5',
  'title','nameNonLatin','nonLatinType','nonLatinLang',
  'dob','townOfBirth','countryOfBirth','nationality',
  'passportNum','passportDetails','nationalId','nationalIdDetails',
  'addr1','addr2','addr3','addr4','addr5','addr6',
  'zipCode','country','otherInfo','groupType','aliasType',
  'aliasQuality','regime','listedOn','ukSanctionsListDate','lastUpdated','groupId',
];

const fmtCol = col => col.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase());

/* ─── Memoised table row ─── */
const MemoRow = memo(({ row, rowIndex, uploadingId, onFileUpload, onToggleError }) => (
  <tr className="hover:bg-slate-50/60 transition-colors group">
    {/* Row # */}
    <td className="px-4 py-3 font-bold text-slate-300 text-[11px] sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 z-10">
      <div className="flex flex-col items-center gap-0.5">
        {rowIndex + 1}
        {row.errors?.length > 0 && <AlertCircle size={9} className="text-red-400" />}
      </div>
    </td>

    {/* Doc upload */}
    <td className="px-4 py-3 border-r border-slate-100">
      <div className="flex items-center gap-1.5">
        <label className={`cursor-pointer p-1.5 rounded-lg transition-colors ${
          uploadingId === row.id ? 'bg-slate-100 text-slate-300' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
        }`}>
          <Upload size={12} />
          <input type="file" className="hidden" onChange={e => onFileUpload(row.id, e.target.files[0])} disabled={uploadingId === row.id} />
        </label>
        {row.evidenceDocuments?.map((doc, i) => (
          <a key={i} href={`${API_BASE_URL}${doc.storagePath}`} target="_blank" rel="noreferrer"
            className="text-slate-300 hover:text-blue-500 transition-colors" title={doc.originalName}>
            <Paperclip size={12} />
          </a>
        ))}
      </div>
    </td>

    {/* Data cells */}
    {ALL_COLUMNS.map(col => {
      const isErr = row.errors?.includes(col);
      return (
        <td
          key={col}
          onClick={() => onToggleError(rowIndex, col)}
          className={`px-4 py-3 whitespace-nowrap text-[11px] cursor-pointer transition-all border-r border-transparent hover:border-blue-100 ${
            isErr ? 'bg-red-50 text-red-600 font-semibold' : 'text-slate-600 hover:bg-blue-50/30'
          }`}
        >
          <div className="flex items-center justify-between gap-2 min-w-[5rem]">
            <span className={col === 'name1' ? 'font-bold text-slate-800' : ''}>{row[col] || '—'}</span>
            {isErr && <AlertCircle size={10} className="text-red-400 shrink-0" />}
          </div>
        </td>
      );
    })}
  </tr>
));

const ViewEntriesModal = ({ item, onClose, onUpdateBatch }) => {
  const [entries,       setEntries]       = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [uploadingId,   setUploadingId]   = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  useEffect(() => {
    if (item?.id) fetchEntries();
  }, [item?.id]);

  const fetchEntries = async () => {
    setIsLoading(true);
    try { setEntries(await entriesService.getEntriesByBlacklist(item.id)); }
    catch (err) { console.error('Failed to fetch entries', err); }
    finally { setIsLoading(false); }
  };

  const handleFileUpload = useCallback(async (entityId, file) => {
    if (!file) return;
    setUploadingId(entityId);
    try {
      await documentService.uploadDocument(entityId, file);
      await fetchEntries();
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingId(null);
    }
  }, [item?.id]);

  const toggleCellError = useCallback((rowIndex, field) => {
    setEntries(prev => {
      const updated = [...prev];
      const row = { ...updated[rowIndex] };
      const errs = row.errors || [];
      row.errors = errs.includes(field) ? errs.filter(f => f !== field) : [...errs, field];
      row._isDirty = true;
      updated[rowIndex] = row;
      return updated;
    });
  }, []);

  const handleReview = async (decision) => {
    if (decision === 'REJECTED' && !reviewComment.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await reviewService.createReview({
        sanctionedEntityId: item.id,
        reviewerId: user?.id,
        decision,
        comment: reviewComment,
      });
      await onUpdateBatch({
        ...item,
        manualData: entries.map(e => ({ ...e, _isDirty: true })),
        status: decision === 'APPROVED' ? 'VALID' : 'ERRONEOUS',
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      alert(`Error: ${Array.isArray(msg) ? msg[0] : msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(entries);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Blacklist Data');
    XLSX.writeFile(wb, `${item.source}_Export.xlsx`);
  };

  const errorCount = entries.reduce((n, e) => n + (e.errors?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[95vh] sm:h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-50 flex flex-wrap gap-3 items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#031124] flex items-center justify-center shrink-0">
              <Shield size={16} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{item.source}</h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {isLoading ? 'Loading…' : `${entries.length} entries`}
                {errorCount > 0 && <span className="ml-2 text-red-500">· {errorCount} flagged errors</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Review comment */}
            <input
              type="text"
              placeholder="Review comment / reason…"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              className="text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#031124]/10 focus:border-slate-400 w-52 transition-all"
            />

            <button
              onClick={() => handleReview('REJECTED')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold border border-red-100 transition-colors disabled:opacity-50"
            >
              <XCircle size={14} /> Reject
            </button>

            <button
              onClick={() => handleReview('APPROVED')}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Approve
            </button>

            <div className="w-px h-6 bg-slate-100 hidden sm:block" />

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#031124] text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              <Download size={14} /> Export
            </button>

            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Tip bar ── */}
        <div className="bg-amber-50 px-5 py-2 border-b border-amber-100 flex items-center gap-2 shrink-0">
          <AlertCircle size={12} className="text-amber-500 shrink-0" />
          <span className="text-[10px] text-amber-700 font-semibold">OPERATOR MODE — Click any cell to flag it as an error</span>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-hidden bg-slate-50/50 p-3 sm:p-5">
          <div className="bg-white border border-slate-100 rounded-xl h-full flex flex-col overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-blue-400" />
                <p className="text-sm font-medium">Loading entries…</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-[11px] border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white z-20 shadow-[0_1px_0_0_#f1f5f9]">
                    <tr className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">
                      <th className="px-4 py-3 sticky left-0 bg-white z-30 border-r border-slate-100 w-10">#</th>
                      <th className="px-4 py-3 border-r border-slate-100">Docs</th>
                      {ALL_COLUMNS.map(col => (
                        <th key={col} className="px-4 py-3 whitespace-nowrap border-r border-slate-100 last:border-r-0">
                          {fmtCol(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entries.map((row, i) => (
                      <MemoRow
                        key={row.id || i}
                        row={row}
                        rowIndex={i}
                        uploadingId={uploadingId}
                        onFileUpload={handleFileUpload}
                        onToggleError={toggleCellError}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEntriesModal;
