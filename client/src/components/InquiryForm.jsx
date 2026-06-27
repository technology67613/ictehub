import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';

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
      } catch (err) {
        console.error('Error fetching colleges for form:', err);
      }
    };
    if (isOpen) {
      fetchColleges();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedCollegeId) {
      setFormData((prev) => ({
        ...prev,
        interested_college_ids: [preselectedCollegeId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        interested_college_ids: [],
      }));
    }
  }, [preselectedCollegeId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleCheckboxChange = (collegeId) => {
    setFormData((prev) => {
      const selected = prev.interested_college_ids.includes(collegeId)
        ? prev.interested_college_ids.filter((id) => id !== collegeId)
        : [...prev.interested_college_ids, collegeId];
      return {
        ...prev,
        interested_college_ids: selected,
      };
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      setSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        interested_college_ids: [],
      });
    } catch (err) {
      setError(err.message || 'Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans text-slate-700">
      <div className="bg-white border border-academic-border rounded-2xl w-full max-w-lg shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-academic-gold" />
            <h2 className="text-xl font-extrabold text-academic-navy">Request Consultation</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow">
          {success ? (
            <div className="flex flex-col items-center text-center py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-lg font-bold text-academic-navy mb-2">Inquiry Submitted!</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Thank you for showing interest. One of our telecallers will get in touch with you shortly.
              </p>
              <button
                onClick={onClose}
                className="bg-academic-navy text-white text-xs font-bold px-6 py-3 rounded-xl border-none cursor-pointer hover:bg-opacity-95 transition-all"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3.5 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="inquiry-name">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="inquiry-name"
                  name="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-slate-50"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="inquiry-phone">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="inquiry-phone"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-slate-50"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="inquiry-email">
                  Email Address <span className="text-slate-400 text-[9px]">(Optional)</span>
                </label>
                <input
                  type="email"
                  id="inquiry-email"
                  name="email"
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 text-sm bg-slate-50"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Colleges Selection */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Colleges of Interest
                </label>
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-40 overflow-y-auto flex flex-col gap-2">
                  {colleges.length === 0 ? (
                    <span className="text-xs text-slate-400">Loading colleges...</span>
                  ) : (
                    colleges.map((college) => (
                      <label key={college.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-slate-950 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded text-academic-gold border-slate-300 focus:ring-academic-gold/20"
                          checked={formData.interested_college_ids.includes(college.id)}
                          onChange={() => handleCheckboxChange(college.id)}
                        />
                        <span className="font-semibold">{college.name}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">({college.mode})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 rounded-xl bg-academic-navy text-white font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 focus:outline-none active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit Inquiry</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryForm;
