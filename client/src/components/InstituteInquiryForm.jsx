import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, BookOpen, User, Phone, Mail, Loader2, MessageSquare } from 'lucide-react';
import { linkLeadToSession } from '../utils/tracking';

const InstituteInquiryForm = ({ isOpen, onClose, preselectedCourseId, setView }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interested_course_id: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('https://ictehub.onrender.com/institute-courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Error fetching institute courses:', err);
      }
    };
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCourseId) {
      setFormData((prev) => ({ ...prev, interested_course_id: preselectedCourseId }));
    } else {
      setFormData((prev) => ({ ...prev, interested_course_id: '' }));
    }
  }, [preselectedCourseId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Name and Phone Number are required.');
      setLoading(false);
      return;
    }

    if (!formData.interested_course_id) {
      setError('Please select a course.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ictehub.onrender.com/institute-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          interested_course_id: formData.interested_course_id,
          message: formData.message || null,
          session_id: localStorage.getItem('visitor_session_id') || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit inquiry.');
      
      if (data && data.id) {
        linkLeadToSession(data.id);
      }

      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', interested_course_id: '', message: '' });
    } catch (err) {
      setError(err.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 font-sans text-slate-700">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      <div className="bg-white backdrop-blur-2xl border-none sm:border sm:border-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.15)] relative flex flex-col sm:max-w-lg animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
              <BookOpen size={20} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Enroll in Our Programs</h2>
              <p className="text-xs font-semibold text-slate-500">Direct Institute Enrollment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors border border-slate-200 outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto flex-grow custom-scrollbar">
          {success ? (
            <div className="flex flex-col items-center text-center py-8 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Application Received!</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mb-5">
                Thank you for applying to our degree program. An admissions coordinator will contact you shortly to guide you through the next steps.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-900 text-white text-sm font-bold uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm font-semibold rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <User size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Phone field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Phone size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Email Address <span className="text-slate-400 text-[9px] font-bold normal-case">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Mail size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Course Selection (Dropdown) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Course of Interest <span className="text-red-500">*</span>
                </label>
                <select
                  name="interested_course_id"
                  value={formData.interested_course_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-semibold text-sm shadow-sm"
                  required
                >
                  <option value="">Select a Program</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.duration || '2 years'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Message field (optional textarea) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Message / Remarks <span className="text-slate-400 text-[9px] font-bold normal-case">(Optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-4 flex items-center justify-center">
                    <MessageSquare size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <textarea
                    name="message"
                    placeholder="Enter any questions or messages..."
                    rows="3"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-slate-50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-50 hover:to-purple-50 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 overflow-hidden group outline-none disabled:opacity-70 disabled:transform-none disabled:shadow-none"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {loading ? (
                  <><Loader2 size={16} className="animate-spin shrink-0" /> Submitting...</>
                ) : (
                  <><Send size={16} className="shrink-0" /> Submit Application</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstituteInquiryForm;
