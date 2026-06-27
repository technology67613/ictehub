import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ShieldAlert, Loader2, Plus, Edit2, Trash2, X,
  AlertCircle, BookOpen, Clock, DollarSign, CheckCircle2
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

// ─── Modal/Drawer Component ──────────────────────────────────────────────────
function CourseFormDrawer({ course, onClose, onSave, saving }) {
  const isEdit = !!course.id;
  const [name, setName] = useState(course.name || '');
  const [duration, setDuration] = useState(course.duration || '2 years');
  const [fees, setFees] = useState(course.fees !== undefined && course.fees !== null ? course.fees.toString() : '');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Course Name is required.');
      return;
    }

    const payload = {
      name: name.trim(),
      duration: duration.trim(),
      fees: fees.trim() === '' ? null : Number(fees)
    };

    if (payload.fees !== null && isNaN(payload.fees)) {
      setError('Fees must be a valid number.');
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
            <h2 className="font-extrabold text-slate-900 text-base">{isEdit ? 'Edit Course' : 'Add Course'}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Platform Degree Programs</p>
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
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Course Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Master of Business Administration (Online)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
              required
            />
          </div>

          {/* Duration */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="e.g. 2 years"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* Fees */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Program Fees (INR)</label>
            <input
              type="text"
              value={fees}
              onChange={e => setFees(e.target.value)}
              placeholder="e.g. 120000"
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {isEdit ? 'Save Changes' : 'Create Course'}
          </button>
        </form>
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminInstituteCourses({ token }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');

  // Drawer form states
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/institute-courses`);
      if (!response.ok) throw new Error('Failed to fetch institute courses');
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (payload) => {
    setSaving(true);
    try {
      const isEdit = !!selectedCourse?.id;
      const url = isEdit ? `${API}/institute-courses/${selectedCourse.id}` : `${API}/institute-courses`;
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

      const courseData = await response.json();

      if (isEdit) {
        setCourses(prev => prev.map(c => c.id === selectedCourse.id ? courseData : c));
        setSavedFlash(`${selectedCourse.id}-edit`);
      } else {
        setCourses(prev => [courseData, ...prev]);
        setSavedFlash('new-course');
      }

      setIsOpen(false);
      setSelectedCourse(null);
      setTimeout(() => setSavedFlash(null), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/institute-courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete course');
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const openAddDrawer = () => {
    setSelectedCourse({
      name: '',
      duration: '2 years',
      fees: ''
    });
    setIsOpen(true);
  };

  const openEditDrawer = (course) => {
    setSelectedCourse(course);
    setIsOpen(true);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(c =>
      !searchVal || c.name?.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [courses, searchVal]);

  const stats = useMemo(() => {
    const total = courses.length;
    const coursesWithFees = courses.filter(c => c.fees !== null && c.fees !== undefined);
    const avgFees = coursesWithFees.length > 0
      ? Math.round(coursesWithFees.reduce((sum, c) => sum + Number(c.fees), 0) / coursesWithFees.length)
      : 0;

    return { total, avgFees };
  }, [courses]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading platform catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* ── Header with Add Button ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Institute Courses</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage degree programs offered directly by the platform</p>
          </div>
          <button
            onClick={openAddDrawer}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 transition-all outline-none"
          >
            <Plus size={14} /> Add Course
          </button>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Programs', value: stats.total, icon: BookOpen, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Average Program Fees', value: `₹${stats.avgFees.toLocaleString('en-IN')}`, icon: DollarSign, color: '#10B981', bg: '#ECFDF5' },
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

        {/* ── Alerts ── */}
        {savedFlash === 'new-course' && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs font-bold animate-in fade-in">
            New program successfully added to the catalog.
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
              placeholder="Search by course name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Table List ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1.2fr_1.2fr_auto] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Program Name</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={11} /> Duration</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><DollarSign size={11} /> Fees (INR)</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Actions</div>
          </div>

          {/* Rows */}
          {filteredCourses.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No courses matching search query</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  className="grid grid-cols-[2fr_1.2fr_1.2fr_auto] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name */}
                  <div className="font-semibold text-slate-900 text-sm truncate">
                    {course.name}
                  </div>

                  {/* Duration */}
                  <div className="text-sm font-semibold text-slate-600">
                    {course.duration}
                  </div>

                  {/* Fees */}
                  <div className="text-sm font-bold text-slate-800">
                    {course.fees !== null && course.fees !== undefined ? `₹${course.fees.toLocaleString('en-IN')}` : <span className="text-slate-300">—</span>}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <button
                      onClick={() => openEditDrawer(course)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200"
                      title="Edit Course"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors border border-slate-200"
                      title="Delete Course"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer count */}
          {filteredCourses.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredCourses.length} of {courses.length} programs
            </div>
          )}
        </div>

      </div>

      {/* ── Slide-in Drawer Form ── */}
      {isOpen && (
        <CourseFormDrawer
          course={selectedCourse}
          onClose={() => { setIsOpen(false); setSelectedCourse(null); }}
          onSave={handleCreateOrUpdate}
          saving={saving}
        />
      )}
    </div>
  );
}
