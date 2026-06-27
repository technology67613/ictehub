import React, { useState, useEffect } from 'react';
import { ShieldAlert, BookOpen, MessageSquare, PhoneCall, ChevronDown, ChevronUp, History, Send } from 'lucide-react';

const TelecallerDashboard = ({ token, user }) => {
  const [leads, setLeads] = useState([]);
  const [collegesMap, setCollegesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Expanded lead ID for details / logging call
  const [expandedLeadId, setExpandedLeadId] = useState(null);
  
  // Call log form states
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('interested');
  const [submittingLog, setSubmittingLog] = useState(false);
  const [callHistory, setCallHistory] = useState({}); // leadId -> array of call logs
  const [loadingHistory, setLoadingHistory] = useState({}); // leadId -> boolean

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch colleges to build ID -> Name map
      const colRes = await fetch('https://ictehub.onrender.com/colleges');
      if (colRes.ok) {
        const colleges = await colRes.json();
        const mapping = {};
        colleges.forEach(col => {
          mapping[col.id] = col.name;
        });
        setCollegesMap(mapping);
      }

      // Fetch my leads
      const leadsRes = await fetch('https://ictehub.onrender.com/leads/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!leadsRes.ok) {
        throw new Error('Failed to fetch assigned leads');
      }
      const leadsData = await leadsRes.json();
      setLeads(leadsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const response = await fetch(`https://ictehub.onrender.com/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      // Update local state
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchCallHistory = async (leadId) => {
    setLoadingHistory(prev => ({ ...prev, [leadId]: true }));
    try {
      const response = await fetch(`https://ictehub.onrender.com/call-logs/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCallHistory(prev => ({ ...prev, [leadId]: data }));
      }
    } catch (err) {
      console.error('Error fetching call logs:', err);
    } finally {
      setLoadingHistory(prev => ({ ...prev, [leadId]: false }));
    }
  };

  const toggleExpandLead = (leadId) => {
    if (expandedLeadId === leadId) {
      setExpandedLeadId(null);
    } else {
      setExpandedLeadId(leadId);
      setNotes('');
      setOutcome('interested');
      if (!callHistory[leadId]) {
        fetchCallHistory(leadId);
      }
    }
  };

  const handleLogCallSubmit = async (e, leadId) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Please enter call notes.');
      return;
    }
    setSubmittingLog(true);
    try {
      const response = await fetch('https://ictehub.onrender.com/call-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          lead_id: leadId,
          outcome,
          notes
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit call log.');
      }

      setNotes('');
      setOutcome('interested');
      // Refresh call logs history
      fetchCallHistory(leadId);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingLog(false);
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

  const getOutcomeBadgeClass = (outc) => {
    switch (outc) {
      case 'interested': return 'bg-emerald-50 border border-emerald-100 text-emerald-700';
      case 'not-interested': return 'bg-red-50 border border-red-100 text-red-700';
      case 'call-back-later': return 'bg-yellow-50 border border-yellow-100 text-yellow-700';
      case 'no-answer': return 'bg-slate-50 border border-slate-100 text-slate-500';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="pb-6 mb-8 border-b border-academic-border flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-academic-navy">Telecaller Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Hello, {user.name || 'Telecaller'}. Manage your assigned leads and log calls.</p>
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
          <span className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-wider">Loading Assigned Leads...</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white border border-academic-border rounded-2xl py-16 text-center shadow-sm">
          <PhoneCall className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-academic-navy text-lg">No Leads Assigned</h3>
          <p className="text-slate-400 text-xs mt-1">Check back later or contact admin to get leads assigned.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-white border border-academic-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800">{lead.name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-2 text-xs text-slate-500">
                    <div><span className="font-bold text-slate-700">Phone:</span> {lead.phone}</div>
                    {lead.email && <div><span className="font-bold text-slate-700">Email:</span> {lead.email}</div>}
                  </div>

                  {/* Interested Colleges list */}
                  <div className="flex items-start gap-1.5 mt-3">
                    <BookOpen className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {lead.interested_college_ids && lead.interested_college_ids.length > 0 ? (
                        lead.interested_college_ids.map(id => (
                          <span key={id} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                            {collegesMap[id] || 'Loading...'}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">None specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
                  {/* Status Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 font-bold focus:outline-none focus:border-academic-gold cursor-pointer"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="not-interested">Not Interested</option>
                      <option value="enrolled-college">Enrolled (College)</option>
                      <option value="enrolled-institute">Enrolled (Institute)</option>
                    </select>
                  </div>

                  {/* Toggle Log Call / History button */}
                  <button
                    onClick={() => toggleExpandLead(lead.id)}
                    className="mt-4 bg-slate-50 border border-slate-200 hover:border-academic-gold rounded-lg p-2 text-slate-600 cursor-pointer transition-colors"
                    title="Log call & view history"
                  >
                    {expandedLeadId === lead.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable section for call log form and history */}
              {expandedLeadId === lead.id && (
                <div className="mt-6 border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Left Column: Form to log a call */}
                  <div className="md:col-span-6 bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-academic-navy mb-4 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-academic-gold" />
                      Log Call Details
                    </h4>
                    
                    <form onSubmit={(e) => handleLogCallSubmit(e, lead.id)} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Call Outcome</label>
                        <select
                          value={outcome}
                          onChange={(e) => setOutcome(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-academic-gold cursor-pointer"
                        >
                          <option value="interested">Interested</option>
                          <option value="not-interested">Not Interested</option>
                          <option value="call-back-later">Call Back Later</option>
                          <option value="no-answer">No Answer</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Notes / Details</label>
                        <textarea
                          placeholder="Provide details about the call..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="3"
                          className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 focus:outline-none focus:border-academic-gold resize-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingLog}
                        className="bg-academic-navy text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg border-none hover:bg-opacity-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                      >
                        {submittingLog ? 'Saving...' : <><Send className="w-3.5 h-3.5" /> Submit Log</>}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Call logs history */}
                  <div className="md:col-span-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-academic-navy mb-4 flex items-center gap-2">
                      <History className="w-4 h-4 text-academic-gold" />
                      Call History
                    </h4>

                    {loadingHistory[lead.id] ? (
                      <p className="text-xs text-slate-400 py-4">Loading call history...</p>
                    ) : !callHistory[lead.id] || callHistory[lead.id].length === 0 ? (
                      <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center text-xs text-slate-400">
                        No calls logged yet.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-2">
                        {callHistory[lead.id].map((log) => (
                          <div key={log.id} className="bg-white border border-slate-100 rounded-lg p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center gap-2 mb-1.5">
                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${getOutcomeBadgeClass(log.outcome)}`}>
                                {log.outcome.replace('-', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(log.call_date).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{log.notes}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TelecallerDashboard;
