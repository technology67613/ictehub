import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Phone, Mail, GraduationCap, CheckCircle2, XCircle,
  PhoneCall, MessageSquare, ChevronDown, ChevronUp, ChevronRight,
  ThumbsUp, ThumbsDown, Clock, PhoneOff, Calendar, ShieldAlert,
  Loader2, Filter, Send, Flame, AlertCircle, TrendingUp,
  Copy, X, Users, BarChart2, Activity
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

const STATUS_CONFIG = {
  'new':               { label: 'New',               color: '#64748B', bg: '#F1F5F9', icon: AlertCircle },
  'contacted':         { label: 'Contacted',          color: '#3B82F6', bg: '#EFF6FF', icon: Phone },
  'interested':        { label: 'Interested',         color: '#F59E0B', bg: '#FFFBEB', icon: Flame },
  'not-interested':    { label: 'Not Interested',     color: '#EF4444', bg: '#FEF2F2', icon: XCircle },
  'enrolled-college':  { label: 'Enrolled (College)', color: '#10B981', bg: '#ECFDF5', icon: GraduationCap },
  'enrolled-institute':{ label: 'Enrolled (Inst.)',   color: '#10B981', bg: '#ECFDF5', icon: GraduationCap },
};

const OUTCOME_CONFIG = {
  'interested':      { label: 'Interested',  icon: ThumbsUp,   color: '#3B82F6' },
  'not-interested':  { label: 'Not Interested', icon: ThumbsDown, color: '#EF4444' },
  'call-back-later': { label: 'Call Back',   icon: Clock,      color: '#F59E0B' },
  'no-answer':       { label: 'No Answer',   icon: PhoneOff,   color: '#94A3B8' },
};

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

const AVATAR_COLORS = [
  ['#6366F1','#8B5CF6'], ['#3B82F6','#06B6D4'], ['#F59E0B','#EF4444'],
  ['#EC4899','#F43F5E'], ['#8B5CF6','#6366F1'],
];

function avatarColor(name) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['new'];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }}></span>
      {cfg.label}
    </span>
  );
}

