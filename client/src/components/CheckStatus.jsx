import React, { useState } from 'react';
import { Search, Loader2, Calendar, BookOpen, AlertCircle, Phone, Info, Award, User } from 'lucide-react';

const API = 'https://ictehub.onrender.com';

const STATUS_TRANS = {
  'new': {
    label: "Inquiry Received",
    desc: "We've received your request! An advisor will review your options shortly.",
    color: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  'contacted': {
    label: "Contacted",
    desc: "Our team has contacted you. We are ready to help you select a program.",
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200'
  },
  'interested': {
    label: "Evaluation",
    desc: "Your profile is updated. We are finalizing details for your target universities.",
    color: 'text-purple-700 bg-purple-50 border-purple-200'
  },
  'not-interested': {
    label: "Closed",
    desc: "Inquiry closed. Let us know if you decide to explore other courses.",
    color: 'text-slate-500 bg-slate-50 border-slate-200'
  },
  'enrolled-college': {
    label: "Enrolled",
    desc: "Congratulations! You are enrolled in a partner university.",
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  'enrolled-institute': {
    label: "Directly Enrolled",
    desc: "Congratulations! You are enrolled directly in our degree program.",
    color: 'text-teal-700 bg-teal-50 border-teal-200'
  }
};

export default function CheckStatus() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [inquiries, setInquiries] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) return;

    setLoading(true);
    setError('');
    setInquiries(null);

    try {
      const res = await fetch(`${API}/leads/check?phone=${encodeURIComponent(phone.trim())}&name=${encodeURIComponent(name.trim())}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Status lookup failed');
      }
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40FF] bg-[#EEF2FF] px-3 py-1 rounded-full">
            Inquiry Tracker
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Check My Status</h1>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">
            Enter your name and mobile number below to retrieve status updates on your college inquiry.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter full name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 font-semibold placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                  required
                />
              </div>
              <div className="flex-1 relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter 10-digit phone number..."
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-800 font-semibold placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !phone.trim() || !name.trim()}
              className="bg-[#1E40FF] hover:bg-[#1E40FF]/90 text-white font-bold text-xs uppercase tracking-wider w-full sm:w-auto self-end px-8 py-3.5 rounded-xl shadow-lg shadow-[#1E40FF]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Check Status
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2.5 text-red-700 text-xs font-bold animate-in fade-in">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        {searched && inquiries !== null && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {inquiries.length === 0 ? (
              <div className="bg-amber-50/60 border border-amber-200 rounded-2rem p-8 flex flex-col items-center text-center gap-3">
                <Info size={36} className="text-amber-500 animate-pulse" />
                <h3 className="font-bold text-slate-800 text-base">No Inquiry Record Found</h3>
                <p className="text-xs font-semibold text-slate-500 max-w-md leading-relaxed">
                  We couldn't find an inquiry with this number. Make sure you've submitted the form, or contact us directly.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-2">
                  Found {inquiries.length} Active {inquiries.length === 1 ? 'Inquiry' : 'Inquiries'}
                </h2>
                {inquiries.map((inq) => {
                  const cfg = STATUS_TRANS[inq.status] || {
                    label: "In Progress",
                    desc: "Inquiry is currently in progress.",
                    color: "text-slate-700 bg-slate-50 border-slate-200"
                  };

                  const formattedDate = inq.created_at
                    ? new Date(inq.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '—';

                  return (
                    <div
                      key={inq.id}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6"
                    >
                      {/* Top Row: Name + Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Student Name</span>
                          <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">{inq.name}</h3>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border self-start sm:self-center ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Middle: Friendly updates */}
                      <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-start">
                        <Award size={18} className="text-[#1E40FF] shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-700 mb-0.5">Status Update</h4>
                          <p className="text-xs font-semibold text-slate-500 leading-relaxed">{cfg.desc}</p>
                        </div>
                      </div>

                      {/* bottom details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><BookOpen size={10} /> Interested Colleges</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {inq.interested_colleges && inq.interested_colleges.length > 0 ? (
                              inq.interested_colleges.map((col, idx) => (
                                <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                                  {col}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs font-semibold text-slate-400 italic">None selected</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Submitted On</span>
                          <span className="block text-xs font-bold text-slate-700 mt-1">{formattedDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
