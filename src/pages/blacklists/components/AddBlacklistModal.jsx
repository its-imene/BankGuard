import React, { useState } from 'react';
import { X, CloudUpload, Loader2, Shield, FileText } from 'lucide-react';

const STATUSES = [
  { value: 'READY',      label: 'Ready'      },
  { value: 'VALID',      label: 'Valid'       },
  { value: 'ERRONEOUS',  label: 'Erroneous'  },
  { value: 'PROCESSING', label: 'Processing' },
];

const FormRow = ({ label, required, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
    <label className="sm:w-28 text-xs font-bold text-slate-600 shrink-0">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="flex-1">{children}</div>
  </div>
);

const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium
  outline-none focus:border-[#031124] focus:ring-2 focus:ring-[#031124]/10 transition-all
  bg-white text-slate-800 placeholder:text-slate-400`;

const AddBlacklistModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ source: '', BlacklistID: '', status: 'READY' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleFile = (file) => { if (file) setSelectedFile(file); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.source || !formData.BlacklistID || !selectedFile) {
      setError('Please fill all required fields and select a file.');
      return;
    }
    setIsUploading(true);
    try {
      await onSave({
        file: selectedFile,
        metadata: { source: formData.source, blacklistId: formData.BlacklistID, status: formData.status },
      });
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#031124] flex items-center justify-center">
              <Shield size={17} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Blacklist</h3>
              <p className="text-[10px] text-slate-400 font-medium">Upload a file containing blacklist entries</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <FormRow label="Source" required>
            <input
              className={inputCls}
              value={formData.source}
              onChange={e => setField('source', e.target.value)}
              placeholder="e.g. CTRF, OFAC"
              required
            />
          </FormRow>

          <FormRow label="Blacklist ID" required>
            <input
              className={inputCls}
              value={formData.BlacklistID}
              onChange={e => setField('BlacklistID', e.target.value)}
              placeholder="e.g. BL-2024-001"
              required
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
          <FormRow label="Document" required>
            <label
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-400 bg-blue-50/50'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/40'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center gap-3 text-emerald-600">
                  <FileText size={24} className="shrink-0" />
                  <div>
                    <p className="text-sm font-bold truncate max-w-[220px]">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-500">{(selectedFile.size / 1024).toFixed(1)} KB · Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <CloudUpload size={28} className="text-slate-300 mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-600">Drop file here or <span className="text-blue-500">browse</span></p>
                  <p className="text-xs text-slate-400 mt-0.5">Excel, XML, HMT or PDF · Max 10MB</p>
                </div>
              )}
              <input type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} accept=".xls,.xlsx,.xml,.hmt,.pdf" />
            </label>
          </FormRow>

          {error && (
            <p className="text-xs text-red-500 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
          )}

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
              disabled={isUploading}
              className="flex-1 py-2.5 bg-[#031124] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading && <Loader2 size={15} className="animate-spin" />}
              {isUploading ? 'Processing…' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBlacklistModal;