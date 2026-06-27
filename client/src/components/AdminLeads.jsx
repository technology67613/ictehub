import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, Filter, Calendar, Users, Briefcase, Mail, Phone, Clock, ChevronDown } from 'lucide-react';

const AdminLeads = ({ token }) => {
  const [leads, setLeads] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // All, New, Contacted, Interested, Enrolled

  useEffect(() => {
    fetchLeads();
    fetchTelecallers();
  }, [token]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('https://ictehub.onrender.com/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTelecallers = async () => {
    try {
      const response = await fetch('https://ictehub.onrender.com/users?role=telecaller', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTelecallers(data);
      }
    } catch (err) {
      console.error('Error fetching telecallers:', err);
    }
  };

  const handleAssignTelecaller = async (leadId, telecallerId) => {
    try {
      const response = await fetch(`https://ictehub.onrender.com/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ assigned_telecaller_id: telecallerId || null })
      });
      if (!response.ok) throw new Error('Failed to update telecaller assignment');
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, assigned_telecaller_id: telecallerId || null } : lead
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'New') return lead.status === 'new';
    if (activeFilter === 'Contacted') return lead.status === 'contacted';
    if (activeFilter === 'Interested') return lead.status === 'interested';
    if (activeFilter === 'Enrolled') return lead.status === 'enrolled-college' || lead.status === 'enrolled-institute';
    return true;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'contacted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'interested': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'not-interested': return 'bg-red-50 text-red-700 border-red-200';
      case 'enrolled-college': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'enrolled-institute': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New Lead';
      case 'contacted': return 'Contacted';
      case 'interested': return 'Interested';
      case 'not-interested': return 'Not Interested';
      case 'enrolled-college': return 'Enrolled: College';
      case 'enrolled-institute': return 'Enrolled: Institute';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 lg:p-12 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-cyan-400/10 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none -z-10 animate-blob animation-delay-4000"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* Header section */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-10 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase tracking-widest mb-3 border border-indigo-200 shadow-sm">
              <Briefcase size={14} /> Admin Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Leads Command Center</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">Oversee incoming inquiries, monitor telecaller assignments, and manage the student conversion pipeline efficiently.</p>
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm">
            {['All', 'New', 'Contacted', 'Interested', 'Enrolled'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all duration-300 outline-none ${
                  activeFilter === filter
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 rounded-2xl p-5 mb-8 flex items-center gap-3 shadow-sm animate-in fade-in zoom-in-95">
            <ShieldAlert size={20} className="text-red-500 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white/70 backdrop-blur-2xl border border-slate-200 rounded-3xl p-16 shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Syncing Pipeline...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-2xl border border-slate-200 rounded-3xl p-20 text-center shadow-lg flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5 shadow-inner border border-slate-200">
              <Filter size={32} className="text-slate-400" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-2xl mb-2">No Leads Found</h3>
            <p className="text-slate-500 text-sm font-medium">There are no leads matching the "{activeFilter}" view at this time.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Prospect Details</th>
                    <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Contact Channels</th>
                    <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Entry Date</th>
                    <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pipeline Status</th>
                    <th className="py-5 px-6 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Assigned Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-sm shadow-inner border border-indigo-200 group-hover:scale-105 transition-transform">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">{lead.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">ID: #{lead.id.substring(0,6)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold text-slate-700 text-xs flex items-center gap-2">
                            <Phone size={12} className="text-slate-400" /> {lead.phone}
                          </span>
                          {lead.email && (
                            <span className="font-medium text-slate-500 text-[11px] flex items-center gap-2">
                              <Mail size={12} className="text-slate-400" /> {lead.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-slate-500">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-700">
                            <Calendar size={12} className="text-slate-400" />
                            {new Date(lead.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-[10px] text-slate-400">
                            <Clock size={12} />
                            {new Date(lead.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${getStatusBadgeClass(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="relative inline-block w-48">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <UserCheck size={14} className="text-indigo-400" />
                          </div>
                          <select
                            value={lead.assigned_telecaller_id || ''}
                            onChange={(e) => handleAssignTelecaller(lead.id, e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-sm appearance-none"
                          >
                            <option value="" className="text-slate-400 font-medium">No Assignee</option>
                            {telecallers.map(caller => (
                              <option key={caller.id} value={caller.id} className="text-slate-900 font-medium">
                                {caller.name || caller.email}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ChevronDown size={14} className="text-slate-400" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeads;
