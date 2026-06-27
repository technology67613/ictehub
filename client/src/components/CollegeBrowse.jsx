import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Inbox, AlertTriangle, MonitorPlay, MapPin, Grid, Layers, X } from 'lucide-react';
import { trackModeFilter } from '../utils/tracking';
import InquiryForm from './InquiryForm';
import CollegeCard from './CollegeCard';

const CollegeBrowse = ({ searchQuery, setSearchQuery, activeMode, setActiveMode }) => {
  const [allColleges, setAllColleges] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preselectedCollegeId, setPreselectedCollegeId] = useState(null);

  const fetchAllForStats = async () => {
    try {
      const response = await fetch('https://ictehub.onrender.com/colleges');
      if (response.ok) {
        const data = await response.json();
        setAllColleges(data);
      }
    } catch (err) {
      console.error('Stats loading error:', err);
    }
  };

  const fetchColleges = async (mode) => {
    setLoading(true);
    setError('');
    try {
      let url = 'https://ictehub.onrender.com/colleges';
      if (mode && mode !== 'All') url += `?mode=${mode}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch colleges');
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      setError('Could not load colleges. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllForStats();
  }, []);

  useEffect(() => {
    fetchColleges(activeMode);
  }, [activeMode]);

  const totalCount = allColleges.length;
  const onlineCount = allColleges.filter((c) => c.mode === 'Online').length;
  const offlineCount = allColleges.filter((c) => c.mode === 'Offline').length;

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (college.courses_offered || []).some(course => course.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleInquire = (id) => {
    setPreselectedCollegeId(id);
    setIsFormOpen(true);
  };

  const handleModeChange = (mode) => {
    trackModeFilter(mode);
    setActiveMode(mode);
  };

  return (
    <div className="max-w-[1800px] mx-auto px-6 py-12 lg:py-20 font-sans relative">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none -z-10 animate-blob"></div>
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none -z-10 animate-blob animation-delay-2000"></div>

      {/* Header section */}
      <div className="flex flex-col items-center text-center mb-16 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm mb-6">
          <Layers size={16} className="text-indigo-500" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700">Partner Network</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-4">
          Explore Colleges
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mb-8 leading-relaxed font-medium">
          Find the best partner institutions and courses for your career path. Connect with universities that match your goals.
        </p>
        
        {/* Stat Cards */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold uppercase tracking-wider text-slate-500 w-full mb-10">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><Grid size={20} /></div>
            <div className="flex flex-col items-start"><span className="text-slate-900 text-xl font-extrabold">{totalCount || '0'}</span><span className="text-[10px]">Total Colleges</span></div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-cyan-200 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center"><MonitorPlay size={20} /></div>
            <div className="flex flex-col items-start"><span className="text-cyan-700 text-xl font-extrabold">{onlineCount || '0'}</span><span className="text-[10px] text-cyan-600">Online Programs</span></div>
          </div>
          <div className="bg-white/80 backdrop-blur-md border border-indigo-200 shadow-sm rounded-2xl px-6 py-4 flex items-center gap-4 hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center"><MapPin size={20} /></div>
            <div className="flex flex-col items-start"><span className="text-indigo-700 text-xl font-extrabold">{offlineCount || '0'}</span><span className="text-[10px] text-indigo-600">Campus Programs</span></div>
          </div>
        </div>

        <button
          onClick={() => { setPreselectedCollegeId(null); setIsFormOpen(true); }}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm uppercase tracking-wider px-10 py-4 rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all overflow-hidden group outline-none"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          Interested? Get a Free Consultation
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-white/70 backdrop-blur-2xl border border-slate-200 rounded-[2rem] p-6 mb-12 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative w-full md:max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
          <input
            type="text"
            className="w-full pl-14 pr-14 py-4 rounded-xl border border-slate-200 bg-white text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium shadow-sm"
            placeholder="Search colleges by name or course (e.g. BCA, MBA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            className={`px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'All' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => handleModeChange('All')}
          >
            All <span className={`px-2 py-0.5 rounded text-[10px] ${activeMode === 'All' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>{totalCount}</span>
          </button>
          <button
            className={`px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'Online' ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => handleModeChange('Online')}
          >
            Online <span className={`px-2 py-0.5 rounded text-[10px] ${activeMode === 'Online' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>{onlineCount}</span>
          </button>
          <button
            className={`px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeMode === 'Offline' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => handleModeChange('Offline')}
          >
            Offline <span className={`px-2 py-0.5 rounded text-[10px] ${activeMode === 'Offline' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>{offlineCount}</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      <div className="relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white/80 border border-slate-100 rounded-[2rem] p-8 shadow-sm animate-pulse flex flex-col gap-6 h-[300px] w-full">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded-2xl bg-slate-200"></div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-3/4 h-5 bg-slate-200 rounded-full"></div>
                    <div className="w-1/2 h-4 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
                <div className="w-full h-px bg-slate-100 mt-auto"></div>
                <div className="w-full h-10 bg-slate-200 rounded-xl mt-2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center bg-red-50/50 border border-red-100 rounded-[2rem] p-12 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Something went wrong</h3>
            <p className="text-sm font-medium text-slate-600 mb-8">{error}</p>
            <button
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl shadow-md flex items-center gap-2 mx-auto transition-all outline-none"
              onClick={() => fetchColleges(activeMode)}
            >
              <RotateCw size={16} /> Try Again
            </button>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center bg-white/70 backdrop-blur-md border border-slate-200 rounded-[2rem] p-16 max-w-lg mx-auto shadow-sm">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Inbox size={40} />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No Colleges Found</h3>
            <p className="text-slate-500 text-base font-medium mb-8 leading-relaxed">
              We couldn't find any colleges matching your search query or filters.
            </p>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded-xl shadow-md transition-all outline-none"
              onClick={() => { setSearchQuery(''); setActiveMode('All'); }}
            >
              Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} onInquire={handleInquire} />
            ))}
          </div>
        )}
      </div>
      
      {/* Inquiry Form Modal */}
      <InquiryForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} preselectedCollegeId={preselectedCollegeId} />
    </div>
  );
};

export default CollegeBrowse;
