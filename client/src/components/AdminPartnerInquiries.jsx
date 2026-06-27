import React, { useState, useEffect, useMemo } from 'react';
import { Search, ShieldAlert, Loader2, Mail, Phone, User, Building, Calendar, Info } from 'lucide-react';

const API = 'https://ictehub.onrender.com';

export default function AdminPartnerInquiries({ token }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, [token]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/partner-inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch partner inquiries');
      const data = await response.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq =>
      !searchVal ||
      inq.college_name?.toLowerCase().includes(searchVal.toLowerCase()) ||
      inq.contact_person?.toLowerCase().includes(searchVal.toLowerCase()) ||
      inq.email?.toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [inquiries, searchVal]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Loading partner inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Partner Inquiries</h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">List of institution partnership proposals submitted online</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm font-semibold">
            <ShieldAlert size={16} className="shrink-0" /> {error}
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search by college, contact, or email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1fr] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Institution</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Contact Person</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Phone</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">Submitted</div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Building size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No partner inquiries found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredInquiries.map(inq => {
                const formattedDate = inq.created_at
                  ? new Date(inq.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '—';

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiry(inq)}
                    className="grid grid-cols-[1.5fr_1.2fr_1.2fr_1.2fr_1fr] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <div className="font-bold text-slate-900 text-sm truncate">{inq.college_name}</div>
                    <div className="text-xs font-semibold text-slate-600 truncate">{inq.contact_person}</div>
                    <div className="text-xs font-semibold text-slate-500 truncate">{inq.phone}</div>
                    <div className="text-xs font-semibold text-slate-500 truncate" title={inq.email}>{inq.email}</div>
                    <div className="text-xs font-semibold text-slate-400 text-right">{formattedDate}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Details Modal */}
      {selectedInquiry && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40" onClick={() => setSelectedInquiry(null)} />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50 animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl p-6 sm:p-8 max-w-lg w-full space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{selectedInquiry.college_name}</h3>
                  <span className="text-[9px] font-extrabold text-[#1E40FF] bg-[#EEF2FF] px-2 py-0.5 rounded uppercase tracking-wider block mt-1">Partnership Proposal</span>
                </div>
                <button onClick={() => setSelectedInquiry(null)} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={10} /> Contact Person</span>
                    <span className="block text-xs font-bold text-slate-700 mt-1">{selectedInquiry.contact_person}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Submitted On</span>
                    <span className="block text-xs font-bold text-slate-700 mt-1">
                      {new Date(selectedInquiry.created_at).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Phone size={10} /> Phone</span>
                    <span className="block text-xs font-bold text-slate-700 mt-1">{selectedInquiry.phone}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Mail size={10} /> Email</span>
                    <span className="block text-xs font-bold text-slate-700 mt-1 break-all">{selectedInquiry.email}</span>
                  </div>
                </div>

                {selectedInquiry.message && (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Info size={10} /> Message/Proposal</span>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                      "{selectedInquiry.message}"
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
