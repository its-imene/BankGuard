import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  X, Download, Shield, AlertCircle,
  Paperclip, Upload, Loader2, CheckCircle2, XCircle,
  User, Building2, Save, Trash2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../../services/api';
import { entriesService }  from '../../../services/entriesService';
import { documentService } from '../../../services/documentService';
import { reviewService }   from '../../../services/reviewService';
import { profileService }  from '../../../services/profileService';
import toast from 'react-hot-toast';
import { useConfirm } from '../../../context/ConfirmContext';

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
const MemoRow = memo(({ row, rowIndex, isExpanded, onToggleExpand, uploadingId, onFileUpload, onDeleteDoc, onToggleError, onRefresh }) => {
  const isErroneous = row.errors?.length > 0;
  const displayName = row.fullName || [row.name1, row.name2, row.name3, row.name4, row.name5, row.name6].filter(Boolean).join(' ') || 'Unnamed Entry';

  return (
    <>
      <tr 
        onClick={() => onToggleExpand(row.id)}
        className={`hover:bg-slate-50/80 transition-all cursor-pointer group ${isExpanded ? 'bg-blue-50/50' : ''}`}
      >
        <td className="px-4 py-4 font-bold text-slate-300 text-[11px] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-5">{rowIndex + 1}</span>
            {isErroneous && <AlertCircle size={14} className="text-red-500" />}
          </div>
        </td>

        <td className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${row.entityType === 'INDIVIDUAL' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                {row.entityType === 'ORGANIZATION' ? <Building2 size={14} /> : <User size={14} />}
              </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {row.entityType || row.groupType || 'Unknown Type'} • {row.nationality || 'No Nationality'}
              </span>
            </div>
          </div>
        </td>

        <td className="px-4 py-4 border-b border-slate-100">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-600">DOB: {row.dob || 'N/A'}</span>
            <span className="text-[10px] text-slate-400">ID: {row.id?.substring(0,8) || '...'}</span>
          </div>
        </td>

        <td className="px-4 py-4 text-right border-b border-slate-100">
          <div className="flex items-center justify-end gap-3">
            {row.evidenceDocuments?.length > 0 && (
              <div className="flex -space-x-1">
                {row.evidenceDocuments.map((doc, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 shadow-sm" title={doc.originalName}>
                    <Paperclip size={10} />
                  </div>
                ))}
              </div>
            )}
            <div className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'bg-blue-200 text-blue-700 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan="4" className="bg-slate-50/50 px-8 py-6 border-b border-slate-200 animate-in slide-in-from-top-2 duration-200">
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Source Data Matrix</h4>
                <div className="flex gap-2 text-red-500">
                  <label className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    uploadingId === row.id ? 'bg-slate-100 text-slate-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}>
                    <Upload size={12} />
                    {uploadingId === row.id ? 'Uploading...' : 'Evidence Upload'}
                    <input type="file" className="hidden" onChange={e => onFileUpload(row.id, e.target.files[0])} disabled={uploadingId === row.id} />
                  </label>
                </div>
              </div>

              {row.evidenceDocuments?.length > 0 && (
                <div className="p-4 bg-blue-50/30 border-b border-slate-100">
                  <p className="text-[10px] font-black text-blue-600/60 uppercase tracking-widest mb-3 px-1">Verification Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {row.evidenceDocuments.map((doc, i) => (
                      <div key={i} className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-blue-100">
                        <a 
                          href={`${API_BASE_URL}${doc.storagePath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition-all"
                        >
                          <Paperclip size={12} className="text-blue-500" />
                          <span className="truncate max-w-[150px]">{doc.originalName}</span>
                        </a>
                        <button 
                          onClick={() => onDeleteDoc(doc.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Document"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {ALL_COLUMNS.map(col => {
                  const isErr = row.errors?.includes(col);
                  return (
                    <div 
                      key={col}
                      onClick={() => onToggleError(rowIndex, col)}
                      className={`group/field p-3 rounded-xl border transition-all cursor-pointer ${
                        isErr 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${isErr ? 'text-red-400' : 'text-slate-400'}`}>
                          {fmtCol(col)}
                        </span>
                        {isErr && <AlertCircle size={10} className="text-red-500" />}
                      </div>
                      <div className="text-xs font-bold break-all">
                        {row[col] || <span className="text-slate-200">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>


            </div>
          </td>
        </tr>
      )}
    </>
  );
});

const ViewEntriesModal = ({ item, onClose, onUpdateBatch }) => {
  const confirm = useConfirm();
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
    try {
      await documentService.uploadDocument(entityId, file);
      toast.success('Evidence uploaded successfully');
      await fetchEntries();
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Upload failed. Check server logs.');
    } finally {
      setUploadingId(null);
    }
  }, [item?.id]);

  const handleDeleteDoc = useCallback(async (docId) => {
    const isConfirmed = await confirm({
      title: 'Delete Evidence?',
      message: 'Are you sure you want to permanently remove this document?',
      confirmText: 'Delete',
      type: 'danger'
    });
    if (!isConfirmed) return;
    try {
      await documentService.deleteDocument(docId);
      toast.success('Document deleted');
      await fetchEntries();
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete document.');
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
      toast.success(`Batch ${decision} successfully`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
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

  const [errorCount, setErrorCount] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setErrorCount(entries.reduce((n, e) => n + (e.errors?.length || 0), 0));
  }, [entries]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-white rounded-3xl shadow-3xl w-full max-w-[95vw] h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#031124] flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Shield size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {item.source} {item.blacklistId ? `[${item.blacklistId}]` : ''}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {isLoading ? '...' : entries.length} entries
                </span>
                {errorCount > 0 && (
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <AlertCircle size={10} /> {errorCount} issues flagged
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Review comment / reason…"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                className="text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 w-64 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => handleReview('REJECTED')}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 hover:bg-red-50 rounded-lg text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                <XCircle size={14} /> Reject
              </button>

              <button
                onClick={() => handleReview('APPROVED')}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                <CheckCircle2 size={14} /> Approve
              </button>
            </div>

            <div className="w-px h-8 bg-slate-200 mx-1" />

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              <Download size={14} /> Export
            </button>

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* ── Tip bar ── */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">i</span>
            </div>
            <span className="text-[11px] text-white/90 font-bold uppercase tracking-widest">
              Operator Mode • Review each entry carefully. Toggle fields to flag errors.
            </span>
          </div>
          <div className="text-[10px] text-white/60 font-medium">
            System validated: {new Date(item.date).toLocaleDateString()}
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="flex-1 overflow-hidden bg-slate-50/30 p-6">
          <div className="bg-white border border-slate-200 rounded-2xl h-full flex flex-col overflow-hidden shadow-sm">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 size={40} className="animate-spin text-blue-500" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Retrieving Secure Database…</p>
              </div>
            ) : (
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-white z-20 shadow-sm">
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4 border-b border-slate-100 w-20">No.</th>
                      <th className="px-6 py-4 border-b border-slate-100">Profile Identity</th>
                      <th className="px-6 py-4 border-b border-slate-100">Metadata</th>
                      <th className="px-6 py-4 border-b border-slate-100 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {entries.map((row, i) => (
                      <MemoRow
                        key={row.id || i}
                        row={row}
                        rowIndex={i}
                        isExpanded={expandedId === row.id}
                        onToggleExpand={toggleExpand}
                        uploadingId={uploadingId}
                        onFileUpload={handleFileUpload}
                        onDeleteDoc={handleDeleteDoc}
                        onToggleError={toggleCellError}
                        onRefresh={fetchEntries}
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