// ─── Drawer ──────────────────────────────────────────────────────────────────
function LeadDrawer({ lead, colleges, onClose, onUpdateStatus, onSubmitLog, callHistory, savingId, savedFlash, noteText, setNoteText, noteOutcome, setNoteOutcome, handleTextareaResize, copyToClipboard }) {
  const status = STATUS_CONFIG[lead.status] || STATUS_CONFIG['new'];
  const StatusIcon = status.icon;
  const collegeNames = (lead.interested_college_ids || []).map(id => colleges[id]).filter(Boolean);
  const history = callHistory[lead.id] || [];
  const [colors] = useState(avatarColor(lead.name));
  const isEnrolled = lead.status === 'enrolled-college' || lead.status === 'enrolled-institute';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-opacity"
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Contact</div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-sm font-semibold text-slate-700 flex-1">{lead.phone}</span>
              <button onClick={() => copyToClipboard(lead.phone, 'phone', lead.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                {savedFlash === `${lead.id}-copy-phone` ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
            {lead.email && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <span className="text-sm font-medium text-slate-600 flex-1 truncate">{lead.email}</span>
                <button onClick={() => copyToClipboard(lead.email, 'email', lead.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                  {savedFlash === `${lead.id}-copy-email` ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            )}
            {collegeNames.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
                <GraduationCap size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Interested College</div>
                  <div className="text-sm font-semibold text-indigo-800 mt-0.5">{collegeNames.join(', ')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Quick Actions</div>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noreferrer"
                className="flex flex-col items-center gap-1.5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <MessageSquare size={16} />
                WhatsApp
              </a>
              <a
                href={`tel:${lead.phone}`}
                className="flex flex-col items-center gap-1.5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <PhoneCall size={16} />
                Call
              </a>
              <a
                href={`mailto:${lead.email || ''}`}
                className={`flex flex-col items-center gap-1.5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors ${!lead.email && 'opacity-40 pointer-events-none'}`}
              >
                <Mail size={16} />
                Email
              </a>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Update Status</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = lead.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => onUpdateStatus(lead.id, key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold border transition-all"
                    style={isSelected
                      ? { backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.color + '40' }
                      : { backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }
                    }
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="truncate">{cfg.label}</span>
                    {isSelected && <CheckCircle2 size={12} className="ml-auto shrink-0" style={{ color: cfg.color }} />}
                  </button>
                );
              })}
            </div>
            {savedFlash === lead.id && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mt-2">
                <CheckCircle2 size={13} /> Status updated
              </div>
            )}
          </div>

          {/* Log Activity */}
          <div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Log Activity</div>
            <div className="bg-slate-50 rounded-xl p-3 space-y-3">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onInput={handleTextareaResize}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-lg p-3 text-sm min-h-[80px] resize-none outline-none placeholder:text-slate-400 font-medium transition-all"
                placeholder="Add your call notes here..."
              />

              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Call Outcome</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(OUTCOME_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    const isSelected = noteOutcome === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setNoteOutcome(key)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold border transition-all"
                        style={isSelected
                          ? { backgroundColor: cfg.color + '15', color: cfg.color, borderColor: cfg.color + '40' }
                          : { backgroundColor: 'white', color: '#64748B', borderColor: '#E2E8F0' }
                        }
                      >
                        <Icon size={12} className="shrink-0" />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => onSubmitLog(lead.id)}
                disabled={!noteText.trim() || savingId === lead.id + '-note'}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-colors"
              >
                {savingId === lead.id + '-note' ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : savedFlash === lead.id + '-note' ? (
                  <><CheckCircle2 size={15} /> Saved!</>
                ) : (
                  <><Send size={15} /> Log Activity</>
                )}
              </button>
            </div>
          </div>

          {/* Activity History */}
          {history.length > 0 && (
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Activity size={10} /> Activity History ({history.length})
              </div>
              <div className="space-y-2">
                {history.map((h) => {
                  const cfg = OUTCOME_CONFIG[h.outcome] || OUTCOME_CONFIG['no-answer'];
                  const Icon = cfg.icon;
                  const dateObj = new Date(h.call_date);
                  return (
                    <div key={h.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: cfg.color + '20' }}
                      >
                        <Icon size={13} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: cfg.color }}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {h.notes && <p className="text-xs text-slate-600 font-medium leading-relaxed">{h.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function TelecallerDashboard() {
  const [leads, setLeads] = useState([]);
  const [colleges, setColleges] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchVal, setSearchVal] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedLead, setSelectedLead] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteOutcome, setNoteOutcome] = useState('interested');
  const [savingId, setSavingId] = useState(null);
  const [savedFlash, setSavedFlash] = useState(null);
  const [callHistory, setCallHistory] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchVal), 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  useEffect(() => {
    fetchLeads();
    fetchColleges();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/leads/my`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Could not load leads.');
    } finally {
      setLoading(false);
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
      const res = await fetch(`${API}/call-logs/${leadId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCallHistory(prev => ({ ...prev, [leadId]: Array.isArray(data) ? data : [] }));
    } catch (err) {}
  };

  const updateStatus = async (leadId, newStatus) => {
    setSavingId(leadId);
    try {
      const res = await fetch(`${API}/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      setSavedFlash(leadId);
      setTimeout(() => setSavedFlash(null), 2500);
    } catch (err) {
      setError('Could not update status.');
    } finally {
      setSavingId(null);
    }
  };

  const submitCallLog = async (leadId) => {
    if (!noteText.trim()) return;
    setSavingId(leadId + '-note');
    try {
      const res = await fetch(`${API}/call-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lead_id: leadId, outcome: noteOutcome, notes: noteText }),
      });
      if (!res.ok) throw new Error('Failed to save note');
      const newNote = { id: Math.random().toString(), lead_id: leadId, outcome: noteOutcome, notes: noteText, call_date: new Date().toISOString() };
      setCallHistory(prev => ({ ...prev, [leadId]: [newNote, ...(prev[leadId] || [])] }));
      setNoteText('');
      setNoteOutcome('interested');
      setSavedFlash(leadId + '-note');
      setTimeout(() => setSavedFlash(null), 2500);
    } catch (err) {
      setError('Could not save note.');
    } finally {
      setSavingId(null);
    }
  };

  const openLead = (lead) => {
    setSelectedLead(lead);
    setNoteText('');
    setNoteOutcome('interested');
    if (!callHistory[lead.id]) fetchCallHistory(lead.id);
  };

  const closeLead = () => setSelectedLead(null);

  const copyToClipboard = (text, type, leadId) => {
    navigator.clipboard.writeText(text);
    setSavedFlash(`${leadId}-copy-${type}`);
    setTimeout(() => setSavedFlash(null), 2000);
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !debouncedSearch ||
        lead.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lead.phone?.includes(debouncedSearch);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, debouncedSearch, statusFilter]);

  const statusCounts = useMemo(() => {
    return leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  }, [leads]);

  const enrolled = (statusCounts['enrolled-college'] || 0) + (statusCounts['enrolled-institute'] || 0);
  const conversion = leads.length > 0 ? ((enrolled / leads.length) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-semibold">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">

      {/* ── Page wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Leads',    value: leads.length, icon: Users,     color: '#6366F1', bg: '#EEF2FF' },
            { label: 'Interested',     value: statusCounts['interested'] || 0, icon: Flame, color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Enrolled',       value: enrolled,     icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
            { label: 'Conversion',     value: `${conversion}%`, icon: TrendingUp, color: '#3B82F6', bg: '#EFF6FF' },
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

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
            <ShieldAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── Search + Filters ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by name or phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
            />
          </div>

          {/* Status pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              { key: 'all', label: `All (${leads.length})` },
              ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
                key,
                label: `${cfg.label.split(' ')[0]} (${statusCounts[key] || 0})`
              }))
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border"
                style={statusFilter === item.key
                  ? { backgroundColor: '#6366F1', color: 'white', borderColor: '#6366F1' }
                  : { backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Leads Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Lead</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Actions</div>
          </div>

          {/* Rows */}
          {filteredLeads.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No leads match your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredLeads.map(lead => {
                const colors = avatarColor(lead.name);
                const collegeNames = (lead.interested_college_ids || []).map(id => colleges[id]).filter(Boolean);
                const isSelected = selectedLead?.id === lead.id;
                const historyCount = (callHistory[lead.id] || []).length;

                return (
                  <div
                    key={lead.id}
                    className={`grid grid-cols-[2fr_1.5fr_1.5fr_1fr_auto] gap-3 items-center px-4 py-3 cursor-pointer transition-colors group ${isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                    onClick={() => openLead(lead)}
                  >
                    {/* Lead name + initials */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                        style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                      >
                        {initials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{lead.name}</div>
                        {historyCount > 0 && (
                          <div className="text-[10px] text-slate-400 font-medium">{historyCount} call{historyCount > 1 ? 's' : ''} logged</div>
                        )}
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-slate-600 font-medium truncate">{lead.phone}</span>
                      <button
                        onClick={e => { e.stopPropagation(); copyToClipboard(lead.phone, 'phone-row', lead.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-400 transition-all shrink-0"
                      >
                        {savedFlash === `${lead.id}-copy-phone-row` ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* College */}
                    <div className="text-sm text-slate-500 font-medium truncate">
                      {collegeNames.length > 0 ? collegeNames[0] : <span className="text-slate-300">—</span>}
                    </div>

                    {/* Status badge */}
                    <div>
                      <StatusBadge status={lead.status} />
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                        target="_blank" rel="noreferrer"
                        className="w-7 h-7 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        title="WhatsApp"
                      >
                        <MessageSquare size={13} />
                      </a>
                      <a
                        href={`tel:${lead.phone}`}
                        className="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        title="Call"
                      >
                        <PhoneCall size={13} />
                      </a>
                      <button
                        onClick={() => openLead(lead)}
                        className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                        title="Open detail"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filteredLeads.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-semibold">
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          )}
        </div>

      </div>

      {/* ── Lead Detail Drawer ── */}
      {selectedLead && (
        <LeadDrawer
          lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
          colleges={colleges}
          onClose={closeLead}
          onUpdateStatus={updateStatus}
          onSubmitLog={submitCallLog}
          callHistory={callHistory}
          savingId={savingId}
          savedFlash={savedFlash}
          noteText={noteText}
          setNoteText={setNoteText}
          noteOutcome={noteOutcome}
          setNoteOutcome={setNoteOutcome}
          handleTextareaResize={handleTextareaResize}
          copyToClipboard={copyToClipboard}
        />
      )}
    </div>
  );
}
