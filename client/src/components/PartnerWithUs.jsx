import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Building2, User, Phone, Mail, FileText, Loader2 } from 'lucide-react';
import Footer from './Footer';

const API = 'https://ictehub.onrender.com';

export default function PartnerWithUs({ setView }) {
  const [formData, setFormData] = useState({
    college_name: '',
    contact_person: '',
    phone: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    if (!formData.college_name.trim() || !formData.contact_person.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API}/partner-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit inquiry.');

      setSuccess(true);
      setFormData({ college_name: '', contact_person: '', phone: '', email: '', message: '' });
    } catch (err) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-between bg-[#F8FAFC] font-sans">
      <div className="max-w-2xl w-full mx-auto px-4 py-16 space-y-8 flex-1">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF] bg-[#EEF2FF] px-3 py-1 rounded-full">
            Partnership Program
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Partner With Us</h1>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
            List your university or college on ICTE Hub and connect with qualified prospective students.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 sm:p-10">
          {success ? (
            <div className="flex flex-col items-center text-center py-8 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Submission Received!</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mb-6">
                Thank you for your interest in partnering with us. Our institutional relations representative will contact you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors outline-none cursor-pointer border-none"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
                  <AlertCircle size={18} className="shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {/* Institution Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">College/Institution Name *</label>
                <div className="relative group">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleChange}
                    placeholder="e.g. Manipal Global University"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-semibold focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Contact Person Name *</label>
                <div className="relative group">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-semibold focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Phone Number *</label>
                  <div className="relative group">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-semibold focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Email Address *</label>
                  <div className="relative group">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. rajesh@university.edu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-semibold focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Proposal / Message</label>
                <div className="relative group">
                  <FileText size={16} className="absolute left-4 top-3 text-slate-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about the courses and enrollment opportunities you wish to list..."
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 font-semibold focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 border-none outline-none cursor-pointer"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Submit Partnership Request
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer setView={setView} />
    </div>
  );
}
