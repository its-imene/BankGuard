import React from 'react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // danger, info, success
}) => {
  if (!isOpen) return null;

  const colors = {
    danger:  { btn: 'bg-red-600 hover:bg-red-700 shadow-red-200', icon: 'text-red-500 bg-red-50', border: 'border-red-100' },
    info:    { btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200', icon: 'text-blue-500 bg-blue-50', border: 'border-blue-100' },
    success: { btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200', icon: 'text-emerald-500 bg-emerald-50', border: 'border-emerald-100' },
  };

  const style = colors[type] || colors.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header/Icon */}
        <div className="p-6 pb-0 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${style.icon}`}>
            {type === 'danger' && <AlertTriangle size={28} />}
            {type === 'info' && <Info size={28} />}
            {type === 'success' && <CheckCircle2 size={28} />}
          </div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 mt-2 px-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 h-11 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-slate-400/30 ${style.btn}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;
