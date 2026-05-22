import React, { useState, useMemo, useCallback } from "react";
import { Check, Search } from "lucide-react";

// ── Constants and styles
const ROLE_STYLES = {
  SUPER_ADMIN: "text-indigo-600 font-semibold",
  ADMIN: "text-violet-600 font-semibold",
  COMPLIANCE: "text-orange-600 font-semibold",
  ACCOUNTS: "text-blue-600 font-semibold",
  AUDITOR: "text-rose-600 font-semibold",
  ANALYST: "text-amber-600 font-semibold",
  VERIFICATION: "text-sky-600 font-semibold",
  DATA_ENTRY: "text-emerald-600 font-semibold",
  System: "text-slate-400 font-medium italic",
};

const ACTION_STYLES = {
  ENTITY_CREATED: "bg-teal-100 text-teal-700 border border-teal-200",
  ENTITY_UPDATED: "bg-blue-100 text-blue-700 border border-blue-200",
  ENTITY_REMOVED: "bg-red-100 text-red-600 border border-red-200",
  SANCTIONED_ENTITY_CREATED: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  SANCTIONED_ENTITY_STATUS_CHANGED: "bg-purple-100 text-purple-700 border border-purple-200",
  SANCTIONED_ENTITY_REMOVED: "bg-rose-100 text-rose-700 border border-rose-200",
  REVIEW_CREATED: "bg-orange-100 text-orange-700 border border-orange-200",
};

const AVATAR_COLORS = [
  "bg-violet-200 text-violet-700",
  "bg-sky-200 text-sky-700",
  "bg-amber-200 text-amber-700",
  "bg-pink-200 text-pink-700",
  "bg-teal-200 text-teal-700",
];

// ── Enum constants from backend
const ACTIONS = [
  "all",
  "ENTITY_CREATED",
  "ENTITY_UPDATED",
  "ENTITY_REMOVED",
  "SANCTIONED_ENTITY_CREATED",
  "SANCTIONED_ENTITY_STATUS_CHANGED",
  "SANCTIONED_ENTITY_REMOVED",
  "REVIEW_CREATED",
];

const ROLES = [
  "all",
  "SUPER_ADMIN",
  "ADMIN",
  "COMPLIANCE",
  "ACCOUNTS",
  "AUDITOR",
  "ANALYST",
  "VERIFICATION",
  "DATA_ENTRY",
  "System",
];

// ── Utility functions
const getInitials = (name = "") =>
  name.split(" ").map((w) => (w ? w[0] : "")).slice(0, 2).join("").toUpperCase() || "?";

const getAvatarColor = (name = "") =>
  name ? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] : "bg-slate-200 text-slate-500";

// ── Memoized pill filter component
function PillFilter({ label, value, options, onChange, open, onToggle }) {
  const isActive = value !== "all";

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition-all select-none bg-white ${
          isActive
            ? "border-indigo-500 text-indigo-600 bg-indigo-50 font-medium"
            : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
        }`}
      >
        {isActive ? value : label}
        <svg
          className="w-3 h-3 mt-px opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-56 overflow-y-auto"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => onChange(opt.value)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 capitalize transition-colors"
            >
              {opt.label}
              {value === opt.value && <Check size={13} className="text-slate-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Table component
const LogsTable = React.memo(({ data }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");

  const toggle = useCallback(
    (name) => setOpenDropdown((prev) => (prev === name ? null : name)),
    []
  );

  const pick = useCallback((setter) => (val) => {
    setter(val);
    setOpenDropdown(null);
  }, []);

  // Map raw API data into display-ready rows
  const mappedData = useMemo(() => {
    return data.map((log) => {
      const userObj = log.user || {
        name: log.actorEmail || "System",
        role: "System",
        isSystem: true,
      };

      if (log.user && !userObj.name) {
        userObj.name =
          `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() ||
          log.user.email ||
          "Unknown";
      }

      const dt = new Date(log.createdAt);
      return {
        ...log,
        user: userObj,
        date: dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        subject: log.entityType || "N/A",
        ip: log.metadata?.ip || "—",
      };
    });
  }, [data]);

  // Filter by action, role, and search text
  const displayed = useMemo(() => {
    return mappedData.filter((row) => {
      const matchAction = actionFilter === "all" || row.action === actionFilter;
      const matchRole = roleFilter === "all" || row.user.role === roleFilter;
      const matchSearch =
        !search ||
        row.user.name.toLowerCase().includes(search.toLowerCase()) ||
        row.subject.toLowerCase().includes(search.toLowerCase()) ||
        row.ip.includes(search);

      return matchAction && matchRole && matchSearch;
    });
  }, [mappedData, actionFilter, roleFilter, search]);

  const entriesText = data.length === 1 ? "entry" : "entries";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-slate-800">Security &amp; Compliance Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">{data.length} {entriesText}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <PillFilter
            label="Role"
            value={roleFilter}
            options={ROLES.map((r) => ({ value: r, label: r === "all" ? "All Roles" : r }))}
            onChange={pick(setRoleFilter)}
            open={openDropdown === "role"}
            onToggle={() => toggle("role")}
          />

          <PillFilter
            label="Action"
            value={actionFilter}
            options={[
              { value: "all", label: "All Actions" },
              ...ACTIONS.filter((a) => a !== "all").map((a) => ({ value: a, label: a })),
            ]}
            onChange={pick(setActionFilter)}
            open={openDropdown === "action"}
            onToggle={() => toggle("action")}
          />

          {/* Search */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search user, action, IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent w-32 text-sm placeholder-slate-400 text-slate-700"
              aria-label="Search audit logs"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
              <th className="px-6 py-3 font-semibold">Action</th>
              <th className="px-6 py-3 font-semibold">Subject</th>
              <th className="px-6 py-3 font-semibold">IP Address</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {displayed.length > 0 ? (
              displayed.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(row.user.name)}`}
                        title={row.user.name}
                      >
                        {getInitials(row.user.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-800 text-sm truncate leading-snug">
                          {row.user.name}
                        </span>
                        <span className={`text-xs truncate leading-snug ${ROLE_STYLES[row.user.role] || "text-slate-400"}`}>
                          {row.user.role}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-700 leading-snug">{row.date}</span>
                      <span className="text-xs text-slate-400 leading-snug">{row.time}</span>
                    </div>
                  </td>

                  {/* Action badge */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        ACTION_STYLES[row.action] || "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                      title={row.action}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {row.action}
                    </span>
                  </td>

                  {/* Subject */}
                  <td className="px-6 py-4 text-sm text-slate-700 truncate">{row.subject}</td>

                  {/* IP Address */}
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{row.ip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-slate-400 italic text-sm">
                  No logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

LogsTable.displayName = "LogsTable";

export default LogsTable;