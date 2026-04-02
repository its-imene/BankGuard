import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  X, Shield, Trash2, Edit2, Check, Plus,
  Info, Loader2, AlertCircle, Users, ChevronRight,
} from 'lucide-react';
import { entriesService } from '../../../services/entriesService';
import { reviewService }  from '../../../services/reviewService';

const ALL_FIELDS = [
  'name1','name2','name3','name4','name5','name6',
  'title','nameNonLatin','nonLatinType','nonLatinLang',
  'dob','townOfBirth','countryOfBirth','nationality',
  'passportNum','passportDetails','nationalId','nationalIdDetails',
  'addr1','addr2','addr3','addr4','addr5','addr6',
  'zipCode','country','otherInfo','groupType','aliasType',
  'aliasQuality','regime','listedOn','ukSanctionsListDate','lastUpdated','groupId',
];

const FIELD_LABELS = {
  name1:'Name 1', name2:'Name 2', name3:'Name 3', name4:'Name 4',
  name5:'Name 5', name6:'Name 6', title:'Title',
  nameNonLatin:'Non-Latin Name', nonLatinType:'Script Type', nonLatinLang:'Language',
  dob:'Date of Birth', townOfBirth:'Town of Birth', countryOfBirth:'Country of Birth',
  nationality:'Nationality', passportNum:'Passport No.', passportDetails:'Passport Details',
  nationalId:'National ID', nationalIdDetails:'ID Details',
  addr1:'Address 1', addr2:'Address 2', addr3:'Address 3',
  addr4:'Address 4', addr5:'Address 5', addr6:'Address 6',
  zipCode:'Zip / Post Code', country:'Country',
  otherInfo:'Other Info', groupType:'Group Type', aliasType:'Alias Type',
  aliasQuality:'Alias Quality', regime:'Regime',
  listedOn:'Listed On', ukSanctionsListDate:'UK Sanctions Date',
  lastUpdated:'Last Updated', groupId:'Group ID',
};

const DATE_FIELDS = new Set(['dob','listedOn','ukSanctionsListDate','lastUpdated']);

const TABLE_COLS = [
  'groupId','name1','name2','name3','name4','name5','name6',
  'title','dob','nationality','country','regime','listedOn',
];

/* ─── Single uncontrolled field ─── */
const Field = ({ fieldKey, inputRef, defaultValue, hasError }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-[9px] font-bold uppercase tracking-wider ${hasError ? 'text-red-500' : 'text-slate-400'}`}>
      {FIELD_LABELS[fieldKey] || fieldKey}
      {hasError && <span className="ml-1 text-red-400">· Error</span>}
    </label>
    <input
      ref={inputRef}
      type={DATE_FIELDS.has(fieldKey) ? 'date' : 'text'}
      defaultValue={defaultValue || ''}
      className={`border rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all ${
        hasError
          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300 text-red-900'
          : 'border-slate-200 bg-white text-slate-800 focus:border-[#031124] focus:ring-1 focus:ring-[#031124]/10'
      }`}
    />
  </div>
);

/* ─── Section wrapper ─── */
const Section = ({ title, color = 'text-slate-400', bg, children }) => (
  <div className={`space-y-2.5 ${bg ? `p-3.5 rounded-xl border ${bg}` : ''}`}>
    <h4 className={`text-[9px] font-black uppercase tracking-widest ${color}`}>{title}</h4>
    {children}
  </div>
);

/* ─── Preview table ─── */
const TablePreview = memo(({ entries, onEdit, onDelete, editingId }) => (
  <table className="w-full text-left text-[11px] border-separate border-spacing-0">
    <thead className="sticky top-0 bg-white z-20 shadow-[0_1px_0_0_#f1f5f9]">
      <tr className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">
        <th className="px-3 py-3 border-b sticky left-0 bg-white z-30 w-10">#</th>
        <th className="px-3 py-3 border-b">Actions</th>
        {TABLE_COLS.map(c => (
          <th key={c} className="px-3 py-3 border-b whitespace-nowrap min-w-[7rem]">
            {FIELD_LABELS[c] || c}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-50">
      {entries.map((e, i) => (
        <tr key={e.id} className={`hover:bg-slate-50/50 transition-colors ${
          editingId === e.id ? 'bg-amber-50/60' : ''
        } ${e.errors?.length > 0 ? 'bg-red-50/30' : ''}`}>
          <td className="px-3 py-2.5 font-bold text-slate-300 text-[10px] sticky left-0 bg-inherit border-r border-slate-100">
            <div className="flex flex-col items-center gap-0.5">
              {i + 1}
              {e.errors?.length > 0 && <AlertCircle size={9} className="text-red-400" />}
            </div>
          </td>
          <td className="px-3 py-2.5 border-r border-slate-100">
            <div className="flex gap-1">
              <button onClick={() => onEdit(e)} className={`p-1.5 rounded-lg transition-colors ${
                e.errors?.length > 0 ? 'text-red-400 hover:bg-red-50' : 'text-blue-400 hover:bg-blue-50'
              }`}><Edit2 size={12} /></button>
              <button onClick={() => onDelete(e.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </td>
          {TABLE_COLS.map(c => (
            <td key={c} className={`px-3 py-2.5 whitespace-nowrap ${e.errors?.includes(c) ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
              {e[c] || '—'}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
));

