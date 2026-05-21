import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { 
  X, Check, Plus, Edit2, Trash2, Shield, Users, 
  AlertCircle, Loader2, Building2, User as UserIcon, Save,
  Sparkles, Mic, MicOff, Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { voiceService } from '../../../services/voiceService';
import { entriesService } from '../../../services/entriesService';
import { reviewService }  from '../../../services/reviewService';

const COUNTRY_FIELDS = new Set(['nationality', 'countryOfBirth', 'registrationCountry', 'country']);

const ALL_FIELDS = [
  'fullName', 'name1','name2','name3','name4','name5','name6',
  'title','nameNonLatin','nonLatinType','nonLatinLang',
  'entityType','dob','townOfBirth','countryOfBirth','nationality',
  'registrationNumber', 'registrationCountry', 'incorporationDate', 'industry',
  'passportNum','passportDetails','nationalId','nationalIdDetails',
  'addr1','addr2','addr3','addr4','addr5','addr6',
  'zipCode','country','otherInfo','groupType','aliasType',
  'aliasQuality','regime','listedOn','ukSanctionsListDate','lastUpdated','groupId',
];

const FIELD_LABELS = {
  fullName: 'Full Name',
  entityType: 'Entity Type',
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
  registrationNumber: 'Registration No.', registrationCountry: 'Registration Country',
  incorporationDate: 'Incorp. Date', industry: 'Industry',
};

const DATE_FIELDS = new Set(['dob','listedOn','ukSanctionsListDate','lastUpdated']);

const FIELD_EXAMPLES = {
  blacklistId: 'e.g. OFAC-2026-001',
  source: 'e.g. OFAC SDN',
  fullName: 'e.g. Ahmed Ben Salah',
  name1: 'Given name',
  name2: 'Middle name',
  name3: 'Family name',
  title: 'e.g. Mr, Dr, Sheikh',
  nameNonLatin: 'e.g. احمد بن صالح',
  nonLatinType: 'e.g. Arabic',
  nonLatinLang: 'e.g. ar',
  dob: 'YYYY-MM-DD',
  townOfBirth: 'e.g. Algiers',
  registrationNumber: 'e.g. 123456-B',
  incorporationDate: 'YYYY-MM-DD',
  industry: 'e.g. Shipping',
  passportNum: 'e.g. P1234567',
  passportDetails: 'Country + issue details',
  nationalId: 'e.g. 99-123456',
  nationalIdDetails: 'Issuer, issue date',
  addr1: 'Street and number',
  addr2: 'City / region',
  zipCode: 'e.g. 16000',
  groupType: 'e.g. Terrorism',
  aliasType: 'e.g. AKA',
  aliasQuality: 'e.g. Good',
  regime: 'e.g. UN 1267',
  listedOn: 'YYYY-MM-DD',
  ukSanctionsListDate: 'YYYY-MM-DD',
  lastUpdated: 'YYYY-MM-DD',
  groupId: 'e.g. G-2026-90',
  otherInfo: 'Any additional identifying notes',
};

const getIntlCountryOptions = () => {
  if (!Intl?.DisplayNames || !Intl?.supportedValuesOf) return [];
  const display = new Intl.DisplayNames(['en'], { type: 'region' });
  return Intl.supportedValuesOf('region')
    .map(code => display.of(code))
    .filter(Boolean)
    .filter(name => name !== 'Unknown Region' && !/^[A-Z]{2}$/.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map(name => ({ label: name, value: name }));
};

const TABLE_COLS = [...ALL_FIELDS];

/* ─── Single uncontrolled field ─── */
const Field = ({ fieldKey, inputRef, defaultValue, hasError, options, placeholder }) => (
  <div className="flex flex-col gap-1 group">
    <label className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-500 ${
      hasError ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#031124]'
    }`}>
      {FIELD_LABELS[fieldKey] || fieldKey}
      {hasError && <span className="ml-1 text-red-400">· Error</span>}
    </label>
    {options ? (
      <select
        ref={inputRef}
        id={`field-${fieldKey}`}
        defaultValue={defaultValue || ''}
        className={`border rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all duration-500 ${
          hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300 text-red-900'
            : 'border-slate-200 bg-white text-slate-800 focus:border-[#031124] focus:ring-1 focus:ring-[#031124]/10'
        }`}
      >
        <option value="">{placeholder || '-- Select --'}</option>
        {options.map(opt => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        ref={inputRef}
        id={`field-${fieldKey}`}
        type={DATE_FIELDS.has(fieldKey) ? 'date' : 'text'}
        defaultValue={defaultValue || ''}
        placeholder={placeholder}
        className={`border rounded-lg px-3 py-2 text-xs font-medium outline-none transition-all duration-500 ${
          hasError
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300 text-red-900'
            : 'border-slate-200 bg-white text-slate-800 focus:border-[#031124] focus:ring-1 focus:ring-[#031124]/10'
        }`}
      />
    )}
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
              {c === 'entityType' ? (
                <div className="flex items-center gap-1.5">
                   <div className={`w-5 h-5 rounded-md flex items-center justify-center ${e.entityType === 'ORGANIZATION' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>
                    {e.entityType === 'ORGANIZATION' ? <Building2 size={10} /> : <Users size={10} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tight">{e.entityType || 'IND'}</span>
                </div>
              ) : (e[c] || '—')}
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

  // AI & Voice State
  const [magicText, setMagicText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // Resizer state
  const [leftWidth, setLeftWidth] = useState(380);
  const [countryOptions, setCountryOptions] = useState([]);

  const startResize = useCallback((e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftWidth;

    const onMouseMove = (moveEvent) => {
      const newWidth = Math.max(300, Math.min(800, startWidth + (moveEvent.clientX - startX)));
      setLeftWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [leftWidth]);

  const refs = useRef({});

  useEffect(() => {
    if (initialData?.id && !initialData.manualData?.length) {
      setIsLoading(true);
      entriesService.getEntriesByBlacklist(initialData.id)
        .then(setEntries)
        .catch(err => console.error('Failed to load entries', err))
        .finally(() => setIsLoading(false));
    }
    if (String(initialData?.status || '').toUpperCase() === 'ERRONEOUS') {
      reviewService.getReviews().then(reviews => {
        const latest = reviews.filter(r => r.sanctionedEntityId === initialData.id)[0];
        if (latest) setRejectionReason(latest.comment);
      });
    }
  }, [initialData?.id, initialData?.status]);

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name');
        const countries = await response.json();
        const options = countries
          .map(country => country?.name?.common)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b))
          .map(name => ({ label: name, value: name }));

        if (active && options.length) {
          setCountryOptions(options);
          return;
        }
      } catch (err) {
        console.error('Failed to fetch countries list', err);
      }

      if (active) {
        setCountryOptions(getIntlCountryOptions());
      }
    };

    loadCountries();
    return () => {
      active = false;
    };
  }, []);

  const handleMagicExtract = async (textOverride) => {
    const textToProcess = textOverride || magicText;
    if (!textToProcess || textToProcess.trim().length < 5) {
      toast.error("Please provide a longer description (at least a sentence).");
      return;
    }

    setIsExtracting(true);
    try {
      const resp = await api.post('/sanctioned-entity/extract', { text: textToProcess });
      
      const data = resp.data;
      if (data) {
        applyAIExtraction(data);
        toast.success("✨ Magic Fill complete!");
        setMagicText("");
      }
    } catch (err) {
      console.error("Extraction failed", err);
      toast.error("Magic extraction failed. Review server logs.");
    } finally {
      setIsExtracting(false);
    }
  };

  const applyAIExtraction = (data) => {
    Object.keys(data).forEach(key => {
      if (refs.current[key]) {
        refs.current[key].value = data[key] || '';
        // Add a temporary glow effect
        const el = document.getElementById(`field-${key}`);
        if (el) {
          el.classList.add('ring-2', 'ring-emerald-400', 'border-emerald-400', 'bg-emerald-50');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-400', 'border-emerald-400', 'bg-emerald-50');
          }, 1500);
        }
      }
    });
  };

  const toggleVoice = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      voiceService.startListening(
        (transcript) => {
          setMagicText(transcript);
          setIsListening(false);
          handleMagicExtract(transcript);
        },
        () => setIsListening(false)
      );
    }
  };

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
    const hasAnyName = ['name1','name2','name3','name4','name5','name6','nameNonLatin','fullName']
      .some(f => data[f] && String(data[f]).trim().length > 0);

    if (!hasAnyName) { 
      toast.error("Please provide at least one name for the entry."); 
      return; 
    }
    
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
    if (!blacklistId || !source) { toast.error('Please provide Blacklist ID and Source.'); return; }
    if (!entries.length)         { toast.error('Add at least one entry to the batch.'); return; }

    setIsSaving(true);
    setSaveError(null);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await onSave({
        ...initialData,
        blacklistId,
        source,
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

  const renderField = (fieldKey, inputRef, hasError, extra = {}) => (
    <Field
      fieldKey={fieldKey}
      inputRef={inputRef}
      hasError={hasError}
      placeholder={extra.placeholder || FIELD_EXAMPLES[fieldKey] || (COUNTRY_FIELDS.has(fieldKey) ? 'Select a country' : undefined)}
      options={COUNTRY_FIELDS.has(fieldKey) ? countryOptions : extra.options}
    />
  );

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
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden p-2 sm:p-3 bg-slate-50/50 gap-0">

          {/* LEFT: form */}
          <div 
             style={{ width: typeof window !== 'undefined' && window.innerWidth >= 1024 ? leftWidth : 'auto' }}
             className="w-full lg:w-auto bg-white border border-slate-100 rounded-xl flex flex-col shadow-sm overflow-hidden shrink-0 mb-3 lg:mb-0"
          >
            
            {/* STICKY HEADER */}
            <div className="p-4 border-b border-slate-100 bg-white z-10">
              <div className={`flex items-center justify-between text-[9px] font-black uppercase tracking-widest ${editingId ? 'text-amber-500' : 'text-slate-300'}`}>
                <span>Entry Details</span>
                {editingId && (
                  <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full lowercase italic">editing...</span>
                )}
              </div>
            </div>

            {/* Batch identity */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex gap-2">
               <div className="flex-1"><Field fieldKey="blacklistId" inputRef={el => refs.current.blacklistId = el} defaultValue={initialData?.blacklistId || ''} placeholder={FIELD_EXAMPLES.blacklistId} /></div>
               <div className="flex-1"><Field fieldKey="source"      inputRef={el => refs.current.source = el}      defaultValue={initialData?.source || ''} placeholder={FIELD_EXAMPLES.source} /></div>
            </div>

            {/* AI MAGIC BAR */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">AI Magic Fill</span>
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={magicText}
                  onChange={(e) => setMagicText(e.target.value)}
                  placeholder="Paste info or click mic to talk..."
                  className="w-full bg-white border border-emerald-200 rounded-lg pl-3 pr-20 py-2.5 text-xs text-emerald-900 placeholder:text-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleMagicExtract()}
                />
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button 
                    onClick={toggleVoice}
                    className={`p-1.5 rounded-md transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'}`}
                    title="Voice Dictation"
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>
                  <button 
                    onClick={() => handleMagicExtract()}
                    disabled={isExtracting || !magicText}
                    className="p-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isExtracting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[9px] text-emerald-600 italic leading-tight">
                "His name is Ahmed, lives in Algiers, passport B123..."
              </p>
            </div>

            {/* Form Fields */}
            <div id="entry-form-scroll" className="flex-1 overflow-y-auto p-4 space-y-4">
              <Section title="Names & Identity">
                <div className="mb-2">
                  {renderField('fullName', el => refs.current.fullName = el, currentEntryErrors.includes('fullName'))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['name1','name2','name3','name4','name5','name6'].map(f => (
                    <React.Fragment key={f}>
                      {renderField(f, el => refs.current[f] = el, currentEntryErrors.includes(f))}
                    </React.Fragment>
                  ))}
                </div>
                {renderField('title', el => refs.current.title = el)}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {renderField('nameNonLatin', el => refs.current.nameNonLatin = el)}
                  {renderField('nonLatinType', el => refs.current.nonLatinType = el)}
                  {renderField('nonLatinLang', el => refs.current.nonLatinLang = el)}
                </div>
              </Section>

              <Section title="Demographics & Type" color="text-blue-500" bg="bg-blue-50/20 border-blue-100">
                <div className="grid grid-cols-2 gap-2">
                  {renderField('entityType', el => refs.current.entityType = el, false, { options: [
                       { label: 'Individual (IND)', value: 'IND' },
                       { label: 'Organization/Company', value: 'ORGANIZATION' },
                       { label: 'Vessel/Ship', value: 'VESSEL' }
                     ] })}
                  {renderField('nationality', el => refs.current.nationality = el)}
                  {renderField('dob', el => refs.current.dob = el)}
                  {renderField('townOfBirth', el => refs.current.townOfBirth = el)}
                  {renderField('countryOfBirth', el => refs.current.countryOfBirth = el)}
                </div>
              </Section>

              <Section title="Organization Details" bg="bg-amber-50/20 border-amber-100" color="text-amber-600">
                <div className="grid grid-cols-2 gap-2">
                  {renderField('registrationNumber', el => refs.current.registrationNumber = el)}
                  {renderField('registrationCountry', el => refs.current.registrationCountry = el)}
                  {renderField('incorporationDate', el => refs.current.incorporationDate = el)}
                  {renderField('industry', el => refs.current.industry = el)}
                </div>
              </Section>

              <Section title="Documents & IDs" color="text-slate-500">
                <div className="grid grid-cols-2 gap-2">
                  {renderField('passportNum', el => refs.current.passportNum = el)}
                  {renderField('passportDetails', el => refs.current.passportDetails = el)}
                  {renderField('nationalId', el => refs.current.nationalId = el)}
                  {renderField('nationalIdDetails', el => refs.current.nationalIdDetails = el)}
                </div>
              </Section>

              <Section title="Addresses" color="text-blue-500">
                <div className="grid grid-cols-2 gap-2">
                  {['addr1','addr2','addr3','addr4','addr5','addr6'].map(f => (
                    <React.Fragment key={f}>
                      {renderField(f, el => refs.current[f] = el)}
                    </React.Fragment>
                  ))}
                  {renderField('zipCode', el => refs.current.zipCode = el)}
                  {renderField('country', el => refs.current.country = el)}
                </div>
              </Section>

              <Section title="Sanction Details" color="text-red-500" bg="bg-red-50/30 border-red-100">
                <div className="grid grid-cols-2 gap-2">
                  {renderField('groupType', el => refs.current.groupType = el)}
                  {renderField('regime', el => refs.current.regime = el)}
                  {renderField('aliasType', el => refs.current.aliasType = el)}
                  {renderField('aliasQuality', el => refs.current.aliasQuality = el)}
                  {renderField('listedOn', el => refs.current.listedOn = el)}
                  {renderField('ukSanctionsListDate', el => refs.current.ukSanctionsListDate = el)}
                  {renderField('lastUpdated', el => refs.current.lastUpdated = el)}
                </div>
                {renderField('groupId', el => refs.current.groupId = el)}
                {renderField('otherInfo', el => refs.current.otherInfo = el)}
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
                  {editingId ? 'Update Entry' : 'Add Entry to Batch'}
                </button>
              </div>
            </div>
          </div>

          {/* DRAG HANDLE */}
          <div 
            onMouseDown={startResize}
            className="hidden lg:flex w-3 mx-0.5 cursor-col-resize items-center justify-center hover:bg-slate-200/50 rounded-full transition-colors group z-10 shrink-0"
          >
            <div className="w-1 h-8 bg-slate-200 rounded-full group-hover:bg-slate-400 shadow-sm transition-colors" />
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
