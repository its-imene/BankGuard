import React, { useState, useEffect } from 'react';
import { X, CloudUpload, Loader2, Shield, FileText, LayoutGrid, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'READY',      label: 'Ready'      },
  { value: 'VALID',      label: 'Valid'       },
  { value: 'ERRONEOUS',  label: 'Erroneous'  },
  { value: 'PROCESSING', label: 'Processing' },
];

const FormRow = ({ label, required, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-4">
    <label className="sm:w-28 text-xs font-bold text-slate-600 shrink-0">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <div className="flex-1 w-full">{children}</div>
  </div>
);

const inputCls = `w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium
  outline-none focus:border-[#031124] focus:ring-2 focus:ring-[#031124]/10 transition-all
  bg-white text-slate-800 placeholder:text-slate-400`;

const AddBlacklistModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({ 
    source: '', 
    BlacklistID: '', 
    status: 'READY',
    importMethod: 'file',
    cloudUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // --- SDK Loading & Cloud Pickers ---
  useEffect(() => {
    // Load Dropbox
    if (!window.Dropbox) {
      const script = document.createElement('script');
      script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
      script.id = 'dropboxjs';
      script.dataset.appKey = import.meta.env.VITE_DROPBOX_APP_KEY || '';
      document.body.appendChild(script);
    }
    // Load Google GAPI & GSI
    if (!window.gapi) {
      const gapiScript = document.createElement('script');
      gapiScript.src = 'https://apis.google.com/js/api.js';
      gapiScript.onload = () => window.gapi.load('picker', () => {});
      document.body.appendChild(gapiScript);
    }
    if (!window.google || !window.google.accounts) {
      const gsiScript = document.createElement('script');
      gsiScript.src = 'https://accounts.google.com/gsi/client';
      document.body.appendChild(gsiScript);
    }
  }, []);

  const openGooglePicker = () => {
    const developerKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!developerKey || !clientId) {
      setError('Google API configuration missing in .env');
      return;
    }

    // Helper to build and show the picker
    const showPicker = (accessToken) => {
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.FOLDERS)
        .addView(window.google.picker.ViewId.SPREADSHEETS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(developerKey)
        .setOrigin(window.location.origin)
        .setCallback((data) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            const url = doc.type === 'folder' 
              ? `https://drive.google.com/drive/folders/${doc.id}`
              : `https://docs.google.com/spreadsheets/d/${doc.id}/edit`;
            setField('cloudUrl', url);
          }
        })
        .build();
      picker.setVisible(true);
    };

    // Use GIS to request / get the token
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (response) => {
        if (response.access_token) {
          showPicker(response.access_token);
        }
      },
    });

    tokenClient.requestAccessToken();
  };

  const openDropboxChooser = () => {
    if (!window.Dropbox) return;
    window.Dropbox.choose({
      success: (files) => {
        setField('cloudUrl', files[0].link);
      },
      linkType: 'direct',
      multiselect: false,
      extensions: ['.xlsx', '.xls', '.csv', '.xml'],
    });
  };

  const openOneDrivePicker = () => {
    toast.error('OneDrive integration is currently in development.');
  };

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
    
    const isCloud = formData.importMethod === 'cloud';
    if (!formData.source || (!isCloud && !selectedFile) || (isCloud && !formData.cloudUrl)) {
      setError(`Please fill required fields and ${isCloud ? 'provide a URL' : 'select a file'}.`);
      return;
    }
    setIsUploading(true);
    try {
      if (isCloud) {
        await onSave({
          url: formData.cloudUrl,
          metadata: { source: formData.source, blacklistId: formData.BlacklistID, status: formData.status },
        });
      } else {
        await onSave({
          file: selectedFile,
          metadata: { source: formData.source, blacklistId: formData.BlacklistID, status: formData.status },
        });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Operation failed. Please try again.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#031124] flex items-center justify-center">
              <Shield size={17} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight">New Data Ingestion</h3>
              <p className="text-[10px] text-slate-400 font-medium">Import from local system or cloud providers</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Source" required>
              <input
                className={inputCls}
                value={formData.source}
                onChange={e => setField('source', e.target.value)}
                placeholder="e.g. OFAC"
                required
              />
            </FormRow>
            <FormRow label="Batch Group">
              <input
                className={inputCls}
                value={formData.BlacklistID}
                onChange={e => setField('BlacklistID', e.target.value)}
                placeholder="Auto-generated"
              />
            </FormRow>
          </div>
          <FormRow label="Initial Status">
            <select
              className={inputCls + ' cursor-pointer'}
              value={formData.status}
              onChange={e => setField('status', e.target.value)}
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FormRow>
          <hr className="border-slate-100" />
          <div className="flex gap-2 p-1 bg-slate-100/50 rounded-xl">
            <button
              type="button"
              onClick={() => setField('importMethod', 'file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                formData.importMethod === 'file' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Local Memory
            </button>
            <button
              type="button"
              onClick={() => setField('importMethod', 'cloud')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                formData.importMethod === 'cloud' ? 'bg-white text-[#031124] shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Cloud Network
            </button>
          </div>
          {formData.importMethod === 'file' ? (
            <div className="space-y-4">
              <label
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#031124] bg-blue-50/30'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/30 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2 text-emerald-600">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FileText size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-[10px] text-emerald-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <CloudUpload size={32} className="text-slate-300 mx-auto mb-2" strokeWidth={1} />
                    <p className="text-xs font-bold text-slate-600">Deep Drop File</p>
                    <p className="text-[10px] text-slate-400 mt-1">Excel, XML or PDF · Max 10MB</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={e => handleFile(e.target.files[0])} accept=".xls,.xlsx,.xml,.hmt,.pdf" />
              </label>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Visual Cloud Pickers</p>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={openGooglePicker} className="flex flex-col items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Drive" />
                    <span className="text-[9px] font-bold text-slate-500">Drive</span>
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl opacity-40 cursor-not-allowed group"
                  >
                    <div className="w-5 h-5 flex items-center justify-center grayscale">
                      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 19C14.4624 19 12 16.5376 12 13.5C12 10.4624 14.4624 8 17.5 8C18.4682 8 19.3789 8.25056 20.1663 8.68925C19.6465 5.43859 16.8584 3 13.5 3C10.6309 3 8.1691 4.74718 7.12458 7.23702C4.19159 7.64415 2 10.1654 2 13.25C2 16.4256 4.57437 19 7.75 19H17.5Z" fill="#0078D4"/>
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">OneDrive</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex flex-col items-center gap-2 p-3 bg-slate-50/50 border border-slate-100 rounded-xl opacity-40 cursor-not-allowed group"
                  >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Dropbox_Icon.svg" className="w-5 h-5 grayscale" alt="Dropbox" />
                    <span className="text-[9px] font-bold text-slate-400">Dropbox</span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                <div className="relative flex justify-center text-[9px] uppercase font-black text-slate-300"><span className="bg-white px-2">or paste network address</span></div>
              </div>
              <div className="relative">
                <LayoutGrid className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  className={inputCls + ' pl-10 text-xs'}
                  value={formData.cloudUrl}
                  onChange={e => setField('cloudUrl', e.target.value)}
                  placeholder="https://cloud-storage.com/file.xlsx"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic px-1 leading-relaxed">Pasting a folder URL will trigger a recursive multi-batch import automatically.</p>
            </div>
          )}
          {error && (
            <p className="text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          <div className="flex gap-3 pt-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-3 bg-[#031124] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-[#031124]/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} className="text-orange-400" />}
              {isUploading ? 'Executing…' : 'Finalize Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddBlacklistModal;
