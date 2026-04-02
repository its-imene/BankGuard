import { useState, useEffect } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import UsersTable from "./components/UsersTable";
import AddUserModal from "./components/AddUserModal";
import EditUserModal from "./components/EditUserModal";
import userService from "../../services/userService";

// ── Delete confirmation modal ──────────────────────────────────
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 size={22} className="text-red-500" />
          </div>
        </div>
        <h3 className="text-center text-slate-800 font-bold text-base mb-1">Delete this user?</h3>
        <p className="text-center text-slate-500 text-sm mb-6">
          You are about to delete{" "}
          <span className="font-semibold text-slate-700">{user.firstName} {user.lastName}</span>.
          <br />This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-800 text-white text-sm px-5 py-3 rounded-xl shadow-xl">
      <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────
export default function Users() {
  const [users, setUsers]                 = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [editingUser, setEditingUser]     = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast]                 = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      await userService.createUser(newUser);
      await fetchUsers();
      setShowAddModal(false);
      setToast(`${newUser.firstName} was invited successfully`);
    } catch (err) {
      console.error("Failed to invite user", err);
    }
  };

  const handleEditSave = async (updatedUser) => {
    const { id, ...payload } = updatedUser;
    try {
      await userService.updateUser(id, payload);
      await fetchUsers();
      setEditingUser(null);
      setToast(`${updatedUser.firstName} was updated successfully`);
    } catch (err) {
      console.error("Failed to update user", err);
    }
  };

  const handleDeleteConfirm = async () => {
    const name = `${pendingDelete.firstName} ${pendingDelete.lastName}`;
    try {
      await userService.deleteUser(pendingDelete.id);
      await fetchUsers();
      setPendingDelete(null);
      setToast(`${name} was deleted`);
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Manage Users</h1>
          <p className="text-slate-500">Manage your team members and their roles.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#031124] hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Users
        </button>
      </div>

      {/* Table */}
      <UsersTable
        users={users}
        onDeleteRequest={(user) => setPendingDelete(user)}
        onEditRequest={(user) => setEditingUser(user)}
      />

      {/* Add modal */}
      {showAddModal && (
        <AddUserModal
          onSave={handleAddUser}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onSave={handleEditSave}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* Delete confirmation */}
      {pendingDelete && (
        <DeleteModal
          user={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}