/* ─── Main Modal ─── */
const AddEntriesModal = ({ onClose, onSave, initialData }) => {
  const [entries,            setEntries]            = useState(initialData?.manualData || []);
  const [editingId,          setEditingId]          = useState(null);
  const [isLoading,          setIsLoading]          = useState(false);
  const [isSaving,           setIsSaving]           = useState(false);
  const [saveError,          setSaveError]          = useState(null);
  const [rejectionReason,    setRejectionReason]    = useState(null);
  const [currentEntryErrors, setCurrentEntryErrors] = useState([]);

  const refs = useRef({});

  useEffect(() => {
    if (initialData?.id && !initialData.manualData?.length) {
      setIsLoading(true);
      entriesService.getEntriesByBlacklist(initialData.id)
        .then(setEntries)
        .catch(err => console.error('Failed to load entries', err))
        .finally(() => setIsLoading(false));
    }
    if (initialData?.status === 'erroneous') {
      reviewService.getReviews().then(reviews => {
        const latest = reviews.filter(r => r.sanctionedEntityId === initialData.id)[0];
        if (latest) setRejectionReason(latest.comment);
      });
    }
  }, [initialData?.id, initialData?.status]);

  const readRefs = () => {
    const data = {};
    Object.keys(refs.current).forEach(k => {
      if (refs.current[k]) data[k] = refs.current[k].value;
    });
    return data;
  };

  const clearPersonRefs = () => ALL_FIELDS.forEach(f => { if (refs.current[f]) refs.current[f].value = ''; });

  const handleAddOrUpdateEntry = useCallback(() => {
    const data = readRefs();
    if (!data.name1) { alert("Please enter at least 'Name 1'."); return; }
    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? { ...data, id: editingId, _isDirty: true, errors: [] } : e));
      setEditingId(null);
      setCurrentEntryErrors([]);
    } else {
      setEntries(prev => [...prev, { ...data, id: Date.now(), _isDirty: true, errors: [] }]);
    }
    clearPersonRefs();
  }, [editingId]);

  const startEditEntry = useCallback((entry) => {
    setEditingId(entry.id);
    setCurrentEntryErrors(entry.errors || []);
    setTimeout(() => {
      ALL_FIELDS.forEach(f => { if (refs.current[f]) refs.current[f].value = entry[f] || ''; });
      document.getElementById('entry-form-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }, []);

  const removeEntry = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    if (editingId === id) setEditingId(null);
  }, [editingId]);

  const handleFinalSave = async () => {
    const data = readRefs();
    const blacklistId = data.blacklistId || initialData?.blacklistId || '';
    const source      = data.source      || initialData?.source      || '';
    if (!blacklistId || !source) { alert('Please provide Blacklist ID and Source.'); return; }
    if (!entries.length)         { alert('Add at least one entry.'); return; }

    setIsSaving(true);
    setSaveError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await onSave({
        ...initialData,
        blacklistId,
        source,
        version: blacklistId,
        status: 'READY',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        entriesCount: entries.length,
        manualData: entries,
        createdById: initialData?.createdById || user?.id,
      });
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Save failed. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[95vh] sm:h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${initialData ? 'bg-amber-500' : 'bg-[#031124]'}`}>
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialData ? 'Edit Blacklist Batch' : 'New Manual Batch Entry'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} in batch
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Rejection banner ── */}
        {rejectionReason && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-100 px-4 py-3 rounded-xl flex items-start gap-3 shrink-0">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-0.5">Rejection Reason</p>
              <p className="text-xs text-red-800 font-medium">{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* ── Body: form + table ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden gap-3 p-3 bg-slate-50/50">

          {/* LEFT: form */}
          <div className="lg:w-[340px] xl:w-[360px] bg-white border border-slate-100 rounded-xl flex flex-col shadow-sm overflow-hidden shrink-0">

            {/* Batch identity */}
            <div className="p-4 bg-blue-50/50 border-b border-blue-100 shrink-0">
              <div className="flex items-center gap-1.5 mb-3">
                <Info size={12} className="text-blue-500" />
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Batch Identity</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Field fieldKey="blacklistId" inputRef={el => refs.current.blacklistId = el} defaultValue={initialData?.blacklistId || ''} />
                <Field fieldKey="source"      inputRef={el => refs.current.source = el}      defaultValue={initialData?.source || ''} />
              </div>
            </div>

            {/* Person fields */}
            <div id="entry-form-scroll" className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Mode indicator */}
              <div className={`flex items-center justify-between text-[9px] font-black uppercase tracking-widest ${editingId ? 'text-amber-500' : 'text-slate-300'}`}>
                <span>Person Details</span>
                {editingId && (
                  <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">Editing Mode</span>
                )}
              </div>

              <Section title="Names">
                <div className="grid grid-cols-2 gap-2">
                  {['name1','name2','name3','name4','name5','name6'].map(f => (
                    <Field key={f} fieldKey={f} inputRef={el => refs.current[f] = el} hasError={currentEntryErrors.includes(f)} />
                  ))}
                </div>
                <Field fieldKey="title" inputRef={el => refs.current.title = el} hasError={currentEntryErrors.includes('title')} />
              </Section>

              <Section title="Non-Latin Script" bg="bg-slate-50 border-slate-100">
                <Field fieldKey="nameNonLatin" inputRef={el => refs.current.nameNonLatin = el} />
                <div className="grid grid-cols-2 gap-2">
                  <Field fieldKey="nonLatinType" inputRef={el => refs.current.nonLatinType = el} />
                  <Field fieldKey="nonLatinLang" inputRef={el => refs.current.nonLatinLang = el} />
                </div>
              </Section>

              <Section title="Birth & Nationality" color="text-blue-500">
                <div className="grid grid-cols-2 gap-2">
                  <Field fieldKey="dob"         inputRef={el => refs.current.dob = el} />
                  <Field fieldKey="nationality"  inputRef={el => refs.current.nationality = el} />
                  <Field fieldKey="townOfBirth"  inputRef={el => refs.current.townOfBirth = el} />
                  <Field fieldKey="countryOfBirth" inputRef={el => refs.current.countryOfBirth = el} />
                </div>
              </Section>

              <Section title="Documents & IDs" color="text-blue-400" bg="bg-blue-50/40 border-blue-100">
                <div className="grid grid-cols-2 gap-2">
                  <Field fieldKey="passportNum"     inputRef={el => refs.current.passportNum = el} />
                  <Field fieldKey="passportDetails" inputRef={el => refs.current.passportDetails = el} />
                  <Field fieldKey="nationalId"       inputRef={el => refs.current.nationalId = el} />
                  <Field fieldKey="nationalIdDetails" inputRef={el => refs.current.nationalIdDetails = el} />
                </div>
              </Section>

              <Section title="Addresses" color="text-blue-500">
                <div className="grid grid-cols-2 gap-2">
                  {['addr1','addr2','addr3','addr4','addr5','addr6'].map(f => (
                    <Field key={f} fieldKey={f} inputRef={el => refs.current[f] = el} />
                  ))}
                  <Field fieldKey="zipCode" inputRef={el => refs.current.zipCode = el} />
                  <Field fieldKey="country" inputRef={el => refs.current.country = el} />
                </div>
              </Section>

              <Section title="Sanction Details" color="text-red-500" bg="bg-red-50/30 border-red-100">
                <div className="grid grid-cols-2 gap-2">
                  <Field fieldKey="groupType"    inputRef={el => refs.current.groupType = el} />
                  <Field fieldKey="regime"        inputRef={el => refs.current.regime = el} />
                  <Field fieldKey="aliasType"     inputRef={el => refs.current.aliasType = el} />
                  <Field fieldKey="aliasQuality"  inputRef={el => refs.current.aliasQuality = el} />
                  <Field fieldKey="listedOn"      inputRef={el => refs.current.listedOn = el} />
                  <Field fieldKey="ukSanctionsListDate" inputRef={el => refs.current.ukSanctionsListDate = el} />
                </div>
                <Field fieldKey="groupId"   inputRef={el => refs.current.groupId = el} />
                <Field fieldKey="otherInfo" inputRef={el => refs.current.otherInfo = el} />
              </Section>

              {/* Add / Update CTA — sticky */}
              <div className="sticky bottom-0 bg-white pt-3 pb-1">
                <button
                  onClick={handleAddOrUpdateEntry}
                  className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    editingId
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-[#031124] hover:bg-slate-800 text-white'
                  }`}
                >
                  {editingId ? <Check size={16} /> : <Plus size={16} />}
                  {editingId ? 'Update Person' : 'Add Person to Batch'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: table preview */}
          <div className="flex-1 bg-white border border-slate-100 rounded-xl flex flex-col shadow-sm overflow-hidden min-h-0">
            <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2 shrink-0">
              <Users size={14} className="text-emerald-500" />
              <span className="font-bold text-sm text-slate-800">Batch Preview</span>
              <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-0.5 rounded-full">{entries.length}</span>
              {isLoading && <Loader2 size={14} className="animate-spin text-blue-400 ml-1" />}
            </div>

            <div className="flex-1 overflow-auto">
              {entries.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-2">
                  <Shield size={32} strokeWidth={1.5} />
                  <p className="text-sm font-medium">No entries yet</p>
                  <p className="text-xs text-slate-400">Add a person using the form on the left</p>
                </div>
              ) : (
                <TablePreview
                  entries={entries}
                  onEdit={startEditEntry}
                  onDelete={removeEntry}
                  editingId={editingId}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-50 flex items-center justify-end gap-3 bg-white shrink-0">
          {saveError && (
            <p className="text-xs text-red-500 font-medium mr-auto bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">⚠ {saveError}</p>
          )}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={handleFinalSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-[#031124] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {isSaving ? 'Saving…' : (initialData ? 'Update Batch' : 'Finalize & Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntriesModal;