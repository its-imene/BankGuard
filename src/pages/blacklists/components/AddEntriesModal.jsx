import React, { useState, useEffect } from 'react';
import { X, User, Shield, Search, Trash2, Edit2, Check } from 'lucide-react';

// --- FIELD COMPONENT (STABLE OUTSIDE RENDER) ---
const Field = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</label>
    <input 
      name={name} 
      type={type} 
      value={value || ''} 
      onChange={onChange}
      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all bg-white text-[#031124]" 
    />
  </div>
);

const AddEntriesModal = ({ onClose, onSave, initialData }) => {
  // 1. Initialize entries with data from the batch being edited
  const [entries, setEntries] = useState(initialData?.manualData || []);
  
  // Track if we are currently editing a row from the table
  const [editingId, setEditingId] = useState(null);

  const [currentEntry, setCurrentEntry] = useState({
    name6: '', name1: '', name2: '', name3: '', name4: '', name5: '',
    title: '', nameNonLatin: '', nonLatinType: '', nonLatinLang: '',
    dob: '', townOfBirth: '', countryOfBirth: '',
    nationality: '', passportNum: '', passportDetails: '', nationalId: '', nationalIdDetails: '',
    addr1: '', addr2: '', addr3: '', addr4: '', addr5: '', addr6: '', zipCode: '', country: '',
    otherInfo: '', groupType: '', aliasType: '', aliasQuality: '', regime: '',
    listedOn: '', ukSanctionsListDate: '', lastUpdated: '', groupId: '', 
    source: initialData?.source || '' 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateEntry = () => {
    if (!currentEntry.name1) {
      alert("Please enter at least 'Name 1' to identify this entry.");
      return;
    }

    if (editingId) {
      // UPDATE existing row in the table
      setEntries(entries.map(entry => entry.id === editingId ? { ...currentEntry, id: editingId } : entry));
      setEditingId(null);
    } else {
      // ADD new row to the table
      setEntries([...entries, { ...currentEntry, id: Date.now() }]);
    }
    
    // Reset form but keep the Source
    const sourceVal = currentEntry.source;
    setCurrentEntry({
      name6: '', name1: '', name2: '', name3: '', name4: '', name5: '',
      title: '', nameNonLatin: '', nonLatinType: '', nonLatinLang: '',
      dob: '', townOfBirth: '', countryOfBirth: '',
      nationality: '', passportNum: '', passportDetails: '', nationalId: '', nationalIdDetails: '',
      addr1: '', addr2: '', addr3: '', addr4: '', addr5: '', addr6: '', zipCode: '', country: '',
      otherInfo: '', groupType: '', aliasType: '', aliasQuality: '', regime: '',
      listedOn: '', ukSanctionsListDate: '', lastUpdated: '', groupId: '', source: sourceVal
    });
  };

  // Move data from table back into form to edit it
  const startEditEntry = (entry) => {
    setEditingId(entry.id);
    setCurrentEntry(entry);
    // Scroll form to top
    const formContainer = document.getElementById('manual-form-container');
    if (formContainer) formContainer.scrollTop = 0;
  };

  const removeEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (editingId === id) {
        setEditingId(null);
        // Optional: clear form here if needed
    }
  };

  const handleFinalSave = () => {
    if (entries.length === 0) return alert("Add at least one entry.");
    
    // Construct the full object for the main Blacklists array
    onSave({
      ...initialData, // Keeps the original ID of the batch
      source: currentEntry.source || initialData?.source || "Manual Entry",
      version: initialData?.version || `V${new Date().getFullYear()}.${entries.length}`,
      status: 'ready',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      entriesCount: entries.length.toString(),
      manualData: entries 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-[98vw] h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-[#031124]">
            {initialData ? 'Edit Blacklist Batch' : 'Manual Batch Entry'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-[#F8FAFC]">
          
          {/* LEFT PANEL: FORM */}
          <div className="w-[35%] bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm overflow-hidden">
            <div className={`p-4 border-b font-bold flex items-center justify-between ${editingId ? 'bg-amber-50 text-amber-700 border-amber-100' : 'text-[#031124] border-slate-50'}`}>
              <div className="flex items-center gap-2">
                <User size={16} /> {editingId ? 'Editing Entry...' : 'Entry Details'}
              </div>
              {editingId && <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">Active Edit Mode</span>}
            </div>
            
            <div id="manual-form-container" className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              <Field label="Source" name="source" value={currentEntry.source} onChange={handleInputChange} />
              
              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100">
                {['name6', 'name1', 'name2', 'name3', 'name4', 'name5'].map(n => (
                   <Field key={n} label={n.replace('name', 'Name ')} name={n} value={currentEntry[n]} onChange={handleInputChange} />
                ))}
              </div>

              <Field label="Title" name="title" value={currentEntry.title} onChange={handleInputChange} />
              
              <div className="space-y-3 p-3 bg-slate-50 rounded-xl">
                <Field label="Name Non-Latin Script" name="nameNonLatin" value={currentEntry.nameNonLatin} onChange={handleInputChange} />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Script Type" name="nonLatinType" value={currentEntry.nonLatinType} onChange={handleInputChange} />
                  <Field label="Language" name="nonLatinLang" value={currentEntry.nonLatinLang} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Field label="DOB" name="dob" type="date" value={currentEntry.dob} onChange={handleInputChange} />
                <Field label="Town of Birth" name="townOfBirth" value={currentEntry.townOfBirth} onChange={handleInputChange} />
                <Field label="Country of Birth" name="countryOfBirth" value={currentEntry.countryOfBirth} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Nationality" name="nationality" value={currentEntry.nationality} onChange={handleInputChange} />
                <Field label="Passport Number" name="passportNum" value={currentEntry.passportNum} onChange={handleInputChange} />
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-slate-100">
                {[1,2,3,4,5,6].map(num => (
                  <Field key={num} label={`Address ${num}`} name={`addr${num}`} value={currentEntry[`addr${num}`]} onChange={handleInputChange} />
                ))}
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <Field label="Group ID" name="groupId" value={currentEntry.groupId} onChange={handleInputChange} />
              </div>

              <button 
                onClick={handleAddOrUpdateEntry} 
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                  editingId ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-[#031124] hover:bg-slate-800 text-white'
                }`}
              >
                {editingId ? <Check size={18} /> : null}
                {editingId ? 'Update Entry in Table' : 'Add Entry to Table'}
              </button>
              
              {editingId && (
                <button 
                  onClick={() => {
                    setEditingId(null);
                    setCurrentEntry({...currentEntry, name1: ''}); // Quick clear logic
                  }}
                  className="w-full text-slate-400 text-xs font-medium hover:underline"
                >
                  Cancel Edit
                </button>
              )}
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
                    {["Name 6", "Name 1", "Name 2", "Name 3", "Name 4", "Name 5", "Title", "DOB", "Group ID"].map(head => (
                      <th key={head} className="p-3 border-b whitespace-nowrap min-w-30">{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((e, i) => (
                    <tr key={e.id} className={`hover:bg-slate-50 transition-colors ${editingId === e.id ? 'bg-amber-50' : ''}`}>
                      <td className="p-3 font-bold text-slate-400 sticky left-0 bg-inherit shadow-[1px_0_0_0_#e2e8f0]">{i+1}</td>
                      <td className="p-3 flex gap-1">
                        <button 
                          onClick={() => startEditEntry(e)}
                          className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => removeEntry(e.id)} 
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                      <td className="p-3 whitespace-nowrap">{e.name6}</td>
                      <td className="p-3 whitespace-nowrap font-bold text-[#031124]">{e.name1}</td>
                      <td className="p-3 whitespace-nowrap">{e.name2}</td>
                      <td className="p-3 whitespace-nowrap">{e.name3}</td>
                      <td className="p-3 whitespace-nowrap">{e.name4}</td>
                      <td className="p-3 whitespace-nowrap">{e.name5}</td>
                      <td className="p-3 whitespace-nowrap">{e.title}</td>
                      <td className="p-3 whitespace-nowrap">{e.dob}</td>
                      <td className="p-3 whitespace-nowrap font-bold text-blue-600">{e.groupId}</td>
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
            className="px-10 py-2.5 bg-[#031124] text-white rounded-xl font-bold shadow-xl hover:bg-slate-800"
          >
            {initialData ? 'Update & Save Batch' : `Save ${entries.length} Entries`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEntriesModal;