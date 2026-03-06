import React from 'react';
import { X, FileUp, Keyboard, ArrowRight } from 'lucide-react';

const BlacklistMethodModal = ({ onClose, onSelectUpload, onSelectManual }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[#031124]">Add Blacklist</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="space-y-4">
          {/* Option: Upload */}
          <button 
            onClick={onSelectUpload}
            className="group w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-[#031124] hover:bg-slate-50 transition-all text-left"
          >
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-[#031124] group-hover:text-white transition-colors">
              <FileUp size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="font-bold text-[#031124] text-sm">Upload File</p>
              <p className="text-slate-500 text-[11px]">Excel, XML, HMT or PDF</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#031124]" />
          </button>

          {/* Option: Manual */}
          <button 
            onClick={onSelectManual}
            className="group w-full flex items-center p-4 border-2 border-slate-100 rounded-2xl hover:border-[#031124] hover:bg-slate-50 transition-all text-left"
          >
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600 group-hover:bg-[#031124] group-hover:text-white transition-colors">
              <Keyboard size={24} />
            </div>
            <div className="ml-4 flex-1">
              <p className="font-bold text-[#031124] text-sm">Manual Entry</p>
              <p className="text-slate-500 text-[11px]">Type in details directly</p>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-[#031124]" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default BlacklistMethodModal;