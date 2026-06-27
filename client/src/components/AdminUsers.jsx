import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ShieldAlert, Loader2, Plus, X, AlertCircle,
  Users, UserCheck, Shield, Key, Mail, CheckCircle2, UserPlus
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
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
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
              placeholder="e.g. rahul@ictehub.com"
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
            className="w-full py-3 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Create User Account
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');

  // Drawer states
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/users`, {
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
      setSavedFlash(true);
      setIsOpen(false);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      !searchVal ||
      u.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [users, searchVal]);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const telecallers = users.filter(u => u.role === 'telecaller').length;
    return { total, admins, telecallers };
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
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Team Members</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage administrative and telecalling operator staff credentials</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 transition-all outline-none"
          >
            <Plus size={14} /> Add Team Member
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: stats.total, icon: Users, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Administrators', value: stats.admins, icon: Shield, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Telecallers', value: stats.telecallers, icon: UserCheck, color: '#8B5CF6', bg: '#F5F3FF' },
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
        {savedFlash && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            New staff account successfully created.
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
              placeholder="Search by staff name or email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table Directory */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Name</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Role</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Created On</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No team members match your criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
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

                return (
                  <div
                    key={u.id}
                    className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors animate-in fade-in"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-2.5 min-w-0">
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
                      <div className="font-bold text-slate-900 text-sm truncate">
                        {u.name || <span className="text-slate-400 font-semibold italic">No name set</span>}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="text-sm font-semibold text-slate-500 truncate" title={u.email}>
                      {u.email}
                    </div>

                    {/* Role Badge */}
                    <div>
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wide">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[9px] font-extrabold uppercase tracking-wide">
                          Telecaller
                        </span>
                      )}
                    </div>

                    {/* Created date */}
                    <div className="text-sm font-semibold text-slate-400 text-right">
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredUsers.length} of {users.length} staff records
            </div>
          )}
        </div>

      </div>

      {/* Drawer */}
      {isOpen && (
        <UserFormDrawer
          onClose={() => setIsOpen(false)}
          onSave={handleCreateUser}
          saving={saving}
        />
      )}
    </div>
  );
}
