import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, ShieldAlert, Loader2, DollarSign, CheckCircle2,
  AlertCircle, Edit2, ToggleLeft, ToggleRight, Award,
  CheckCircle, HelpCircle
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

export default function AdminCommissions({ token }) {
  const [commissions, setCommissions] = useState([]);
  const [leadsMap, setLeadsMap] = useState({});
  const [collegesMap, setCollegesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, received

  // Inline editing state
  const [editingId, setEditingId] = useState(null); // ID of commission being edited
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Saving states
  const [savingId, setSavingId] = useState(null);
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    fetchCommissions();
    fetchLeads();
    fetchColleges();
  }, [token]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/commissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch commissions');
      const data = await response.json();
      setCommissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch(`${API}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const map = {};
        (data || []).forEach(l => { map[l.id] = l.name; });
        setLeadsMap(map);
      }
    } catch (err) {
      console.error('Error fetching leads map:', err);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${API}/colleges`);
      if (response.ok) {
        const data = await response.json();
        const map = {};
        (data || []).forEach(c => { map[c.id] = c.name; });
        setCollegesMap(map);
      }
    } catch (err) {
      console.error('Error fetching colleges map:', err);
    }
  };

  const handleUpdateCommission = async (id, updatedFields) => {
    setSavingId(id);
    try {
      const response = await fetch(`${API}/commissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) throw new Error('Failed to update commission');
      const updatedItem = await response.json();

      setCommissions(prev => prev.map(c => c.id === id ? updatedItem : c));
      setSavedFlash(`${id}-${Object.keys(updatedFields)[0]}`);
      setTimeout(() => setSavedFlash(null), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  const startEdit = (commission) => {
    setEditingId(commission.id);
    setEditValue(commission.amount !== null && commission.amount !== undefined ? commission.amount.toString() : '');
  };

  const saveEdit = (commission) => {
    const trimmed = editValue.trim();
    const numeric = trimmed === '' ? null : Number(trimmed);
    
    if (isNaN(numeric)) {
      alert('Please enter a valid number');
      setEditingId(null);
      return;
    }

    if (numeric === commission.amount) {
      setEditingId(null);
      return;
    }

    handleUpdateCommission(commission.id, { amount: numeric });
  };

  const handleKeyDown = (e, commission) => {
    if (e.key === 'Enter') {
      saveEdit(commission);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const toggleStatus = (commission) => {
    const nextStatus = commission.status === 'received' ? 'pending' : 'received';
    handleUpdateCommission(commission.id, { status: nextStatus });
  };

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      const leadName = c.lead?.name || leadsMap[c.lead_id] || '';
      const collegeName = c.college?.name || collegesMap[c.college_id] || '';
      const matchesSearch = !searchVal || 
        leadName.toLowerCase().includes(searchVal.toLowerCase()) || 
        collegeName.toLowerCase().includes(searchVal.toLowerCase());
      
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return c.status === statusFilter;
    });
  }, [commissions, searchVal, statusFilter, leadsMap, collegesMap]);

  const stats = useMemo(() => {
    return commissions.reduce((acc, c) => {
      acc.total += 1;
      if (c.status === 'received') {
        acc.received += 1;
      } else {
        acc.pending += 1;
        if (c.amount !== null && c.amount !== undefined) {
          acc.pendingAmount += Number(c.amount);
        }
      }
      return acc;
    }, { total: 0, pending: 0, received: 0, pendingAmount: 0 });
  }, [commissions]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading commission records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Commissions', value: stats.total, icon: DollarSign, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Pending',           value: stats.pending, icon: AlertCircle, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Received',          value: stats.received, icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Pending Amount',    value: `₹${stats.pendingAmount.toLocaleString('en-IN')}`, icon: Award, color: '#EF4444', bg: '#FEF2F2' },
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

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
            <ShieldAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── Search + Filter Bar ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by student or college..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              { key: 'all', label: `All (${commissions.length})` },
              { key: 'pending', label: `Pending (${stats.pending})` },
              { key: 'received', label: `Received (${stats.received})` }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border"
                style={statusFilter === item.key
                  ? { backgroundColor: '#1E40FF', color: 'white', borderColor: '#1E40FF' }
                  : { backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Commissions Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Student / Lead</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College Name</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Amount (INR)</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredCommissions.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No commissions found matching your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredCommissions.map(comm => {
                const isEditing = editingId === comm.id;
                const isSaving = savingId === comm.id;

                const resolvedLeadName = comm.lead?.name || leadsMap[comm.lead_id];
                const resolvedCollegeName = comm.college?.name || collegesMap[comm.college_id];

                return (
                  <div
                    key={comm.id}
                    className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Student Name */}
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {resolvedLeadName || <span className="text-slate-400 italic">Unknown Lead</span>}
                    </div>

                    {/* College Name */}
                    <div className="font-semibold text-slate-600 text-sm truncate">
                      {resolvedCollegeName || <span className="text-slate-400 italic">Unknown College</span>}
                    </div>

                    {/* Amount (Editable inline) */}
                    <div className="text-sm font-bold text-slate-800">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(comm)}
                          onKeyDown={e => handleKeyDown(e, comm)}
                          disabled={isSaving}
                          className="w-24 bg-white border border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 px-2 py-1 rounded text-sm font-semibold outline-none transition-all"
                        />
                      ) : (
                        <div 
                          onClick={() => startEdit(comm)}
                          className="inline-flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all select-none"
                          title="Click to edit amount"
                        >
                          <span>{comm.amount !== null && comm.amount !== undefined ? `₹${comm.amount.toLocaleString('en-IN')}` : '—'}</span>
                          <Edit2 size={11} className="text-slate-400 opacity-0 hover:opacity-100 transition-opacity" />
                          {savedFlash === `${comm.id}-amount` && (
                            <span className="text-[10px] text-emerald-600 animate-pulse font-bold ml-1">Saved</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div>
                      {comm.status === 'received' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700">
                          <CheckCircle size={10} className="shrink-0 text-emerald-500" />
                          Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-200 bg-amber-50 text-amber-700">
                          <HelpCircle size={10} className="shrink-0 text-amber-500" />
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Status Toggle Action */}
                    <div className="flex justify-end gap-1.5 shrink-0">
                      <button
                        onClick={() => toggleStatus(comm)}
                        disabled={isSaving}
                        className={`p-1.5 rounded-lg border transition-all ${
                          comm.status === 'received'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                        }`}
                        title={comm.status === 'received' ? 'Mark as Pending' : 'Mark as Received'}
                      >
                        {isSaving ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : comm.status === 'received' ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filteredCommissions.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredCommissions.length} of {commissions.length} commissions
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
