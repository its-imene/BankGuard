import React, { useState } from "react";
import { X } from "lucide-react";

const EditUserModal = ({ user, onSave, onClose }) => {
  // Pre-fill form with existing user data
  const nameParts = user.name.split(" ");
  const [form, setForm] = useState({
    firstName: nameParts[0] || "",
    lastName:  nameParts.slice(1).join(" ") || "",
    userId:    user.userId || "",
    email:     user.email  || "",
    role:      user.role   || "Admin",
    password:  "",
    status:    user.status || "active",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...user,
      name:   `${form.firstName} ${form.lastName}`,
      role:   form.role,
      status: form.status,
      userId: form.userId,
      email:  form.email,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Manage Users</h2>
          <button onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tab */}
        <div className="px-8 border-b border-slate-100">
          <div className="flex">
            <div className="py-3 text-sm font-semibold text-orange-500 border-b-2 border-orange-400 pr-4">
              Edit User
            </div>
          </div>
        </div>

        {/* Edit mode banner */}
        <div className="flex items-center justify-end gap-2 px-8 py-2 bg-orange-50 border-b border-orange-100">
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
          </svg>
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Edit Mode</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="flex gap-6">

            {/* Avatar */}
            <div className="flex-shrink-0 pt-1">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                <svg className="w-9 h-9 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Fields */}
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-600 placeholder-slate-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
                <input name="userId" value={form.userId} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-600 placeholder-slate-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-600 placeholder-slate-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 text-slate-600 placeholder-slate-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role" value={form.role} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-slate-600">
                  <option value="Admin">Admin</option>
                  <option value="Verification">Verification</option>
                  <option value="Data entry">Data entry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder-slate-300" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-slate-600">
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              {/* Update button */}
              <div className="flex items-end justify-end">
                <button type="submit"
                  className="px-8 py-2 bg-orange-400 hover:bg-orange-500 text-white text-sm font-semibold rounded-lg transition-colors">
                  update
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;