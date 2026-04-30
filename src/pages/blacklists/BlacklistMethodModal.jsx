import React from 'react';
import { X, FileUp, Keyboard, ArrowRight, Shield } from 'lucide-react';

const METHOD_OPTIONS = [
  {
    key: 'upload',
    icon: FileUp,
    iconBg: 'bg-blue-50 text-blue-600',
    iconHover: 'group-hover:bg-blue-600 group-hover:text-white',
    title: 'Upload File',
    description: 'Excel, XML, HMT or PDF',
    accentColor: 'group-hover:border-blue-500',
  },
  {
    key: 'manual',
    icon: Keyboard,
    iconBg: 'bg-emerald-50 text-emerald-600',
    iconHover: 'group-hover:bg-emerald-600 group-hover:text-white',
    title: 'Manual Entry',
    description: 'Type in details directly',
    accentColor: 'group-hover:border-emerald-500',
  },
];

const BlacklistMethodModal = ({ onClose, onSelectUpload, onSelectManual }) => {
  const handlers = { upload: onSelectUpload, manual: onSelectManual };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#031124] flex items-center justify-center">
              <Shield size={15} className="text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Blacklist</h3>
              <p className="text-[10px] text-slate-400 font-medium">Choose how to add entries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2.5">
          {METHOD_OPTIONS.map(({ key, icon: Icon, iconBg, iconHover, title, description, accentColor }) => (
            <button
              key={key}
              onClick={handlers[key]}
              className={`group w-full flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all text-left ${accentColor}`}
            >
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl transition-colors shrink-0 ${iconBg} ${iconHover}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{description}</p>
              </div>
              <ArrowRight size={15} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlacklistMethodModal;
