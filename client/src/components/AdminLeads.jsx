import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, Filter, Calendar } from 'lucide-react';

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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      if (!response.ok) {
        throw new Error('Failed to update telecaller assignment');
      }
      // Update local state
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
      case 'new':
        return 'bg-slate-100 text-slate-700';
      case 'contacted':
        return 'bg-blue-100 text-blue-700';
      case 'interested':
        return 'bg-[#FFA94D]/15 text-[#FFA94D] font-semibold';
      case 'not-interested':
        return 'bg-red-100 text-red-700';
      case 'enrolled-college':
        return 'bg-emerald-100 text-emerald-700';
      case 'enrolled-institute':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return 'New';
      case 'contacted': return 'Contacted';
      case 'interested': return 'Interested';
      case 'not-interested': return 'Not Interested';
      case 'enrolled-college': return 'Enrolled (College)';
      case 'enrolled-institute': return 'Enrolled (Institute)';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-academic-border">
        <div>
          <h1 className="text-3xl font-extrabold text-academic-navy">Admin Leads Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, filter, and assign incoming inquiries to telecallers.</p>
        </div>
        
        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0 bg-slate-100 p-1.5 rounded-xl">
          {['All', 'New', 'Contacted', 'Interested', 'Enrolled'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border-none cursor-pointer ${
                activeFilter === filter
                  ? 'bg-academic-gold text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 bg-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-academic-gold rounded-full animate-spin"></div>
          <span className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-wider">Loading Leads...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-academic-border rounded-2xl py-16 text-center shadow-sm">
          <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-academic-navy text-lg">No Leads Found</h3>
          <p className="text-slate-400 text-xs mt-1">There are no leads matching the "{activeFilter}" filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-academic-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-academic-border text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Assigned Telecaller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {lead.name}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{lead.phone}</span>
                        {lead.email && <span className="text-xs text-slate-400 mt-0.5">{lead.email}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(lead.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusBadgeClass(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                          value={lead.assigned_telecaller_id || ''}
                          onChange={(e) => handleAssignTelecaller(lead.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:border-academic-gold transition-colors cursor-pointer"
                        >
                          <option value="">Unassigned</option>
                          {telecallers.map(caller => (
                            <option key={caller.id} value={caller.id}>
                              {caller.name || caller.email}
                            </option>
                          ))}
                        </select>
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
  );
};

export default AdminLeads;
