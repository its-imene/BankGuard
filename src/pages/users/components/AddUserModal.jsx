import React, { useState } from "react";
import { X } from "lucide-react";

const AddUserModal = ({ onSave, onClose }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "COMPLIANCE", // Using RoleEnum values
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      console.error("Failed to save user", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Invite New User</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8">
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input 
                name="firstName" 
                value={form.firstName} 
                onChange={handleChange} 
                required
                placeholder="John"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input 
                name="lastName" 
                value={form.lastName} 
                onChange={handleChange} 
                required
                placeholder="Doe"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input 
                name="email" 
                type="email" 
                value={form.email} 
                onChange={handleChange} 
                required
                placeholder="john.doe@bank.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone (Optional)</label>
              <input 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="+213 555 000 000"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
              <select 
                name="role" 
                value={form.role} 
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#ff6b6b] focus:border-[#ff6b6b] outline-none transition-all bg-white"
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="COMPLIANCE">Compliance Officer</option>
                <option value="ACCOUNTS">Accounts</option>
                <option value="AUDITOR">Auditor</option>
                <option value="ANALYST">Analyst</option>
                <option value="VERIFICATION">Verification</option>
                <option value="DATA_ENTRY">Data Entry</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#ff5925] text-white font-bold rounded-xl hover:bg-[#e04e1e] transition-all shadow-lg shadow-[#ff5925]/20 disabled:opacity-50"
            >
              {isSubmitting ? "Sending Invite..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
