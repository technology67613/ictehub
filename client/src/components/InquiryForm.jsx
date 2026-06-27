import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, BookOpen, User, Phone, Mail, Loader2, Sparkles } from 'lucide-react';

const InquiryForm = ({ isOpen, onClose, preselectedCollegeId }) => {
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interested_college_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://ictehub.onrender.com/colleges');
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
        }
      } catch (err) {}
    };
    if (isOpen) {
      fetchColleges();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCollegeId) {
      setFormData((prev) => ({ ...prev, interested_college_ids: [preselectedCollegeId] }));
    } else {
      setFormData((prev) => ({ ...prev, interested_college_ids: [] }));
    }
  }, [preselectedCollegeId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCheckboxChange = (collegeId) => {
    setFormData((prev) => {
      const selected = prev.interested_college_ids.includes(collegeId)
        ? prev.interested_college_ids.filter((id) => id !== collegeId)
        : [...prev.interested_college_ids, collegeId];
      return { ...prev, interested_college_ids: selected };
    });
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

    try {
      const response = await fetch('https://ictehub.onrender.com/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit inquiry.');
      setSuccess(true);
      setFormData({ name: '', phone: '', email: '', interested_college_ids: [] });
    } catch (err) {
      setError(err.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans text-slate-700">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>

      <div className="bg-white/90 backdrop-blur-2xl border border-white rounded-[2rem] w-full max-w-lg shadow-[0_20px_60px_rgb(0,0,0,0.15)] relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
              <Sparkles size={20} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Request Info</h2>
              <p className="text-xs font-semibold text-slate-500">100% Free Consultation</p>
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
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Inquiry Submitted!</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mb-8">
                Thank you for showing interest. One of our expert academic counselors will reach out to you shortly.
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
                    placeholder="+1 (555) 000-0000"
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

              {/* Colleges Selection */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Colleges of Interest
                </label>
                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50 max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-3 shadow-inner">
                  {colleges.length === 0 ? (
                    <span className="text-xs font-semibold text-slate-400 text-center py-4">Loading colleges...</span>
                  ) : (
                    colleges.map((college) => (
                      <label key={college.id} className="group flex items-center gap-3 text-sm font-semibold text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-indigo-500 border-slate-300 focus:ring-indigo-500/20 shadow-sm"
                          checked={formData.interested_college_ids.includes(college.id)}
                          onChange={() => handleCheckboxChange(college.id)}
                        />
                        <span className="truncate flex-1">{college.name}</span>
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded shrink-0">
                          {college.mode}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="relative w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 overflow-hidden group outline-none disabled:opacity-70 disabled:transform-none disabled:shadow-none"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                {loading ? (
                  <><Loader2 size={16} className="animate-spin shrink-0" /> Submitting...</>
                ) : (
                  <><Send size={16} className="shrink-0" /> Send Request</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
