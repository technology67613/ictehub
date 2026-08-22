import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, Search, Phone, Mail, GraduationCap, CheckCircle2, XCircle,
  PhoneCall, MessageSquare, ChevronRight, Clock, ShieldAlert, Loader2,
  Filter, AlertCircle, TrendingUp, Copy, X, Users, UserCheck, Activity,
  Award, ExternalLink, Trash2, Download, Calendar, ArrowUpRight, Eye,
  Building, RefreshCw, User, MapPin, BookOpen, Shield, Check
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
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: `${cfg.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }}></span>
      {cfg.label}
    </span>
  );
}

// ─── Drawer Component ────────────────────────────────────────────────────────
function AdmissionDetailDrawer({ lead, telecallers, onClose, onStatusChange, onAssign, token }) {
  const [formData] = useState(() => {
    try {
      return typeof lead.admission_form_data === 'string'
        ? JSON.parse(lead.admission_form_data)
        : lead.admission_form_data || {};
    } catch (e) {
      return {};
    }
  });

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [callLogs, setCallLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [colors] = useState(avatarColor(lead.name));
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const refId = (lead.id || '').substring(0, 8).toUpperCase();
  const appliedDate = lead.created_at
    ? new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  // Fetch documents for this lead
  useEffect(() => {
    if (lead?.id && token) {
      setLoadingDocs(true);
      fetch(`${API}/admission-documents/${lead.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setDocuments(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error loading documents:', err))
        .finally(() => setLoadingDocs(false));

      setLoadingLogs(true);
      fetch(`${API}/call-logs/${lead.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setCallLogs(Array.isArray(data) ? data : []))
        .catch(err => console.error('Error loading call logs:', err))
        .finally(() => setLoadingLogs(false));
    }
  }, [lead?.id, token]);

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`${API}/admission-documents/${docId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleStatusSelect = async (e) => {
    const newStatus = e.target.value;
    setUpdatingStatus(true);
    try {
      await onStatusChange(lead.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleTelecallerSelect = async (e) => {
    const telecallerId = e.target.value || null;
    setAssigning(true);
    try {
      await onAssign(lead.id, telecallerId);
    } finally {
      setAssigning(false);
    }
  };

  const formatAadhaar = (num) => {
    if (!num) return 'N/A';
    const digits = num.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `•••• •••• ${digits.slice(-4)}`;
    }
    return num;
  };

  const perm = formData.permanent_address || {};
  const corr = formData.correspondence_address || {};
  const permAddressStr = [perm.address_line_1, perm.address_line_2, perm.city, perm.district, perm.state, perm.pincode ? `- ${perm.pincode}` : '']
    .filter(Boolean).join(', ');
  const corrAddressStr = [corr.address_line_1, corr.address_line_2, corr.city, corr.district, corr.state, corr.pincode ? `- ${corr.pincode}` : '']
    .filter(Boolean).join(', ');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-md shrink-0"
              style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
            >
              {initials(lead.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-slate-900 text-lg leading-tight">{lead.name}</h2>
                <StatusBadge status={lead.status} />
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Ref ID: <span className="font-mono text-slate-700 font-bold">{refId}</span> • Applied: {appliedDate}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200/60 text-slate-500 transition-colors border-none bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* Section 1: Header Actions & Management */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Application Pipeline Status</label>
              <div className="flex items-center gap-2">
                <select
                  value={lead.status}
                  onChange={handleStatusSelect}
                  disabled={updatingStatus}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1E40FF]"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not-interested">Not Interested</option>
                  <option value="enrolled-college">Enrolled (College)</option>
                  <option value="enrolled-institute">Enrolled (Institute)</option>
                </select>
                {updatingStatus && <Loader2 size={16} className="animate-spin text-[#1E40FF] shrink-0" />}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Assigned Telecaller</label>
              <div className="flex items-center gap-2">
                <select
                  value={lead.assigned_telecaller_id || ''}
                  onChange={handleTelecallerSelect}
                  disabled={assigning}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-800 focus:ring-2 focus:ring-[#1E40FF]"
                >
                  <option value="">-- Unassigned --</option>
                  {telecallers.map(t => (
                    <option key={t.id} value={t.id}>{t.name || t.email}</option>
                  ))}
                </select>
                {assigning && <Loader2 size={16} className="animate-spin text-[#1E40FF] shrink-0" />}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <User size={14} className="text-[#1E40FF]" /> Section 2 — Personal Details
            </h3>

            <div className="flex flex-col sm:flex-row items-start gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
              {formData.photo_url ? (
                <img
                  src={formData.photo_url}
                  alt="Applicant"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300 shrink-0">
                  <User size={32} />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1 text-xs">
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Full Name</span><span className="font-bold text-slate-800">{formData.full_name || lead.name}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Father's Name</span><span className="font-bold text-slate-800">{formData.father_name || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Mother's Name</span><span className="font-bold text-slate-800">{formData.mother_name || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Date of Birth</span><span className="font-bold text-slate-800">{formData.dob || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Gender</span><span className="font-bold text-slate-800">{formData.gender || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Blood Group</span><span className="font-bold text-slate-800">{formData.blood_group || 'N/A'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Nationality</span><span className="font-bold text-slate-800">{formData.nationality || 'Indian'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Category</span><span className="font-bold text-slate-800">{formData.category || 'General'}</span></div>
                <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Aadhaar (Masked)</span><span className="font-mono font-bold text-slate-800">{formatAadhaar(formData.aadhaar_number)}</span></div>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <MapPin size={14} className="text-[#1E40FF]" /> Section 3 — Contact & Address
            </h3>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Primary Mobile</span>
                  <a href={`tel:${formData.primary_mobile || lead.phone}`} className="font-bold text-[#1E40FF] hover:underline">
                    +91 {formData.primary_mobile || lead.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Alternate Mobile</span>
                  <span className="font-bold text-slate-800">{formData.alternate_mobile ? `+91 ${formData.alternate_mobile}` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email Address</span>
                  <span className="font-bold text-slate-800">{formData.email || lead.email || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-0.5">Permanent Address</span>
                <span className="font-bold text-slate-800 leading-relaxed">{permAddressStr || 'N/A'}</span>
              </div>

              {!formData.same_as_permanent && corrAddressStr && (
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-0.5">Correspondence Address</span>
                  <span className="font-bold text-slate-800 leading-relaxed">{corrAddressStr}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Academic Qualifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <BookOpen size={14} className="text-[#1E40FF]" /> Section 4 — Academic Qualifications
            </h3>

            {(!formData.qualifications || formData.qualifications.length === 0) ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">No qualification records provided</p>
            ) : (
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-extrabold text-slate-400 uppercase">
                      <th className="py-2.5 px-3">Examination</th>
                      <th className="py-2.5 px-3">School / Institution</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Stream</th>
                      <th className="py-2.5 px-3">% / CGPA</th>
                      <th className="py-2.5 px-3">Division</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {formData.qualifications.map((q, i) => (
                      <tr key={q.id || i} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{q.level}</td>
                        <td className="py-2.5 px-3">{q.institution} ({q.board})</td>
                        <td className="py-2.5 px-3">{q.year}</td>
                        <td className="py-2.5 px-3">{q.stream || 'N/A'}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1E40FF]">{q.percentage}%</td>
                        <td className="py-2.5 px-3">{q.division}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 5: Course & Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <GraduationCap size={14} className="text-[#1E40FF]" /> Section 5 — Course & Preferences
            </h3>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Program Type</span><span className="font-bold text-slate-800">{formData.program_type || 'N/A'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Selected Course</span><span className="font-bold text-[#1E40FF]">{formData.course || 'N/A'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Specialization</span><span className="font-bold text-slate-800">{formData.specialization || 'N/A'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Preferred Mode</span><span className="font-bold text-slate-800">{formData.preferred_college_type || 'Both'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Academic Session</span><span className="font-bold text-slate-800">{formData.academic_session || '2025-26'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Hostel Required</span><span className="font-bold text-slate-800">{formData.hostel_required || 'No'} {formData.hostel_location ? `(${formData.hostel_location})` : ''}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Scholarship Required</span><span className="font-bold text-slate-800">{formData.scholarship_required || 'No'}</span></div>
              <div className="col-span-2"><span className="text-slate-400 font-semibold block text-[10px] uppercase">Source / Reference</span><span className="font-bold text-slate-800">{formData.source || formData.hear_about_us || lead.source || 'Direct'}</span></div>
            </div>
          </div>

          {/* Section 6: Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText size={14} className="text-[#1E40FF]" /> Section 6 — Documents ({documents.length})
              </h3>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-[#1E40FF] uppercase">
                {documents.length > 0 ? 'Uploaded' : 'No Docs'}
              </span>
            </div>

            {loadingDocs ? (
              <div className="p-4 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#1E40FF]" /> Loading uploaded documents...
              </div>
            ) : documents.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-medium">
                No documents uploaded for this application
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => {
                  const typeLabel = doc.document_type
                    ? doc.document_type.replace(/_/g, ' ').toUpperCase()
                    : 'DOCUMENT';
                  const isPdf = doc.document_name?.toLowerCase().endsWith('.pdf') || doc.file_url.includes('.pdf');
                  const uploadDate = doc.uploaded_at
                    ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '';

                  return (
                    <div key={doc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        {isPdf ? (
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                            PDF
                          </div>
                        ) : (
                          <img
                            src={doc.file_url}
                            alt="Doc"
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-[#1E40FF] inline-block mb-0.5">
                            {typeLabel}
                          </span>
                          <div className="font-bold text-slate-800 truncate" title={doc.document_name}>
                            {doc.document_name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(2)} MB • ` : ''}{uploadDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-white hover:bg-blue-50 text-[#1E40FF] border border-slate-200 rounded-lg font-bold text-[11px] no-underline inline-flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> View
                        </a>
                        <a
                          href={doc.file_url}
                          download={doc.document_name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] no-underline inline-flex items-center gap-1"
                        >
                          <Download size={12} /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1 bg-white hover:bg-red-50 text-red-500 border border-slate-200 rounded-lg cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 7: Guardian & Emergency Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield size={14} className="text-[#1E40FF]" /> Section 7 — Guardian & Emergency Contact
            </h3>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Guardian Name</span><span className="font-bold text-slate-800">{formData.guardian_name || 'N/A'}</span></div>
              <div><span className="text-slate-400 font-semibold block text-[10px] uppercase">Relationship</span><span className="font-bold text-slate-800">{formData.guardian_relationship || 'Father'}</span></div>
              <div>
                <span className="text-slate-400 font-semibold block text-[10px] uppercase">Guardian Mobile</span>
                <span className="font-bold text-slate-800">{formData.guardian_mobile ? `+91 ${formData.guardian_mobile}` : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 8: Call History */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Activity size={14} className="text-[#1E40FF]" /> Section 8 — Call Logs & History ({callLogs.length})
            </h3>

            {loadingLogs ? (
              <div className="p-4 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-[#1E40FF]" /> Loading call history...
              </div>
            ) : callLogs.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-medium">
                No calls logged yet for this applicant
              </div>
            ) : (
              <div className="space-y-2">
                {callLogs.map((log) => {
                  const logDate = new Date(log.call_date);
                  return (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-[#1E40FF]">
                          {log.outcome ? log.outcome.replace('-', ' ') : 'Call'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {logDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {logDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {log.notes && <p className="text-slate-700 font-medium">{log.notes}</p>}
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

// ─── Main AdminAdmissions View ──────────────────────────────────────────────
export default function AdminAdmissions({ token }) {
  const [leads, setLeads] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Drawer
  const [selectedLead, setSelectedLead] = useState(null);

  // Document counts state per lead: { [leadId]: number }
  const [docCounts, setDocCounts] = useState({});

  useEffect(() => {
    fetchLeads();
    fetchTelecallers();
  }, [token]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        // Filter only leads that submitted the admission form
        const admissionLeads = data.filter(l => Boolean(l.admission_form_data));
        setLeads(admissionLeads);

        // Fetch doc count for each lead asynchronously
        admissionLeads.forEach(async (l) => {
          try {
            const docRes = await fetch(`${API}/admission-documents/${l.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const docs = await docRes.json();
            if (Array.isArray(docs)) {
              setDocCounts(prev => ({ ...prev, [l.id]: docs.length }));
            }
          } catch (e) {}
        });
      }
    } catch (err) {
      console.error('Error fetching admission applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelecallers = async () => {
    try {
      const res = await fetch(`${API}/users?role=telecaller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTelecallers(data);
      }
    } catch (err) {
      console.error('Error fetching telecallers:', err);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch(`${API}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAssignTelecaller = async (leadId, telecallerId) => {
    try {
      const res = await fetch(`${API}/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_telecaller_id: telecallerId })
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assigned_telecaller_id: telecallerId } : l));
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, assigned_telecaller_id: telecallerId } : null);
        }
      }
    } catch (err) {
      console.error('Error assigning telecaller:', err);
    }
  };

  // Parsed applications with formData object
  const applications = useMemo(() => {
    return leads.map(l => {
      let parsedForm = {};
      try {
        parsedForm = typeof l.admission_form_data === 'string'
          ? JSON.parse(l.admission_form_data)
          : l.admission_form_data || {};
      } catch (e) {}

      return {
        ...l,
        formData: parsedForm,
        courseName: parsedForm.course || 'N/A',
        programType: parsedForm.program_type || 'N/A',
        refId: (l.id || '').substring(0, 8).toUpperCase()
      };
    });
  }, [leads]);

  // Extract unique course names for course filter
  const uniqueCourses = useMemo(() => {
    const courses = new Set();
    applications.forEach(a => {
      if (a.courseName && a.courseName !== 'N/A') courses.add(a.courseName);
    });
    return Array.from(courses);
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // Search
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const nameMatch = (app.name || '').toLowerCase().includes(query);
        const phoneMatch = (app.phone || '').includes(query);
        const refMatch = app.refId.toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !refMatch) return false;
      }

      // Status
      if (statusFilter !== 'All') {
        if (statusFilter === 'new' && app.status !== 'new') return false;
        if (statusFilter === 'in-progress' && !['contacted', 'interested'].includes(app.status)) return false;
        if (statusFilter === 'enrolled' && !['enrolled-college', 'enrolled-institute'].includes(app.status)) return false;
        if (statusFilter === 'not-interested' && app.status !== 'not-interested') return false;
      }

      // Course
      if (courseFilter !== 'All' && app.courseName !== courseFilter) {
        return false;
      }

      // Date Range
      if (fromDate) {
        const appDate = new Date(app.created_at);
        const fDate = new Date(fromDate);
        if (appDate < fDate) return false;
      }
      if (toDate) {
        const appDate = new Date(app.created_at);
        const tDate = new Date(toDate);
        tDate.setHours(23, 59, 59, 999);
        if (appDate > tDate) return false;
      }

      return true;
    });
  }, [applications, searchQuery, statusFilter, courseFilter, fromDate, toDate]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredApplications.length === 0) {
      alert('No application data available to export.');
      return;
    }

    const headers = ['Ref ID', 'Applicant Name', 'Mobile', 'Email', 'Course', 'Program Type', 'Academic Session', 'Category', 'Applied Date', 'Status'];
    const rows = filteredApplications.map(app => [
      `"${app.refId}"`,
      `"${app.name || ''}"`,
      `"${app.phone || ''}"`,
      `"${app.email || ''}"`,
      `"${app.courseName || ''}"`,
      `"${app.programType || ''}"`,
      `"${app.formData.academic_session || ''}"`,
      `"${app.formData.category || ''}"`,
      `"${app.created_at ? new Date(app.created_at).toLocaleDateString('en-IN') : ''}"`,
      `"${app.status || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Admission_Applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const totalCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'new').length;
  const inProgressCount = applications.filter(a => ['contacted', 'interested'].includes(a.status)).length;
  const enrolledCount = applications.filter(a => ['enrolled-college', 'enrolled-institute'].includes(a.status)).length;

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1E40FF] text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <FileText size={14} /> Admissions Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admission Applications Portal
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            Review full admission form submissions, credentials, and uploaded student documents.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer border-none"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Stats Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Total Applications</span>
            <span className="text-3xl font-black text-slate-900">{totalCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#1E40FF] flex items-center justify-center font-bold">
            <FileText size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Pending Review</span>
            <span className="text-3xl font-black text-amber-600">{pendingCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">In Progress</span>
            <span className="text-3xl font-black text-blue-600">{inProgressCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Enrolled</span>
            <span className="text-3xl font-black text-emerald-600">{enrolledCount}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by applicant name, mobile or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-[#1E40FF]"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#1E40FF]"
            >
              <option value="All">All Statuses</option>
              <option value="new">Pending (New)</option>
              <option value="in-progress">In Progress</option>
              <option value="enrolled">Enrolled</option>
              <option value="not-interested">Not Interested</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#1E40FF]"
            >
              <option value="All">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              title="From Date"
            />
            <span className="text-slate-400 font-bold text-xs">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              title="To Date"
            />
          </div>

        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-[#1E40FF]" /> Application Submissions ({filteredApplications.length})
          </h2>
          {(searchQuery || statusFilter !== 'All' || courseFilter !== 'All' || fromDate || toDate) && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCourseFilter('All'); setFromDate(''); setToDate(''); }}
              className="text-xs font-bold text-[#1E40FF] hover:underline cursor-pointer border-none bg-transparent"
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-semibold flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin text-[#1E40FF]" /> Loading admission applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <AlertCircle size={32} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No admission applications found.</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Applicant</th>
                  <th className="py-4 px-4">Course Applied</th>
                  <th className="py-4 px-4">Program Type</th>
                  <th className="py-4 px-4">Mobile</th>
                  <th className="py-4 px-4">Applied Date</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Documents</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredApplications.map((app) => {
                  const colors = avatarColor(app.name);
                  const dCount = docCounts[app.id] || 0;
                  const dateStr = app.created_at
                    ? new Date(app.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : 'N/A';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Applicant */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-xs"
                            style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
                          >
                            {initials(app.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 truncate">{app.name}</div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ref: #{app.refId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-800">{app.courseName}</span>
                      </td>

                      {/* Program Type */}
                      <td className="py-4 px-4 text-slate-600 font-bold">
                        {app.programType}
                      </td>

                      {/* Mobile */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <a href={`tel:${app.phone}`} className="text-[#1E40FF] hover:underline font-bold">
                          +91 {app.phone}
                        </a>
                      </td>

                      {/* Applied Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-semibold">
                        {dateStr}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={app.status} />
                      </td>

                      {/* Documents Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          dCount > 0 ? 'bg-blue-100 text-[#1E40FF]' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <FileText size={12} /> {dCount} Docs
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLead(app)}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#1E40FF] border border-slate-200 font-bold text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Slide-in Detail Drawer */}
      {selectedLead && (
        <AdmissionDetailDrawer
          lead={selectedLead}
          telecallers={telecallers}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
          onAssign={handleAssignTelecaller}
          token={token}
        />
      )}

    </div>
  );
}
