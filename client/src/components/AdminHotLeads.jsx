import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ShieldAlert, Loader2, Flame, Eye, Clock, Calendar, Globe,
  Activity, Users, Award, BookOpen
} from 'lucide-react';

const API = 'https://ictehub.onrender.com';

function timeAgo(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminHotLeads({ token }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    fetchHotLeads();
  }, [token]);

  const fetchHotLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/visitors/hot-leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch hot leads');
      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter(s => {
      const matchesSearch = !searchVal || 
        s.session_id?.toLowerCase().includes(searchVal.toLowerCase()) ||
        (s.viewed_colleges || []).some(c => c.college_name?.toLowerCase().includes(searchVal.toLowerCase())) ||
        (s.mode_filters_used || []).some(m => m?.toLowerCase().includes(searchVal.toLowerCase()));
      return matchesSearch;
    });
  }, [sessions, searchVal]);

  const stats = useMemo(() => {
    const totalViews = sessions.reduce((sum, s) => sum + (s.total_views || 0), 0);
    
    // Calculate most viewed college
    const collegeCounts = {};
    sessions.forEach(s => {
      (s.viewed_colleges || []).forEach(c => {
        if (c.college_name) {
          collegeCounts[c.college_name] = (collegeCounts[c.college_name] || 0) + (c.count || 0);
        }
      });
    });
    
    let maxCount = 0;
    let maxName = 'N/A';
    Object.entries(collegeCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxName = name;
      }
    });

    const mostViewed = maxCount > 0 ? `${maxName} (${maxCount}x)` : 'N/A';

    return {
      totalSessions: sessions.length,
      totalViews,
      mostViewed
    };
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-[#1E40FF] animate-spin" />
          <p className="text-slate-600 font-semibold">Analyzing traffic patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      
      {/* ── Page Wrapper ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        
        {/* ── Stats Row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Hot Sessions', value: stats.totalSessions, icon: Users, color: '#1E40FF', bg: '#EEF2FF' },
            { label: 'Total Views (Across All)', value: stats.totalViews, icon: Eye, color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Most Viewed College', value: stats.mostViewed, icon: Award, color: '#F59E0B', bg: '#FFFBEB' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg }}>
                  <Icon size={17} style={{ color: stat.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  <div className="text-lg font-extrabold text-slate-900 leading-tight mt-0.5 truncate max-w-[240px]" title={stat.value.toString()}>
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
              placeholder="Search by session, college name, or filter tag..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:border-[#1E40FF]/50 focus:ring-2 focus:ring-[#1E40FF]/15 outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Hot Leads Table ── */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_2.5fr_1.5fr_1fr_1.5fr] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Session ID</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Colleges Viewed</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Mode Filters</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Views</div>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Timeline</div>
          </div>

          {/* Table Rows */}
          {filteredSessions.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Search size={32} className="text-slate-300" />
              <p className="font-semibold text-sm">No hot sessions matching filters</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredSessions.map(session => {
                const viewsStr = (session.viewed_colleges || [])
                  .map(c => `${c.college_name} (${c.count}x)`)
                  .join(', ');

                return (
                  <div
                    key={session.id}
                    className="grid grid-cols-[1fr_2.5fr_1.5fr_1fr_1.5fr] gap-3 items-center px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Session ID */}
                    <div className="font-mono text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded w-fit">
                      {session.session_id ? session.session_id.substring(0, 8) : 'unknown'}
                    </div>

                    {/* Colleges Viewed */}
                    <div className="text-sm font-semibold text-slate-800 leading-relaxed max-w-sm truncate" title={viewsStr}>
                      {viewsStr || <span className="text-slate-300">—</span>}
                    </div>

                    {/* Mode Filters Used */}
                    <div className="flex flex-wrap gap-1">
                      {session.mode_filters_used && session.mode_filters_used.length > 0 ? (
                        session.mode_filters_used.map((mode, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                              mode === 'Online'
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                : mode === 'Offline'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {mode}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </div>

                    {/* Total Views */}
                    <div className="text-sm font-bold text-slate-900">
                      {session.total_views || 0}
                    </div>

                    {/* Timeline (First seen / Last seen) */}
                    <div className="flex flex-col gap-0.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400 shrink-0" />
                        <span>Active {timeAgo(session.last_seen_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar size={11} className="text-slate-300 shrink-0" />
                        <span>First seen {timeAgo(session.first_seen_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {filteredSessions.length > 0 && (
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 font-bold">
              Showing {filteredSessions.length} of {sessions.length} hot visitor sessions
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
