import React, { useState } from "react";
import { Edit2, Trash2, Search, Check, Filter } from "lucide-react";

const ROLES = ["all", "SUPER_ADMIN", "ADMIN", "VERIFICATION", "DATA_ENTRY"];

const getRolePill = (role) => {
  switch (role?.toUpperCase()) {
    case "SUPER_ADMIN":  return "bg-indigo-100 text-indigo-700 border border-indigo-200";
    case "ADMIN":        return "bg-purple-100 text-purple-700 border border-purple-200";
    case "COMPLIANCE":   return "bg-orange-100 text-orange-700 border border-orange-200";
    case "ACCOUNTS":     return "bg-blue-100 text-blue-700 border border-blue-200";
    case "AUDITOR":      return "bg-rose-100 text-rose-700 border border-rose-200";
    case "ANALYST":      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "VERIFICATION": return "bg-sky-100 text-sky-700 border border-sky-200";
    case "DATA_ENTRY":   return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    default:             return "bg-slate-100 text-slate-500 border border-slate-200";
  }
};

const getStatusBadge = (isConfirmed) => {
  if (isConfirmed)
    return "bg-emerald-500 text-white";
  return "bg-slate-400 text-white"; // inactive / pending
};

const AVATAR_COLORS = [
  "bg-slate-100 text-slate-500 border border-slate-300",
  "bg-emerald-50 text-emerald-500 border border-emerald-200",
  "bg-rose-50 text-rose-400 border border-rose-200",
  "bg-sky-50 text-sky-500 border border-sky-200",
  "bg-violet-50 text-violet-500 border border-violet-200",
];
const getAvatarStyle = (name = "") => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials    = (firstName = "", lastName = "") => `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

const UsersTable = ({ users, onDeleteRequest, onEditRequest }) => {
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [roleOpen, setRoleOpen]     = useState(false);

  const displayed = users.filter(u => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const mr = roleFilter === "all" || u.role === roleFilter;
    const mq = !search ||
      fullName.includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return mr && mq;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all w-72">
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <input type="text" placeholder="Search by name or by User ID ..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="outline-none bg-transparent w-full text-sm placeholder-slate-400 text-slate-700" />
        </div>

        <div className="relative">
          <button onClick={() => setRoleOpen(v => !v)}
            className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm transition-all bg-white ${
              roleFilter !== "all"
                ? "border-indigo-400 text-indigo-600 bg-indigo-50 font-medium"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}>
            <Filter size={13} className="opacity-60" />
            {roleFilter !== "all" ? roleFilter : "Role"}
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {roleOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
              {ROLES.map(r => (
                <button key={r} onClick={() => { setRoleFilter(r); setRoleOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 capitalize">
                  {r === "all" ? "All Roles" : r}
                  {roleFilter === r && <Check size={13} className="text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-3 text-sm font-semibold text-indigo-500">Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-indigo-500">Role</th>
              <th className="px-6 py-3 text-sm font-semibold text-indigo-500 text-center">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-indigo-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.length > 0 ? displayed.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">

                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${getAvatarStyle(user.firstName)}`}>
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">{user.firstName} {user.lastName}</span>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRolePill(user.role)}`}>
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(user.isConfirmed)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    {user.isConfirmed ? "Active" : "Pending"}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEditRequest(user)}
                      className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteRequest(user)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-16 text-center text-slate-400 italic text-sm">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;