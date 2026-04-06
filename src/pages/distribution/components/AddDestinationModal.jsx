import React, { useState, useEffect } from 'react';
import { X, Server, Globe, Lock, FileJson, CheckCircle2, AlertCircle, Settings, Plus, ChevronRight } from 'lucide-react';

export default function AddDestinationModal({ isOpen, onClose, onSave, target = null }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    format: 'JSON',
    description: '',
    secretKey: '',
    isActive: true,
    mapping: {}
  });

  const availableFields = [
    'fullName', 'name1', 'name2', 'name3', 'name4', 'name5', 'name6',
    'title', 'nameNonLatin', 'dob', 'townOfBirth', 'countryOfBirth', 
    'nationality', 'passportNum', 'nationalId', 'addr1', 'addr2', 
    'addr3', 'city', 'state', 'zipCode', 'country', 'otherInfo', 
    'groupType', 'groupId', 'listedOn', 'lastUpdated'
  ];

  const formats = [
    { id: 'JSON', label: 'JSON Data', icon: FileJson, desc: 'Standard REST API payload' },
    { id: 'XML', label: 'XML Document', icon: FileJson, desc: 'ISO compatible XML structure' },
    { id: 'EXCEL', label: 'Excel Spreadsheet', icon: FileJson, desc: 'Binary .xlsx with all entries' },
    { id: 'HMT', label: 'UK HMT (Treasury)', icon: FileJson, desc: 'Specific schema for HM Treasury' },
    { id: 'CUSTOM', label: 'Custom Mapper', icon: Settings, desc: 'Define your own field labels' },
  ];

  useEffect(() => {
    if (target) {
      setFormData({
        ...target,
        mapping: target.mapping || {}
      });
    } else {
      setFormData({
        name: '',
        url: '',
        format: 'JSON',
        description: '',
        secretKey: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        isActive: true,
        mapping: {}
      });
    }
  }, [target, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Server size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{target ? 'Edit Destination' : 'Add New Destination'}</h2>
              <p className="text-xs text-slate-500 font-medium tracking-tight">Configure a new external system for data distribution.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Name</label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="e.g. SWIFT Gateway" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Target URL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Endpoint URL</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  type="url" 
                  placeholder="https://api.system.com/webhook" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            {/* Formats Selection */}
            <div className="md:col-span-2 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data Format Output</label>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormData({...formData, format: f.id})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      formData.format === f.id 
                        ? 'border-orange-500 bg-orange-50/50' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <f.icon size={20} className={formData.format === f.id ? 'text-orange-600' : 'text-slate-400'} />
                    <span className={`text-[10px] font-black uppercase ${formData.format === f.id ? 'text-orange-700' : 'text-slate-600'}`}>{f.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic">
                {formats.find(f => f.id === formData.format)?.desc}
              </p>
            </div>

            {/* Custom Mapper Section */}
            {formData.format === 'CUSTOM' && (
              <div className="md:col-span-2 bg-slate-50 rounded-[2rem] p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                      <Settings size={14} />
                    </div>
                    <span className="text-xs font-black uppercase text-slate-700 tracking-widest">Field Mapping Configuration</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const newMapping = { ...formData.mapping };
                      newMapping['New_Label_' + Object.keys(newMapping).length] = 'fullName';
                      setFormData({...formData, mapping: newMapping});
                    }}
                    className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {Object.entries(formData.mapping).map(([label, internal], idx) => (
                    <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                      <input 
                        type="text"
                        value={label}
                        onChange={(e) => {
                          const newMapping = { ...formData.mapping };
                          const oldVal = newMapping[label];
                          delete newMapping[label];
                          newMapping[e.target.value] = oldVal;
                          setFormData({...formData, mapping: newMapping});
                        }}
                        placeholder="External Label"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
                      />
                      <ChevronRight size={14} className="text-slate-300" />
                      <select 
                        value={internal}
                        onChange={(e) => {
                          const newMapping = { ...formData.mapping };
                          newMapping[label] = e.target.value;
                          setFormData({...formData, mapping: newMapping});
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-orange-500"
                      >
                        {availableFields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        onClick={() => {
                          const newMapping = { ...formData.mapping };
                          delete newMapping[label];
                          setFormData({...formData, mapping: newMapping});
                        }}
                        className="p-1 px-2 text-red-400 hover:text-red-600 font-bold"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {Object.keys(formData.mapping).length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
                      No custom fields added yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Secret Key */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">HMAC Shared Secret</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input 
                  value={formData.secretKey}
                  readOnly
                  type="text" 
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-12 py-3 text-xs font-mono font-bold text-slate-500 outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, secretKey: Math.random().toString(36).substring(2, 15)})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-[10px] uppercase hover:text-orange-700"
                >
                  Regenerate
                </button>
              </div>
              <div className="flex gap-2 items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <Shield size={12} />
                <span>Payloads will be cryptographically signed using this key.</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-4">
             <div className="flex items-center gap-3">
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                </div>
                <span className="text-xs font-bold text-slate-500">{formData.isActive ? 'System Active' : 'System Disabled'}</span>
             </div>
             <div className="flex gap-3">
                <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" className="px-8 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all">
                  {target ? 'Update System' : 'Create System'}
                </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
