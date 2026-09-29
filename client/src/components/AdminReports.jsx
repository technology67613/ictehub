import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart2, Users, PhoneCall, TrendingUp, Award, Download, Calendar,
  Crown, Loader2, ShieldAlert, CheckCircle2, Flame, PhoneOff, Clock
} from 'lucide-react';
import { API } from '../api';

export default function AdminReports({ token }) {
  const [range, setRange] = useState('7days');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [range, token]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/reports/telecaller-performance?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load telecaller performance report');
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.telecallers) return;
    const headers = ['Telecaller Name', 'Email', 'Total Calls', 'Connected Calls', 'Interested Calls', 'Callback Scheduled', 'No Answer', 'Assigned Leads', 'Enrolled Leads', 'Conversion Rate (%)'];
    const rows = reportData.telecallers.map(t => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${t.email || ''}"`,
      t.total_calls || 0,
      t.connected_calls || 0,
      t.interested_calls || 0,
      t.callback_calls || 0,
      t.no_answer_calls || 0,
      t.assigned_leads || 0,
      t.enrolled_leads || 0,
      `${t.conversion_rate || 0}%`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `telecaller_performance_${range}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const totals = reportData?.totals || {
    total_calls: 0,
    connected_calls: 0,
    interested_calls: 0,
    enrolled_leads: 0,
    total_telecallers: 0
  };

  const telecallers = reportData?.telecallers || [];
  const topPerformerId = reportData?.topPerformerId;

  // Max calls for relative bar chart width
  const maxCalls = useMemo(() => {
    return Math.max(...telecallers.map(t => t.total_calls), 1);
  }, [telecallers]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Team Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Telecaller Performance Report</h1>
            <p className="text-xs font-semibold text-slate-500">Monitor outreach volume, lead conversions, and telecaller effectiveness</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Range Selectors */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {[
                { key: 'today', label: 'Today' },
                { key: '7days', label: 'Last 7 Days' },
                { key: '30days', label: 'Last 30 Days' },
                { key: 'all', label: 'All Time' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setRange(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                    range === item.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs font-semibold">
            <ShieldAlert size={15} /> {error}
          </div>
        )}

        {/* ── KPI Totals Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E40FF] flex items-center justify-center font-bold shrink-0">
              <PhoneCall size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Calls Logged</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">{totals.total_calls}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Connected Calls</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">{totals.connected_calls}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Flame size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Interested</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">{totals.interested_calls}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Award size={22} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrolled Leads</div>
              <div className="text-xl font-black text-slate-900 leading-tight mt-0.5">{totals.enrolled_leads}</div>
            </div>
          </div>
        </div>

        {/* ── Telecaller Performance Table ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900">Counselor & Telecaller Rankings</h2>
              <p className="text-xs text-slate-400 font-semibold">Sorted by enrollments and total activity</p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {telecallers.length} Counselors
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={32} className="text-[#1E40FF] animate-spin" />
              <p className="text-xs font-semibold">Compiling telecaller metrics...</p>
            </div>
          ) : telecallers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No telecaller activity records found.</p>
              <p className="text-xs text-slate-400">Calls logged by telecallers will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="py-3.5 px-5">Telecaller</th>
                    <th className="py-3.5 px-4">Calls Logged</th>
                    <th className="py-3.5 px-4">Connected</th>
                    <th className="py-3.5 px-4">Interested</th>
                    <th className="py-3.5 px-4">Assigned Leads</th>
                    <th className="py-3.5 px-4">Enrolled</th>
                    <th className="py-3.5 px-5">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {telecallers.map((tc, index) => {
                    const isTopPerformer = tc.id === topPerformerId;
                    const callRatio = Math.round((tc.total_calls / maxCalls) * 100);

                    return (
                      <tr key={tc.id} className={`hover:bg-slate-50/80 transition-colors ${isTopPerformer ? 'bg-amber-50/30' : ''}`}>
                        
                        {/* Name & Badge */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 shrink-0">
                              {tc.name ? tc.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                                <span className="truncate">{tc.name}</span>
                                {isTopPerformer && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold shrink-0" title="Top Performer">
                                    <Crown size={11} className="text-amber-600 fill-amber-500" /> Top
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium truncate">{tc.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Total Calls + Mini CSS Bar */}
                        <td className="py-4 px-4">
                          <div className="font-extrabold text-slate-900">{tc.total_calls}</div>
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-500"
                              style={{ width: `${callRatio}%` }}
                            />
                          </div>
                        </td>

                        {/* Connected Calls */}
                        <td className="py-4 px-4 font-bold text-emerald-600">
                          {tc.connected_calls}
                        </td>

                        {/* Interested Calls */}
                        <td className="py-4 px-4 font-bold text-amber-600">
                          {tc.interested_calls}
                        </td>

                        {/* Assigned Leads */}
                        <td className="py-4 px-4 text-slate-700">
                          {tc.assigned_leads}
                        </td>

                        {/* Enrolled Leads */}
                        <td className="py-4 px-4 font-black text-purple-700">
                          {tc.enrolled_leads}
                        </td>

                        {/* Conversion Rate with Progress Bar */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 w-9">{tc.conversion_rate}%</span>
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  tc.conversion_rate >= 20 ? 'bg-emerald-500' : tc.conversion_rate >= 10 ? 'bg-blue-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${Math.min(tc.conversion_rate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
