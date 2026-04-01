import React, { useState, useEffect } from 'react';
import { X, User, Shield, Trash2, Edit2, Check, Plus, Info } from 'lucide-react';

// --- FIELD COMPONENT ---
const Field = ({ label, name, value, onChange, type = "text", placeholder = "" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    <input 
      name={name} 
      type={type} 
      value={value || ''} 
      onChange={onChange}
      placeholder={placeholder}
      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white text-[#031124]" 
    />
  </div>
);

const AddEntriesModal = ({ onClose, onSave, initialData }) => {
  const [entries, setEntries] = useState(initialData?.manualData || []);
  const [editingId, setEditingId] = useState(null);

  // --- 1. ÉTAT POUR LES INFOS GÉNÉRALES DU BATCH (ID & SOURCE) ---
  const [batchInfo, setBatchInfo] = useState({
    blacklistId: initialData?.blacklistId || '', // On mappe vers 'version' pour la table principale
    source: initialData?.source || ''
  });

  const [currentEntry, setCurrentEntry] = useState({
    name6: '', name1: '', name2: '', name3: '', name4: '', name5: '',
    title: '', nameNonLatin: '', nonLatinType: '', nonLatinLang: '',
    dob: '', townOfBirth: '', countryOfBirth: '',
    nationality: '', passportNum: '', passportDetails: '', nationalId: '', nationalIdDetails: '',
    addr1: '', addr2: '', addr3: '', addr4: '', addr5: '', addr6: '', zipCode: '', country: '',
    otherInfo: '', groupType: '', aliasType: '', aliasQuality: '', regime: '',
    listedOn: '', ukSanctionsListDate: '', lastUpdated: '', groupId: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setBatchInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateEntry = () => {
    if (!currentEntry.name1) {
      alert("Please enter at least 'Name 1' for this person.");
      return;
    }

    if (editingId) {
      setEntries(entries.map(entry => entry.id === editingId ? { ...currentEntry, id: editingId } : entry));
      setEditingId(null);
    } else {
      setEntries([...entries, { ...currentEntry, id: Date.now() }]);
    }
    
    // RESET DU FORMULAIRE (Mais on garde le Batch ID et la Source intacts)
    setCurrentEntry({
      name6: '', name1: '', name2: '', name3: '', name4: '', name5: '',
      title: '', nameNonLatin: '', nonLatinType: '', nonLatinLang: '',
      dob: '', townOfBirth: '', countryOfBirth: '',
      nationality: '', passportNum: '', passportDetails: '', nationalId: '', nationalIdDetails: '',
      addr1: '', addr2: '', addr3: '', addr4: '', addr5: '', addr6: '', zipCode: '', country: '',
      otherInfo: '', groupType: '', aliasType: '', aliasQuality: '', regime: '',
      listedOn: '', ukSanctionsListDate: '', lastUpdated: '', groupId: ''
    });
  };

  const startEditEntry = (entry) => {
    setEditingId(entry.id);
    setCurrentEntry(entry);
    const formContainer = document.getElementById('manual-form-container');
    if (formContainer) formContainer.scrollTop = 0;
  };

  const removeEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (editingId === id) setEditingId(null);
  };

// ... (reste du code identique)
  const handleFinalSave = () => {
    if (!batchInfo.blacklistId || !batchInfo.source) {
      return alert("Please provide both Blacklist ID and Source for this batch.");
    }
    if (entries.length === 0) return alert("Add at least one person to the list.");
    
    onSave({
      ...initialData,
      source: batchInfo.source,
      blacklistId: batchInfo.blacklistId, // On utilise cette clé de façon consistante
      version: batchInfo.blacklistId,     // On garde version pour la compatibilité si besoin
      status: 'ready',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      entriesCount: entries.length.toString(),
      manualData: entries 
    });
  };
// ...

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[98vw] h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-[#031124] p-2 rounded-xl text-white">
              <Shield size={20} />
            </div>
            <h2 className="text-xl font-bold text-[#031124]">
              {initialData ? 'Edit Blacklist Batch' : 'New Manual Batch Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-[#F8FAFC]">
          
          {/* LEFT PANEL: FORM */}
          <div className="w-[35%] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm overflow-hidden">
            
            {/* --- SECTION FIXE : BATCH IDENTITY --- */}
            <div className="p-5 bg-blue-50/50 border-b border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-blue-600" />
                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Batch Identity</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field 
                  label="Blacklist ID" 
                  name="blacklistId" 
                  value={batchInfo.blacklistId} 
                  onChange={handleBatchChange} 
                  placeholder="Ex: LIST-2026-01"
                />
                <Field 
                  label="Source" 
                  name="source" 
                  value={batchInfo.source} 
                  onChange={handleBatchChange} 
                  placeholder="Ex: Reuters / WorldCheck"
                />
              </div>
            </div>

            <div id="manual-form-container" className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              <div className={`flex items-center justify-between mb-2 ${editingId ? 'text-amber-600' : 'text-slate-400'}`}>
                 <h3 className="text-xs font-black uppercase tracking-widest">Person Details</h3>
                 {editingId && <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full font-bold">EDITING MODE</span>}
              </div>

              {/* Formulaire des personnes (le reste de tes champs) */}
              <section className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {['name6', 'name1', 'name2', 'name3', 'name4', 'name5'].map(n => (
                     <Field key={n} label={n.replace('name', 'Name ')} name={n} value={currentEntry[n]} onChange={handleInputChange} />
                  ))}
                </div>
                <Field label="Title" name="title" value={currentEntry.title} onChange={handleInputChange} />
              </section>
            {/* 2. NON-LATIN SCRIPT */}
    <section className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <h3 className="text-[10px] font-bold text-slate-400 uppercase">Non-Latin Script Details</h3>
      <Field label="Name Non-Latin Script" name="nameNonLatin" value={currentEntry.nameNonLatin} onChange={handleInputChange} />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Script Type" name="nonLatinType" value={currentEntry.nonLatinType} onChange={handleInputChange} />
        <Field label="Language" name="nonLatinLang" value={currentEntry.nonLatinLang} onChange={handleInputChange} />
      </div>
    </section>

    {/* 3. BIRTH & NATIONALITY */}
    <section className="space-y-4">
      <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Birth & Nationality</h3>
      <div className="grid grid-cols-2 gap-2">
        <Field label="DOB" name="dob" type="date" value={currentEntry.dob} onChange={handleInputChange} />
        <Field label="Nationality" name="nationality" value={currentEntry.nationality} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Town of Birth" name="townOfBirth" value={currentEntry.townOfBirth} onChange={handleInputChange} />
        <Field label="Country of Birth" name="countryOfBirth" value={currentEntry.countryOfBirth} onChange={handleInputChange} />
      </div>
    </section>

    {/* 4. DOCUMENTS */}
    <section className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
      <h3 className="text-[10px] font-bold text-blue-400 uppercase">Documents & IDs</h3>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Passport Number" name="passportNum" value={currentEntry.passportNum} onChange={handleInputChange} />
        <Field label="Passport Details" name="passportDetails" value={currentEntry.passportDetails} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="National ID Number" name="nationalId" value={currentEntry.nationalId} onChange={handleInputChange} />
        <Field label="National ID Details" name="nationalIdDetails" value={currentEntry.nationalIdDetails} onChange={handleInputChange} />
      </div>
    </section>

    {/* 5. ADDRESSES */}
    <section className="space-y-4">
      <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Address Information</h3>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {[1,2,3,4,5,6].map(num => (
          <Field key={num} label={`Address ${num}`} name={`addr${num}`} value={currentEntry[`addr${num}`]} onChange={handleInputChange} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Post/Zip Code" name="zipCode" value={currentEntry.zipCode} onChange={handleInputChange} />
        <Field label="Country" name="country" value={currentEntry.country} onChange={handleInputChange} />
      </div>
    </section>

    {/* 6. SANCTION & REGIME DETAILS */}
    <section className="space-y-4 p-4 bg-red-50/30 rounded-2xl border border-red-100">
      <h3 className="text-xs font-black text-red-600 uppercase tracking-widest">Sanction Details</h3>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Group Type" name="groupType" value={currentEntry.groupType} onChange={handleInputChange} />
        <Field label="Regime" name="regime" value={currentEntry.regime} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Alias Type" name="aliasType" value={currentEntry.aliasType} onChange={handleInputChange} />
        <Field label="Alias Quality" name="aliasQuality" value={currentEntry.aliasQuality} onChange={handleInputChange} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Listed On" name="listedOn" type="date" value={currentEntry.listedOn} onChange={handleInputChange} />
        <Field label="UK Sanctions Date" name="ukSanctionsListDate" type="date" value={currentEntry.ukSanctionsListDate} onChange={handleInputChange} />
      </div>
      <Field label="Group ID" name="groupId" value={currentEntry.groupId} onChange={handleInputChange} />
      <Field label="Other Information" name="otherInfo" value={currentEntry.otherInfo} onChange={handleInputChange} />
    </section>

    {/* BUTTONS */}
              {/* ... Tes sections 2 à 6 (Non-Latin, Birth, Documents, etc.) ... */}
              {/* Garde le code que tu avais pour ces sections ici */}

              <div className="sticky bottom-0 bg-white pt-4 pb-2">
                <button 
                  onClick={handleAddOrUpdateEntry} 
                  className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    editingId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#031124] hover:bg-slate-800 text-white'
                  }`}
                >
                  {editingId ? <Check size={18} /> : <Plus size={18} />}
                  {editingId ? 'Update Person in Table' : 'Add Person to Table'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: TABLE PREVIEW */}
         <div className="flex-1 bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm overflow-hidden">
  <div className="p-4 border-b border-slate-50 font-bold text-[#031124] flex items-center gap-2">
    <Shield size={16} className="text-emerald-500" /> Batch Preview ({entries.length})
  </div>
  <div className="flex-1 overflow-auto custom-scrollbar">
    <table className="w-full text-left text-[11px] border-separate border-spacing-0">
      <thead className="sticky top-0 bg-white z-20">
        <tr className="text-slate-400 uppercase font-bold">
          <th className="p-3 border-b sticky left-0 bg-white z-30">#</th>
          <th className="p-3 border-b whitespace-nowrap min-w-25">Actions</th>
          {/* ALL YOUR REQUESTED COLUMNS HERE */}
          {[
            "Group ID", "Name 6", "Name 1", "Name 2", "Name 3", "Name 4", "Name 5", 
            "Title", "Non-Latin Name", "Script Type", "Language", "DOB", 
            "Town of Birth", "Country of Birth", "Nationality", "Passport Num", 
            "Passport Details", "National ID", "ID Details", "Address 1", "Zip Code", 
            "Country", "Other Info", "Group Type", "Alias Type", "Regime", 
            "Listed On", "Last Updated"
          ].map(head => (
            <th key={head} className="p-3 border-b whitespace-nowrap min-w-32">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {entries.map((e, i) => (
          <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${editingId === e.id ? 'bg-amber-50' : ''}`}>
            <td className="p-3 font-bold text-slate-400 sticky left-0 bg-inherit shadow-[1px_0_0_0_#e2e8f0]">{i+1}</td>
            <td className="p-3 flex gap-1">
              <button onClick={() => startEditEntry(e)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
              <button onClick={() => removeEntry(e.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </td>
            {/* MATCHING DATA CELLS */}
            <td className="p-3 font-bold text-blue-600">{e.groupId}</td>
            <td className="p-3">{e.name6}</td>
            <td className="p-3 font-bold text-[#031124]">{e.name1}</td>
            <td className="p-3">{e.name2}</td>
            <td className="p-3">{e.name3}</td>
            <td className="p-3">{e.name4}</td>
            <td className="p-3">{e.name5}</td>
            <td className="p-3">{e.title}</td>
            <td className="p-3">{e.nameNonLatin}</td>
            <td className="p-3">{e.nonLatinType}</td>
            <td className="p-3">{e.nonLatinLang}</td>
            <td className="p-3">{e.dob}</td>
            <td className="p-3">{e.townOfBirth}</td>
            <td className="p-3">{e.countryOfBirth}</td>
            <td className="p-3">{e.nationality}</td>
            <td className="p-3">{e.passportNum}</td>
            <td className="p-3">{e.passportDetails}</td>
            <td className="p-3">{e.nationalId}</td>
            <td className="p-3">{e.nationalIdDetails}</td>
            <td className="p-3">{e.addr1}</td>
            <td className="p-3">{e.zipCode}</td>
            <td className="p-3 font-semibold">{e.country}</td>
            <td className="p-3 max-w-xs truncate">{e.otherInfo}</td>
            <td className="p-3">{e.groupType}</td>
            <td className="p-3">{e.aliasType}</td>
            <td className="p-3">{e.regime}</td>
            <td className="p-3">{e.listedOn}</td>
            <td className="p-3">{e.lastUpdated}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-100 flex justify-end gap-3 bg-white">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Discard</button>
          <button 
            onClick={handleFinalSave} 
            className="px-10 py-2.5 bg-[#031124] text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            {initialData ? 'Update & Save Batch' : `Finalize & Save Batch`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntriesModal;