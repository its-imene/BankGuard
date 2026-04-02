import React, { useState } from 'react';
import { X, CloudUpload, Shield, FileText } from 'lucide-react';

const STATUSES = [
  { value: 'READY',      label: 'Ready'      },
  { value: 'VALID',      label: 'Valid'       },
  { value: 'ERRONEOUS',  label: 'Erroneous'  },
  { value: 'PROCESSING', label: 'Processing' },
];

const FormRow = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
    <label className="sm:w-28 text-xs font-bold text-slate-600 shrink-0">{label}</label>
    <div className="flex-1">{children}</div>
  </div>
);

const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium
  outline-none focus:border-[#031124] focus:ring-2 focus:ring-[#031124]/10 transition-all
  bg-white text-slate-800 placeholder:text-slate-400`;

const EditBlacklistModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    source:  item?.source  || '',
    version: item?.version || '',
    status:  item?.status  || 'READY',
    id:      item?.id,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging]     = useState(false);

  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleFile = (file) => { if (file) setSelectedFile(file); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...item,
      source:     formData.source,
      version:    formData.version,
      status:     formData.status,
      fileName:   selectedFile ? selectedFile.name     : item.fileName,
      fileObject: selectedFile ? selectedFile          : item.fileObject,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Edit Blacklist</h3>
              <p className="text-[10px] text-slate-400 font-medium">Modify this regulatory blacklist's details</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FormRow label="Source">
            <input
              className={inputCls}
              required
              value={formData.source}
              onChange={e => setField('source', e.target.value)}
              placeholder="e.g. CTRF"
            />
          </FormRow>

          <FormRow label="Version">
            <input
              className={inputCls}
              required
              value={formData.version}
              onChange={e => setField('version', e.target.value)}
              placeholder="e.g. BL-2024-001"
            />
          </FormRow>

          <FormRow label="Status">
            <select
              className={inputCls + ' cursor-pointer'}
              value={formData.status}
              onChange={e => setField('status', e.target.value)}
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormRow>

          {/* Drop zone */}
          <FormRow label="Document">
            <label
              className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-400 bg-amber-50/40'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center gap-3 text-emerald-600 px-4">
                  <FileText size={22} className="shrink-0" />
                  <div>
                    <p className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-500">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center px-4">
                  <CloudUpload size={24} className="text-slate-300 mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-slate-500">
                    {item?.fileName ? `Current: ${item.fileName}` : 'Drop to replace document'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Excel, XML, HMT or PDF</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </label>
          </FormRow>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#031124] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlacklistModal;