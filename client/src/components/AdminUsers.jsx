import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ShieldAlert, Loader2, Plus, X, AlertCircle,
  Users, UserCheck, Shield, Key, Mail, CheckCircle2, UserPlus,
  PauseCircle, PlayCircle, Trash2, Calendar, PhoneCall, FileText, CheckCircle, GraduationCap, ExternalLink
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

// ─── Modal/Drawer Component ──────────────────────────────────────────────────
function UserFormDrawer({ onClose, onSave, saving }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('telecaller');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Email and Password are required.');
      return;
    }

    const payload = {
      name: name.trim() || null,
      email: email.trim(),
      password: password.trim(),
      role
    };

    onSave(payload);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base">Add New Team Member</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Platform Staff Accounts</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0 border-none bg-transparent cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><UserCheck size={11} /> Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={11} /> Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. rahul@buddhacollege.com"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Key size={11} /> Account Password *</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters recommended"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Shield size={11} /> System Role *</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all cursor-pointer"
            >
              <option value="telecaller">Telecaller (CRM Operator)</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer border-none"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Create User Account
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Reset Password Modal Component ─────────────────────────────────────────
function ResetPasswordModal({ user, onClose, onReset, resetting }) {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    onReset(user.id, newPassword);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 text-[#1E40FF]">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Reset Password</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{user.name || user.email}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                New Temporary Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF] focus:ring-2 focus:ring-[#1E40FF]/15 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none transition-all"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetting}
                className="flex-1 py-3 bg-[#1E40FF] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all outline-none cursor-pointer flex items-center justify-center gap-1.5 border-none"
              >
                {resetting ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                Set Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
function DeleteUserModal({ user, onClose, onDelete, deleting }) {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    if (confirmText === 'DELETE') {
      onDelete(user.id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[70] animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl max-w-md w-full border border-slate-100 shadow-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 text-rose-600">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Confirm Permanent Deletion</h3>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-wide">Danger Zone</p>
            </div>
          </div>

          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            This will permanently delete <strong className="text-slate-800">{user.name || user.email}</strong>'s user credentials. All assigned leads will be unassigned. Historical call logs will be preserved without associated operator names.
          </p>

          <form onSubmit={handleConfirm} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                Type <strong className="text-slate-800">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-50 border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={confirmText !== 'DELETE' || deleting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-500/20 transition-all outline-none border-none cursor-pointer"
              >
                {deleting ? <Loader2 size={13} className="animate-spin inline mr-1" /> : <Trash2 size={13} className="inline mr-1" />}
                Confirm Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Activity Drawer Component ───────────────────────────────────────────────
function ActivityDrawer({ user, token, onClose }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch(`${API}/users/${user.id}/activity`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivity(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [user.id, token]);

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E40FF] to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                {initials}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight">{user.name || 'Staff Member'}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border-none bg-transparent cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-[#1E40FF]" />
              <span className="text-xs font-semibold">Loading user timeline...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Account Created</span>
                <p className="text-xs font-bold text-slate-800">{new Date(user.created_at).toLocaleString()}</p>
              </div>

              {activity?.leads && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Assigned Leads ({activity.leads.length})</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                    {activity.leads.map(l => (
                      <div key={l.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50">
                        <span className="font-bold text-slate-800 truncate">{l.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1E40FF] uppercase">{l.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminUsers({ token }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('staff'); // 'staff' | 'student'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');

  // Modals & drawers
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activityUser, setActivityUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);

  // States
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [token, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const url = activeTab === 'student' ? `${API}/users?role=student` : `${API}/users`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch platform users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (payload) => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${API}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user account');
      }

      const userData = await response.json();
      setUsers(prev => [userData, ...prev]);
      setSavedFlash('create');
      setIsAddOpen(false);
      setTimeout(() => setSavedFlash(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const response = await fetch(`${API}/users/${id}/toggle-active`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to toggle user status');
      const updatedUser = await response.json();
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (id, newPassword) => {
    setResetting(true);
    setError('');
    try {
      const response = await fetch(`${API}/users/${id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to reset password');
      }

      setSavedFlash('reset');
      setResetPasswordUser(null);
      setTimeout(() => setSavedFlash(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    setDeleting(true);
    try {
      const response = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== id));
      setDeleteUser(null);
      setSavedFlash('delete');
      setTimeout(() => setSavedFlash(''), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Extract phone number from email (e.g. 9876543210@student.ictehub -> 9876543210)
  const extractPhone = (user) => {
    if (user.phone) return user.phone;
    if (user.email && user.email.includes('@')) {
      const localPart = user.email.split('@')[0];
      if (/^\d{10}$/.test(localPart)) {
        return `+91 ${localPart}`;
      }
    }
    return user.email || 'N/A';
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (activeTab === 'staff' && u.role === 'student') return false;
      if (activeTab === 'student' && u.role !== 'student') return false;

      if (!searchVal.trim()) return true;
      const s = searchVal.toLowerCase();
      return (
        u.name?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s)
      );
    });
  }, [users, activeTab, searchVal]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const telecallers = users.filter(u => u.role === 'telecaller').length;
    const students = users.filter(u => u.role === 'student').length;
    const paused = users.filter(u => u.is_active === false).length;
    return { total, admins, telecallers, students, paused };
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading platform users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans pb-12">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">User Accounts & Access Management</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage platform staff operators and registered student credentials</p>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 transition-all outline-none cursor-pointer border-none"
          >
            <Plus size={14} /> Add Team Member
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-none ${
              activeTab === 'staff'
                ? 'bg-[#1E40FF] text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users size={15} /> Staff Members ({users.filter(u => u.role !== 'student').length})
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer border-none ${
              activeTab === 'student'
                ? 'bg-[#1E40FF] text-white shadow-md shadow-blue-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <GraduationCap size={15} /> Student Accounts ({users.filter(u => u.role === 'student').length})
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Administrators', value: stats.admins, icon: Shield, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Telecallers', value: stats.telecallers, icon: UserCheck, color: '#8B5CF6', bg: '#F5F3FF' },
            { label: 'Deactivated', value: stats.paused, icon: PauseCircle, color: '#EF4444', bg: '#FEF2F2' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg }}>
                  <Icon size={17} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-xl font-extrabold text-slate-900 leading-tight">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Success Alert */}
        {savedFlash === 'create' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            New staff account successfully created.
          </div>
        )}
        {savedFlash === 'reset' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            Student password has been reset successfully.
          </div>
        )}
        {savedFlash === 'delete' && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            User account has been permanently removed.
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
            <ShieldAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder={activeTab === 'student' ? "Search student by name or phone/email..." : "Search by staff name or email..."}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Directory */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          <div className="hidden md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Name</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{activeTab === 'student' ? 'Phone / Email' : 'Email'}</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role / Type</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Registered On</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No user records match your search criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map(u => {
                const initials = (u.name || u.email || 'U')
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                const formattedDate = u.created_at
                  ? new Date(u.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '—';

                const isPaused = u.is_active === false;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      if (activeTab === 'staff') setActivityUser(u);
                    }}
                    className={`flex flex-col md:grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] gap-3 items-start md:items-center px-4 py-4 md:py-3.5 hover:bg-slate-50/50 transition-colors animate-in fade-in ${activeTab === 'staff' ? 'cursor-pointer' : ''} ${isPaused ? 'opacity-70 bg-slate-50/30' : ''}`}
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2.5 min-w-0 w-full md:w-auto">
                      {u.profile_picture_url ? (
                        <img
                          src={u.profile_picture_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover bg-slate-50 border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E40FF] to-indigo-600 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="truncate">{u.name || <span className="text-slate-400 font-semibold italic">Student User</span>}</span>
                        {isPaused && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-50 text-red-600 border border-red-100 shrink-0">
                            Paused
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile Grid Details */}
                    <div className="grid grid-cols-2 gap-4 w-full md:contents">
                      {/* Email / Phone */}
                      <div className="flex flex-col gap-0.5 min-w-0" title={u.email}>
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                          {activeTab === 'student' ? 'Phone / Email' : 'Email'}
                        </span>
                        <span className="text-sm font-semibold text-slate-600 truncate">
                          {activeTab === 'student' ? extractPhone(u) : u.email}
                        </span>
                      </div>

                      {/* Role Badge */}
                      <div className="flex flex-col gap-1 items-start">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Role</span>
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">
                            Admin
                          </span>
                        ) : u.role === 'student' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-extrabold uppercase tracking-wide">
                            Student
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[9px] font-extrabold uppercase tracking-wide">
                            Telecaller
                          </span>
                        )}
                      </div>

                      {/* Created date */}
                      <div className="flex flex-col gap-0.5 min-w-0 text-sm font-semibold text-slate-400">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Created On</span>
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0 w-full md:w-auto border-t border-slate-100 md:border-none pt-3 md:pt-0 mt-1 md:mt-0" onClick={e => e.stopPropagation()}>
                      {activeTab === 'student' && (
                        <>
                          <button
                            onClick={() => {
                              const searchTerm = u.name || extractPhone(u).replace(/\D/g, '');
                              navigate(`/admin/admissions?search=${encodeURIComponent(searchTerm)}`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1E40FF] border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer text-xs font-extrabold flex items-center gap-1"
                            title="View Linked Application"
                          >
                            <ExternalLink size={12} /> App
                          </button>

                          <button
                            onClick={() => setResetPasswordUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer text-xs font-extrabold flex items-center gap-1"
                            title="Reset Password"
                          >
                            <Key size={12} /> Reset PW
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleToggleActive(u.id)}
                        className={`p-2 rounded border transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs md:text-sm font-bold ${
                          isPaused
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
                        }`}
                        title={isPaused ? 'Unpause account' : 'Pause account'}
                      >
                        {isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                      </button>

                      <button
                        onClick={() => setDeleteUser(u)}
                        className="p-2 rounded bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer flex items-center justify-center gap-1 text-xs md:text-sm font-bold"
                        title="Delete user account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredUsers.length} of {users.length} {activeTab === 'student' ? 'student' : 'staff'} records
            </div>
          )}
        </div>

      </div>

      {/* Add Staff Drawer */}
      {isAddOpen && (
        <UserFormDrawer
          onClose={() => setIsAddOpen(false)}
          onSave={handleCreateUser}
          saving={saving}
        />
      )}

      {/* Activity Drawer */}
      {activityUser && (
        <ActivityDrawer
          user={activityUser}
          token={token}
          onClose={() => setActivityUser(null)}
        />
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={handleResetPassword}
          resetting={resetting}
        />
      )}

      {/* Delete User Modal */}
      {deleteUser && (
        <DeleteUserModal
          user={deleteUser}
          onClose={() => setDeleteUser(null)}
          onDelete={handleDeleteUser}
          deleting={deleting}
        />
      )}
    </div>
  );
}
