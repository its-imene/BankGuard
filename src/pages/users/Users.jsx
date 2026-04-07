import { useState, useEffect } from "react";
import { CheckCircle2, Trash2, AlertCircle, Copy, ExternalLink, Link2 } from "lucide-react";
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
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);

  const styles = type === "error"
    ? {
        wrapper: "bg-red-900",
        icon: <AlertCircle size={17} className="text-red-300 flex-shrink-0" />,
      }
    : {
        wrapper: "bg-slate-800",
        icon: <CheckCircle2 size={17} className="text-emerald-400 flex-shrink-0" />,
      };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 ${styles.wrapper} text-white text-sm px-5 py-3 rounded-xl shadow-xl`}>
      {styles.icon}
      <span>{message}</span>
    </div>
  );
}

function InviteLinkModal({ data, onCopy, onOpen, onClose }) {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Link2 size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invite Link</h2>
              <p className="text-sm text-slate-500">
                {data.userName ? `Access link for ${data.userName}` : "Use this link to complete account setup."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
            <Trash2 size={0} className="hidden" />
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Invite URL</label>
            <textarea
              readOnly
              value={data.inviteUrl}
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 text-sm outline-none resize-none"
            />
          </div>

          {data.invitationDelivery && (
            <p className="text-xs text-slate-500">
              Delivery mode: <span className="font-semibold text-slate-700">{data.invitationDelivery}</span>
            </p>
          )}

          {data.invitationWarning && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{data.invitationWarning}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onOpen}
              className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              <ExternalLink size={16} />
              Open Link
            </button>
            <button
              type="button"
              onClick={onCopy}
              className="flex items-center gap-2 px-6 py-3 bg-[#031124] text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              <Copy size={16} />
              Copy Link
            </button>
          </div>
        </div>
      </div>
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
  const [inviteLinkData, setInviteLinkData] = useState(null);

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
      const response = await userService.createUser(newUser);
      await fetchUsers();
      setShowAddModal(false);

      if (response?.inviteUrl) {
        setInviteLinkData({
          inviteUrl: response.inviteUrl,
          invitationDelivery: response.invitationDelivery,
          invitationWarning: response.invitationWarning,
          userName: `${response.firstName || newUser.firstName} ${response.lastName || newUser.lastName}`,
        });
        setToast({ type: "success", message: "User created. Copy the invite link." });
      } else {
        setToast({ type: "success", message: `${newUser.firstName} was created successfully` });
      }
    } catch (err) {
      console.error("Failed to invite user", err);
      setToast({ type: "error", message: "Failed to create user" });
      throw err;
    }
  };

  const handleEditSave = async (updatedUser) => {
    const { id, ...payload } = updatedUser;
    try {
      await userService.updateUser(id, payload);
      await fetchUsers();
      setEditingUser(null);
      setToast({ type: "success", message: `${updatedUser.firstName} was updated successfully` });
    } catch (err) {
      console.error("Failed to update user", err);
      setToast({ type: "error", message: "Failed to update user" });
    }
  };

  const handleDeleteConfirm = async () => {
    const name = `${pendingDelete.firstName} ${pendingDelete.lastName}`;
    try {
      await userService.deleteUser(pendingDelete.id);
      await fetchUsers();
      setPendingDelete(null);
      setToast({ type: "success", message: `${name} was deleted` });
    } catch (err) {
      console.error("Failed to delete user", err);
      setToast({ type: "error", message: "Failed to delete user" });
    }
  };

  const handleCopyInviteLink = async () => {
    if (!inviteLinkData?.inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteLinkData.inviteUrl);
      setToast({ type: "success", message: "Invite link copied to clipboard" });
    } catch (err) {
      console.error("Failed to copy invite link", err);
      setToast({ type: "error", message: "Failed to copy invite link" });
    }
  };

  const handleOpenInviteLink = () => {
    if (!inviteLinkData?.inviteUrl) return;
    window.open(inviteLinkData.inviteUrl, "_blank", "noopener,noreferrer");
  };

  const handleInviteLinkRequest = async (user) => {
    try {
      const response = await userService.getInviteLink(user.id);
      setInviteLinkData({
        inviteUrl: response.inviteUrl,
        invitationDelivery: response.invitationDelivery,
        invitationWarning: response.invitationWarning,
        userName: `${user.firstName} ${user.lastName}`,
      });
    } catch (err) {
      console.error("Failed to fetch invite link", err);
      setToast({ type: "error", message: "Failed to fetch invite link" });
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
        onInviteLinkRequest={handleInviteLinkRequest}
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

      <InviteLinkModal
        data={inviteLinkData}
        onCopy={handleCopyInviteLink}
        onOpen={handleOpenInviteLink}
        onClose={() => setInviteLinkData(null)}
      />

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onDone={() => setToast(null)} />}
    </div>
  );
}
