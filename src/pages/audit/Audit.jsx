import { useState, useEffect } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import LogsTable from "./components/AuditTable";
//import UsersModal from "../users/UsersModal";

// ── Delete confirmation modal
function DeleteModal({ row, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={22} className="text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-center text-slate-800 font-bold text-base mb-1">Delete this log?</h3>
        <p className="text-center text-slate-500 text-sm mb-6">
          You are about to delete the log for{" "}
          <span className="font-semibold text-slate-700">{row.user.name}</span>.
          <br />This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast notification
function Toast({ name, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
      <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
      Log for <span className="font-semibold">{name}</span> was deleted
    </div>
  );
}

// ── Mock data 
const INITIAL_LOGS = [
  { id: 1, date: "2026-02-25", time: "07:01:19", user: { name: "Benammer Samir", role: "Admin"       }, action: "Uploading", subject: "OFAC SDN List",       ip: "192.168.1.50", status: "Success" },
  { id: 2, date: "2026-02-25", time: "08:14:33", user: { name: "Meziane Lila",   role: "Data Entry"  }, action: "Editing",   subject: "Editing entry", ip: "192.168.1.72", status: "Success" },
  { id: 3, date: "2026-02-25", time: "09:47:05", user: { name: "Kaci Djamel",    role: "Verificator" }, action: "Login",     subject: "Auth System",         ip: "192.168.1.88", status: "Failed"  },
];

// ── Main page 
const Audit = () => {
  const [logs, setLogs]                   = useState(INITIAL_LOGS);
  const [filterStatus, setFilterStatus]   = useState("all");
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [pendingDelete, setPendingDelete]   = useState(null);
  const [toastName, setToastName]           = useState(null);

  const handleDeleteConfirm = () => {
    const name = pendingDelete.user.name;
    setLogs(prev => prev.filter(l => l.id !== pendingDelete.id));
    setPendingDelete(null);
    setToastName(name);
  };

  return (
    <div className="p-8 space-y-3">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Audit Logs</h1>
          <p className="text-slate-500">Track all system activities and security events.</p>
        </div>
        {/* <Manage Roles button>
        <button
          onClick={() => setShowUsersModal(true)}
          className="flex items-center gap-2 bg-[#031124] hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage Roles
        </button>
        */}
      </div>

      {/* Table */}
      <LogsTable
        data={logs}
        currentFilter={filterStatus}
        onFilterChange={setFilterStatus}
        onDeleteRequest={(row) => setPendingDelete(row)}
      />

      {/* Users modal */}
      {showUsersModal && (
        <UsersModal onClose={() => setShowUsersModal(false)} />
      )}

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <DeleteModal
          row={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Toast */}
      {toastName && <Toast name={toastName} onDone={() => setToastName(null)} />}
    </div>
  );
};

export default Audit;