import { useState, useEffect, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import LogsTable from "./components/AuditTable";
import auditService from "../../services/auditService";

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
        <LogsTable data={logs} />
      ) : (
        !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No audit logs found.</p>
          </div>
        )
      )}
    </div>
  );
};

export default Audit;