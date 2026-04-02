import { useState, useEffect, useCallback } from "react";
import { Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import LogsTable from "./components/AuditTable";
import auditService from "../../services/auditService";

// ── Delete confirmation modal
function DeleteModal({ row, isLoading, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" 
        onClick={onCancel}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />

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
          <span className="font-semibold text-slate-700">{row.user?.firstName || row.user?.name || 'System'}</span>.
          <br />This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast notification with auto-dismiss
function Toast({ type = "success", name, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const config = {
    success: {
      bg: "bg-slate-800",
      icon: <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />,
      text: `Log for ${name} was deleted`,
    },
    error: {
      bg: "bg-red-900",
      icon: <AlertCircle size={17} className="text-red-300 flex-shrink-0" />,
      text: `Failed to delete log for ${name}`,
    },
  };

  const current = config[type];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${current.bg} text-white text-sm px-5 py-3 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      {current.icon}
      <span><span className="font-semibold">{name}</span> — {current.text}</span>
    </div>
  );
}

// ── Error state component
function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
      <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
      <p className="text-red-700 font-medium mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// ── Main page 
const Audit = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch logs with improved error handling
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditService.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(err.message || "Failed to load audit logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!pendingDelete) return;

    setIsDeleting(true);
    try {
      // Optional: Uncomment if your backend supports deletion
      // await auditService.deleteAuditLog(pendingDelete.id);
      
      const name = pendingDelete.user?.firstName || pendingDelete.user?.name || 'System';
      setLogs(prev => prev.filter(l => l.id !== pendingDelete.id));
      setToast({ type: "success", name });
      setPendingDelete(null);
    } catch (err) {
      console.error("Failed to delete log:", err);
      const name = pendingDelete.user?.firstName || pendingDelete.user?.name || 'System';
      setToast({ type: "error", name });
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete]);

  if (isLoading && logs.length === 0) {
    return (
      <div className="p-8 space-y-3">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Audit Logs</h1>
            <p className="text-slate-500">Track all system activities and security events.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-12">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-3">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Audit Logs</h1>
          <p className="text-slate-500">Track all system activities and security events.</p>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <ErrorState message={error} onRetry={fetchLogs} />
      )}

      {/* Table or empty state */}
      {logs.length > 0 ? (
        <LogsTable
          data={logs}
          currentFilter={filterStatus}
          onFilterChange={setFilterStatus}
          onDeleteRequest={(row) => setPendingDelete(row)}
        />
      ) : (
        !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No audit logs found.</p>
          </div>
        )
      )}

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <DeleteModal
          row={pendingDelete}
          isLoading={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast 
          type={toast.type} 
          name={toast.name} 
          onDone={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default Audit;