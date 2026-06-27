import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ShieldAlert, Loader2, Plus, Edit2, Trash2, X,
  AlertCircle, GraduationCap, MonitorPlay, MapPin, CheckCircle2,
  DollarSign, Mail, Phone, User
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

// ─── Drawer Component ────────────────────────────────────────────────────────
function CollegeFormDrawer({ college, onClose, onSave, saving }) {
  const isEdit = !!college.id;
  const [name, setName] = useState(college.name || '');
  const [mode, setMode] = useState(college.mode || 'Online');
  const [location, setLocation] = useState(college.location || '');
  const [commissionPercent, setCommissionPercent] = useState(
    college.commission_percent !== undefined ? college.commission_percent.toString() : '0'
  );
  const [commissionStructure, setCommissionStructure] = useState(college.commission_structure || 'one-time');
  
  // Courses tag list builder
  const [courses, setCourses] = useState(college.courses_offered || []);
  const [courseInput, setCourseInput] = useState('');

  // Contact details
  const [contactName, setContactName] = useState(college.contact_name || '');
  const [contactPhone, setContactPhone] = useState(college.contact_phone || '');
  const [contactEmail, setContactEmail] = useState(college.contact_email || '');

  const [error, setError] = useState('');

  const handleAddCourse = (e) => {
    e.preventDefault();
    const trimmed = courseInput.trim();
    if (!trimmed) return;
    if (courses.includes(trimmed)) {
      setCourseInput('');
      return;
    }
    setCourses([...courses, trimmed]);
    setCourseInput('');
  };

  const handleRemoveCourse = (courseToRemove) => {
    setCourses(courses.filter(c => c !== courseToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('College Name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      mode,
      location: mode === 'Offline' ? location.trim() : null,
      courses_offered: courses,
      commission_percent: Number(commissionPercent) || 0,
      commission_structure: commissionStructure,
      contact_name: contactName.trim() || null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null
    };

    if (mode === 'Offline' && !payload.location) {
      setError('Location is required for offline colleges.');
      return;
    }

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
            <h2 className="font-extrabold text-slate-900 text-base">{isEdit ? 'Edit College' : 'Add New College'}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Partner Institutions</p>
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
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Manipal University Online"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              required
            />
          </div>

          {/* Mode */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Campus Type *</label>
            <div className="flex gap-3">
              {['Online', 'Offline'].map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    mode === item
                      ? 'bg-[#EEF2FF] text-[#1E40FF] border-[#1E40FF]/40 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Location (Offline only) */}
          {mode === 'Offline' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Campus Location *</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Courses tag list builder */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Courses Offered</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={courseInput}
                onChange={e => setCourseInput(e.target.value)}
                placeholder="e.g. BCA, MBA, BTech"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all"
                onKeyDown={e => e.key === 'Enter' && handleAddCourse(e)}
              />
              <button
                type="button"
                onClick={handleAddCourse}
                className="px-3 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 transition-colors"
              >
                Add
              </button>
            </div>
            {courses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {courses.map(c => (
                  <span key={c} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-600">
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(c)}
                      className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Commission Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Commission %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={e => setCommissionPercent(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Structure</label>
              <select
                value={commissionStructure}
                onChange={e => setCommissionStructure(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              >
                <option value="one-time">One-Time</option>
                <option value="installments">Installments</option>
              </select>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Primary Contact</div>
            <div className="space-y-2">
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Contact Person Name"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                />
              </div>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {isEdit ? 'Save Changes' : 'Add College'}
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main AdminColleges Component ──────────────────────────────────────────
export default function AdminColleges({ token }) {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');
  
  // Drawer states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    fetchColleges();
  }, [token]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/colleges`);
      if (!response.ok) throw new Error('Failed to fetch colleges');
      const data = await response.json();
      setColleges(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (payload) => {
    setSaving(true);
    try {
      const isEdit = !!selectedCollege?.id;
      const url = isEdit ? `${API}/colleges/${selectedCollege.id}` : `${API}/colleges`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      const collegeData = await response.json();

      if (isEdit) {
        setColleges(prev => prev.map(c => c.id === selectedCollege.id ? collegeData : c));
        setSavedFlash(`${selectedCollege.id}-edit`);
      } else {
        setColleges(prev => [collegeData, ...prev]);
        setSavedFlash('new-college');
      }
      
      setIsOpen(false);
      setSelectedCollege(null);
      setTimeout(() => setSavedFlash(null), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this college? All associated leads will remain but links may be broken.')) {
      return;
    }

    try {
      const response = await fetch(`${API}/colleges/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete college');
      setColleges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddDrawer = () => {
    setSelectedCollege({
      name: '',
      mode: 'Online',
      location: '',
      courses_offered: [],
      commission_percent: 0,
      commission_structure: 'one-time',
      contact_name: '',
      contact_phone: '',
      contact_email: ''
    });
    setIsOpen(true);
  };

  const openEditDrawer = (college) => {
    setSelectedCollege(college);
    setIsOpen(true);
  };

  const filteredColleges = useMemo(() => {
    return colleges.filter(c => {
      const match = !searchVal ||
        c.name?.toLowerCase().includes(searchVal.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchVal.toLowerCase()) ||
        (c.courses_offered || []).some(course => course.toLowerCase().includes(searchVal.toLowerCase()));
      return match;
    });
  }, [colleges, searchVal]);

  const stats = useMemo(() => {
    return colleges.reduce((acc, c) => {
      acc.total += 1;
      if (c.mode === 'Online') {
        acc.online += 1;
      } else {
        acc.offline += 1;
      }
      return acc;
    }, { total: 0, online: 0, offline: 0 });
  }, [colleges]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading partner colleges directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* ── Header Area with Add Button ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Partner Colleges</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage directory lists and commission configuration</p>
          </div>
          <button
            onClick={openAddDrawer}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 transition-all outline-none"
          >
            <Plus size={14} /> Add College
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Colleges', value: stats.total, icon: GraduationCap, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Online Mode',    value: stats.online, icon: MonitorPlay,   color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Offline Mode',   value: stats.offline, icon: MapPin,        color: '#F59E0B', bg: '#FFFBEB' },
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

        {/* ── Saved Flash / Success Alerts ── */}
        {savedFlash === 'new-college' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            New partner college successfully added to the directory.
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
            <ShieldAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* ── Search Bar ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by name, location, or courses offered..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Colleges Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[1.5fr_0.8fr_1.2fr_1.5fr_1fr_auto] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">College</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Campus Mode</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Location</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Courses</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Commission %</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredColleges.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No colleges match your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredColleges.map(c => {
                const coursesStr = (c.courses_offered || []).join(', ');
                return (
                  <div
                    key={c.id}
                    className="grid grid-cols-[1.5fr_0.8fr_1.2fr_1.5fr_1fr_auto] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Name */}
                    <div className="font-semibold text-slate-900 text-sm truncate">
                      {c.name}
                    </div>

                    {/* Mode Badge */}
                    <div>
                      {c.mode === 'Online' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-extrabold uppercase tracking-wide">
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wide">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className="text-sm font-semibold text-slate-500 truncate">
                      {c.location || <span className="text-slate-300">—</span>}
                    </div>

                    {/* Courses list */}
                    <div className="text-xs font-semibold text-slate-600 truncate max-w-xs" title={coursesStr}>
                      {coursesStr || <span className="text-slate-300">—</span>}
                    </div>

                    {/* Commission % */}
                    <div className="text-sm font-bold text-slate-800">
                      {c.commission_percent !== undefined && c.commission_percent !== null ? `${c.commission_percent}%` : '0%'}
                      {c.commission_structure && (
                        <span className="block text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                          {c.commission_structure}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-1.5 shrink-0">
                      <button
                        onClick={() => openEditDrawer(c)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200"
                        title="Edit College Details"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors border border-slate-200"
                        title="Delete College"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filteredColleges.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredColleges.length} of {colleges.length} colleges
            </div>
          )}
        </div>

      </div>

      {/* ── College Form Slide-in Drawer ── */}
      {isOpen && (
        <CollegeFormDrawer
          college={selectedCollege}
          onClose={() => { setIsOpen(false); setSelectedCollege(null); }}
          onSave={handleCreateOrUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}
