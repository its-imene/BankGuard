import React, { useState, useEffect } from 'react';
import { X, CloudUpload } from 'lucide-react';

const EditBlacklistModal = ({ item, onClose, onSave }) => {
  // Initialize state with the existing item data
  const [formData, setFormData] = useState({
    source: item?.source || '',
    version: item?.version || '',
    status: item?.status || 'ready',
    id: item?.id
  });
  
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSave({
      ...item, // Keep existing fields like 'date' or 'entries'
      source: formData.source,
      version: formData.version,
      status: formData.status,
      // Update file info only if a new one was selected
      fileName: selectedFile ? selectedFile.name : item.fileName,
      fileObject: selectedFile ? selectedFile.selectedFile : item.fileObject
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden p-8">
        
        <div className="flex justify-between items-start mb-1">
          <div>
            <h3 className="text-xl font-bold text-[#031124]">Edit Blacklist</h3>
            <p className="text-[#64748b] text-[11px] mt-0.5">Modify the details of this regulatory blacklist.</p>
          </div>
          <button onClick={onClose} className="text-[#64748b] hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Source Row */}
          <div className="flex items-center">
            <label className="w-24 text-right text-xs font-bold text-slate-700 mr-6">Source</label>
            <input 
              required
              value={formData.source}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="flex-1 border-2  border-slate-200  rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          {/* Version Row */}
          <div className="flex items-center">
            <label className="w-24 text-right text-xs font-bold text-slate-700 mr-6">Version</label>
            <input 
              required
              value={formData.version}
              onChange={(e) => setFormData({...formData, version: e.target.value})}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
            />
          </div>

          {/* Status Row */}
          <div className="flex items-center">
            <label className="w-24 text-right text-xs font-bold text-slate-700 mr-6">Status</label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none bg-white cursor-pointer"
            >
              <option value="ready">Ready</option>
              <option value="valid">Valid</option>
              <option value="erroneous">Erroneous</option>
              <option value="processing">Processing</option>
            </select>
          </div>

          {/* Document Row (Optional Update) */}
          <div className="flex items-start">
            <label className="w-24 text-right text-xs font-bold text-slate-700 mt-4 mr-6">Document</label>
            <div className="flex-1">
              <label className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-blue-100 rounded-3xl bg-white hover:bg-slate-50 transition-all cursor-pointer">
                <div className="flex flex-col items-center justify-center text-center p-4">
                  <CloudUpload className={`mb-2 ${selectedFile ? 'text-emerald-500' : 'text-[#3b82f6] opacity-40'}`} size={32} />
                  <p className="text-[#3b82f6] font-bold text-xs">
                    {selectedFile ? "New File Selected" : "Click to replace document"}
                  </p>
                  <p className="text-[#3b82f6] opacity-60 text-[9px] mt-1 font-medium truncate max-w-45">
                    {selectedFile ? selectedFile.name : (item.fileName || "Current document")}
                  </p>
                </div>
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-[#031124] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md"
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