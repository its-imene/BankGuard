import React, { useState } from "react";
import { Check, Trash2, Search } from "lucide-react";

// Styles
const ROLE_STYLES = {
  Admin:        "text-violet-600 font-semibold",
  "Data Entry": "text-sky-500 font-semibold",
  Verificator:  "text-amber-500 font-semibold",
};

const ACTION_STYLES = {
  Adding:    "bg-teal-100 text-teal-700 border border-teal-200",
  Changing:  "bg-blue-100 text-blue-700 border border-blue-200",
  Deleting:  "bg-red-100 text-red-600 border border-red-200",
  Editing:   "bg-purple-100 text-purple-700 border border-purple-200",
  Login:     "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Logout:    "bg-slate-100 text-slate-600 border border-slate-200",
  Update:    "bg-orange-100 text-orange-600 border border-orange-200",
  Uploading: "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

const getStatusStyle = (s) => {
  const l = s?.toLowerCase();
  if (l === "success") return "bg-emerald-500 text-white";
  if (l === "failed") return "bg-red-500 text-white";
  return "bg-slate-100 text-slate-700";
};

const getInitials    = (name = "") => name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
const AVATAR_COLORS  = ["bg-violet-200 text-violet-700","bg-sky-200 text-sky-700","bg-amber-200 text-amber-700","bg-pink-200 text-pink-700","bg-teal-200 text-teal-700"];
const getAvatarColor = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// Constants
const ACTIONS  = ["Login","Logout","Changing","Deleting","Uploading","Update","Editing","Adding"];
const STATUSES = ["all","success","failed"];
const ROLES    = ["all","Admin","Data Entry","Verificator"];

// Pill filter
function PillFilter({ label, value, options, onChange, open, onToggle }) {
  const active = value !== "all";
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm transition-all select-none bg-white ${
          active ? "border-indigo-500 text-indigo-600 bg-indigo-50 font-medium" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50"
        }`}
      >
        {active ? value : label}
        <svg className="w-3 h-3 mt-px opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 max-h-56 overflow-y-auto">
          {options.map((opt) => (
            <button key={opt.value} onClick={() => onChange(opt.value)}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 capitalize">
              {opt.label}
              {value === opt.value && <Check size={13} className="text-slate-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Table component
const LogsTable = ({ data, currentFilter, onFilterChange, onDeleteRequest }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter,   setRoleFilter]   = useState("all");
  const [search, setSearch]             = useState("");

  const toggle = (name) => setOpenDropdown(prev => prev === name ? null : name);
  const pick   = (setter) => (val) => { setter(val); setOpenDropdown(null); };

  const displayed = data.filter((row) => {
    const ms = currentFilter === "all" || row.status.toLowerCase() === currentFilter;
    const ma = actionFilter  === "all" || row.action === actionFilter;
    const mr = roleFilter    === "all" || row.user.role === roleFilter;
    const mq = !search ||
      row.user.name.toLowerCase().includes(search.toLowerCase()) ||
      row.subject.toLowerCase().includes(search.toLowerCase()) ||
      row.ip.includes(search);
    return ms && ma && mr && mq;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

      {/* Title + toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800">Security &amp; Compliance Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">{data.length} entries</p>
        </div>
        <div className="flex items-center gap-2">

          <PillFilter label="Role" value={roleFilter}
            options={ROLES.map(r => ({ value: r, label: r === "all" ? "All Roles" : r }))}
            onChange={pick(setRoleFilter)} open={openDropdown === "role"} onToggle={() => toggle("role")} />

          <PillFilter label="Action" value={actionFilter}
            options={[{ value: "all", label: "All" }, ...ACTIONS.map(a => ({ value: a, label: a }))]}
            onChange={pick(setActionFilter)} open={openDropdown === "action"} onToggle={() => toggle("action")} />

          <PillFilter label="Status" value={currentFilter}
            options={STATUSES.map(s => ({ value: s, label: s === "all" ? "All" : s }))}
            onChange={(val) => { onFilterChange(val); setOpenDropdown(null); }}
            open={openDropdown === "status"} onToggle={() => toggle("status")} />

          {/* Search */}
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Search" value={search} onChange={e => setSearch(e.target.value)}
              className="outline-none bg-transparent w-32 text-sm placeholder-slate-400 text-slate-700" />
          </div>

        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-3 font-semibold">User</th>
              <th className="px-6 py-3 font-semibold">Date &amp; Time</th>
              <th className="px-6 py-3 font-semibold">Action</th>
              <th className="px-6 py-3 font-semibold">Subject</th>
              <th className="px-6 py-3 font-semibold">IP Address</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayed.length > 0 ? displayed.map(row => (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">

                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarColor(row.user.name)}`}>
                      {getInitials(row.user.name)}
                    </div>
                    <div className="flex flex-col" style={{ gap: "1px" }}>
                      <span className="font-medium text-slate-800 text-sm whitespace-nowrap leading-snug">{row.user.name}</span>
                      <span className={`text-xs leading-snug ${ROLE_STYLES[row.user.role] || "text-slate-400"}`}>{row.user.role}</span>
                    </div>
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col" style={{ gap: "1px" }}>
                    <span className="text-sm text-slate-700 leading-snug">{row.date}</span>
                    <span className="text-xs text-slate-400 leading-snug">{row.time}</span>
                  </div>
                </td>

                {/* Action badge */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ACTION_STYLES[row.action] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    {row.action}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">{row.subject}</td>
                <td className="px-6 py-4 text-xs text-slate-500 font-mono">{row.ip}</td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusStyle(row.status)}`}>
                    {row.status}
                  </span>
                </td>

                {/* Trash */}
                <td className="px-6 py-4">
                  <button
                    onClick={() => onDeleteRequest(row)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400 italic text-sm">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsTable;