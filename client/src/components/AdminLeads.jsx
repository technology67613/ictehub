import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Phone, Mail, GraduationCap, CheckCircle2, XCircle,
  PhoneCall, MessageSquare, ChevronRight, Clock, ShieldAlert,
  Loader2, Filter, AlertCircle, TrendingUp, Copy, X, Users,
  UserCheck, UserMinus, Activity, Award
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

const STATUS_CONFIG = {
  'new':               { label: 'New',               color: '#64748B', bg: '#F1F5F9', icon: AlertCircle },
  'contacted':         { label: 'Contacted',          color: '#3B82F6', bg: '#EFF6FF', icon: Phone },
  'interested':        { label: 'Interested',         color: '#F59E0B', bg: '#FFFBEB', icon: PhoneCall },
  'not-interested':    { label: 'Not Interested',     color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  'enrolled-college':  { label: 'Enrolled (College)', color: '#10B981', bg: '#ECFDF5', icon: Award },
  'enrolled-institute':{ label: 'Enrolled (Inst.)',   color: '#10B981', bg: '#ECFDF5', icon: Award },
};

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

const AVATAR_COLORS = [
  ['#1E40FF', '#3B82F6'], ['#3B82F6', '#06B6D4'], ['#8B5CF6', '#6366F1'],
  ['#EC4899', '#F43F5E'], ['#10B981', '#059669']
];

function avatarColor(name) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['new'];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }}></span>
      {cfg.label}
    </span>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────────────
function LeadDrawer({ lead, colleges, telecallers, onClose, onAssign, callHistory, savingId, savedFlash, copyToClipboard }) {
  const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG['new'];
  const collegeNames = (lead.interested_college_ids || []).map(id => colleges[id]).filter(Boolean);
  const history = callHistory[lead.id] || [];
  const [colors] = useState(avatarColor(lead.name));

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
            >
              {initials(lead.name)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">{lead.name}</div>
              <StatusBadge status={lead.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

          {/* Status Display (Read-only) */}
          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">Current Pipeline Status</div>
            <StatusBadge status={lead.status} />
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Contact Details</div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 flex-1">{lead.phone}</span>
              <button onClick={() => copyToClipboard(lead.phone, 'phone', lead.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                {savedFlash === `${lead.id}-copy-phone` ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
            {lead.email && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-600 flex-1 truncate">{lead.email}</span>
                <button onClick={() => copyToClipboard(lead.email, 'email', lead.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                  {savedFlash === `${lead.id}-copy-email` ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            )}
            {collegeNames.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-[#EEF2FF] rounded-xl border border-[#1E40FF]/10">
                <GraduationCap size={14} className="text-[#1E40FF] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-bold text-[#1E40FF] uppercase tracking-widest">Interested College</div>
                  <div className="text-sm font-semibold text-[#1E40FF] mt-0.5">{collegeNames.join(', ')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Assign Telecaller Section */}
          <div className="space-y-3">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
              <span>Assign Telecaller</span>
              {savingId === lead.id && <Loader2 size={12} className="animate-spin text-[#1E40FF]" />}
            </div>
            
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              <button
                onClick={() => onAssign(lead.id, null)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  lead.assigned_telecaller_id === null
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <UserMinus size={13} />
                  Unassigned / No Assignee
                </span>
                {lead.assigned_telecaller_id === null && <CheckCircle2 size={13} className="text-emerald-400" />}
              </button>

              {telecallers.map(caller => {
                const isAssigned = lead.assigned_telecaller_id === caller.id;
                return (
                  <button
                    key={caller.id}
                    onClick={() => onAssign(lead.id, caller.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      isAssigned
                        ? 'bg-[#EEF2FF] text-[#1E40FF] border-[#1E40FF]/40 shadow-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <UserCheck size={13} className={isAssigned ? 'text-[#1E40FF]' : 'text-slate-400'} />
                      <span className="truncate">{caller.name || caller.email}</span>
                    </span>
                    {isAssigned && <CheckCircle2 size={13} className="text-[#1E40FF] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {savedFlash === `${lead.id}-assign` && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mt-1 animate-in fade-in">
                <CheckCircle2 size={13} /> Telecaller assigned successfully
              </div>
            )}
          </div>

          {/* Activity/Call History */}
          <div className="space-y-3">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={12} /> Call Logs & History ({history.length})
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-medium">
                No calls logged yet for this lead.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => {
                  const dateObj = new Date(h.call_date);
                  return (
                    <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                          {h.outcome ? h.outcome.replace('-', ' ') : 'Call'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {h.notes && <p className="text-xs text-slate-600 font-medium leading-relaxed">{h.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main AdminLeads Component ──────────────────────────────────────────────
export default function AdminLeads({ token }) {
  const [leads, setLeads] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [colleges, setColleges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [callHistory, setCallHistory] = useState({});
  
  const [savingId, setSavingId] = useState(null);
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    fetchLeads();
    fetchTelecallers();
    fetchColleges();
  }, [token]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelecallers = async () => {
    try {
      const response = await fetch(`${API}/users?role=telecaller`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTelecallers(data || []);
      }
    } catch (err) {
      console.error('Error fetching telecallers:', err);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await fetch(`${API}/colleges`);
      const data = await res.json();
      const map = {};
      (data || []).forEach(c => { map[c.id] = c.name; });
      setColleges(map);
    } catch (err) {}
  };

  const fetchCallHistory = async (leadId) => {
    try {
      const res = await fetch(`${API}/call-logs/${leadId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await res.json();
      setCallHistory(prev => ({ ...prev, [leadId]: Array.isArray(data) ? data : [] }));
    } catch (err) {
      console.error('Error fetching call logs:', err);
    }
  };

  const handleAssignTelecaller = async (leadId, telecallerId) => {
    setSavingId(leadId);
    try {
      const response = await fetch(`${API}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_telecaller_id: telecallerId || null })
      });
      if (!response.ok) throw new Error('Failed to update telecaller assignment');
      
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, assigned_telecaller_id: telecallerId || null } : lead
        )
      );
      setSavedFlash(`${leadId}-assign`);
      setTimeout(() => setSavedFlash(null), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const openLead = (lead) => {
    setSelectedLead(lead);
    if (!callHistory[lead.id]) {
      fetchCallHistory(lead.id);
    }
  };

  const closeLead = () => setSelectedLead(null);

  const copyToClipboard = (text, type, leadId) => {
    navigator.clipboard.writeText(text);
    setSavedFlash(`${leadId}-copy-${type}`);
    setTimeout(() => setSavedFlash(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Status', 'Assigned Telecaller', 'Created Date'];
    const rows = filteredLeads.map(lead => {
      const telecaller = telecallers.find(t => t.id === lead.assigned_telecaller_id);
      const telecallerName = telecaller ? (telecaller.name || telecaller.email) : 'Unassigned';
      const createdDate = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN') : '—';
      return [
        `"${(lead.name || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.status || '').replace(/"/g, '""')}"`,
        `"${telecallerName.replace(/"/g, '""')}"`,
        `"${createdDate}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchVal ||
        lead.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        lead.phone?.includes(searchVal);
      
      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      if (statusFilter === 'new') return lead.status === 'new';
      if (statusFilter === 'contacted') return lead.status === 'contacted';
      if (statusFilter === 'interested') return lead.status === 'interested';
      if (statusFilter === 'enrolled') return lead.status === 'enrolled-college' || lead.status === 'enrolled-institute';
      return true;
    });
  }, [leads, searchVal, statusFilter]);

  const statusCounts = useMemo(() => {
    return leads.reduce((acc, l) => {
      const s = l.status;
      if (s === 'enrolled-college' || s === 'enrolled-institute') {
        acc['enrolled'] = (acc['enrolled'] || 0) + 1;
      } else {
        acc[s] = (acc[s] || 0) + 1;
      }
      return acc;
    }, { new: 0, contacted: 0, interested: 0, enrolled: 0 });
  }, [leads]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading Admin command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total Leads',    value: leads.length, icon: Users,        color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'New Leads',      value: statusCounts['new'], icon: AlertCircle, color: '#64748B', bg: '#F1F5F9' },
            { label: 'Contacted',      value: statusCounts['contacted'], icon: Phone,       color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Interested',     value: statusCounts['interested'], icon: PhoneCall,   color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Enrolled',       value: statusCounts['enrolled'], icon: Award,       color: '#10B981', bg: '#ECFDF5' },
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
              placeholder="Search by name or phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              { key: 'all', label: `All (${leads.length})` },
              { key: 'new', label: `New (${statusCounts['new']})` },
              { key: 'contacted', label: `Contacted (${statusCounts['contacted']})` },
              { key: 'interested', label: `Interested (${statusCounts['interested']})` },
              { key: 'enrolled', label: `Enrolled (${statusCounts['enrolled']})` }
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
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all outline-none cursor-pointer sm:ml-auto border-none"
          >
            Export to CSV
          </button>
        </div>

        {/* ── Leads Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1.2fr_0.8fr_1.2fr_auto] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Lead</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Assigned Telecaller</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredLeads.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No leads match your search criteria</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLeads.map(lead => {
                const colors = avatarColor(lead.name);
                const collegeNames = (lead.interested_college_ids || []).map(id => colleges[id]).filter(Boolean);
                const isSelected = selectedLead?.id === lead.id;
                
                const assignedTC = telecallers.find(tc => tc.id === lead.assigned_telecaller_id);
                const assignedName = assignedTC ? (assignedTC.name || assignedTC.email) : 'Unassigned';

                return (
                  <div
                    key={lead.id}
                    className={`flex flex-col md:grid md:grid-cols-[1.5fr_1fr_1.2fr_0.8fr_1.2fr_auto] gap-3 items-start md:items-center px-4 py-4 md:py-3.5 cursor-pointer transition-colors group ${isSelected ? 'bg-[#EEF2FF]' : 'hover:bg-slate-50/80'}`}
                    onClick={() => openLead(lead)}
                  >
                    {/* Name + Initials */}
                    <div className="flex items-center gap-2.5 min-w-0 w-full md:w-auto">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                      >
                        {initials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">{lead.name}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ID: #{lead.id.substring(0, 6)}</div>
                      </div>
                    </div>

                    {/* Mobile Grid Details */}
                    <div className="grid grid-cols-2 gap-4 w-full md:contents">
                      {/* Phone */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Phone</span>
                        <span className="text-sm text-slate-600 font-semibold truncate">{lead.phone}</span>
                      </div>

                      {/* College */}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">College</span>
                        <span className="text-sm text-slate-500 font-medium truncate">
                          {collegeNames.length > 0 ? collegeNames[0] : <span className="text-slate-300">—</span>}
                        </span>
                      </div>

                      {/* Status badge */}
                      <div className="flex flex-col gap-1 items-start">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Status</span>
                        <StatusBadge status={lead.status} />
                      </div>

                      {/* Assigned Telecaller */}
                      <div className="flex flex-col gap-1 items-start">
                        <span className="md:hidden text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Assigned Telecaller</span>
                        {assignedTC ? (
                          <span className="text-[#1E40FF] bg-[#EEF2FF] px-2.5 py-1.5 rounded-lg border border-[#1E40FF]/15 inline-flex items-center gap-1.5 text-xs font-semibold">
                            {assignedName}
                            {lead.auto_assigned && (
                              <span className="bg-[#1E40FF] text-white text-[8px] font-extrabold uppercase px-1 py-0.5 rounded leading-none shrink-0">
                                Auto
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block text-xs font-semibold">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0 w-full md:w-auto border-t border-slate-100 md:border-none pt-3 md:pt-0 mt-1 md:mt-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openLead(lead)}
                        className="w-full md:w-7 h-9 md:h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-xs md:text-sm font-bold md:font-normal gap-1 border-none cursor-pointer"
                        title="Manage lead & assignment"
                      >
                        <span className="md:hidden">View Details</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filteredLeads.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          )}
        </div>

      </div>

      {/* ── Lead Detail / Assignment Drawer ── */}
      {selectedLead && (
        <LeadDrawer
          lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
          colleges={colleges}
          telecallers={telecallers}
          onClose={closeLead}
          onAssign={handleAssignTelecaller}
          callHistory={callHistory}
          savingId={savingId}
          savedFlash={savedFlash}
          copyToClipboard={copyToClipboard}
        />
      )}
    </div>
  );
}
