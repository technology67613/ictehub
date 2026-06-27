import React, { useState, useEffect } from 'react';
import { Search, RotateCw, Inbox, AlertTriangle } from 'lucide-react';
import InquiryForm from './InquiryForm';
import CollegeCard from './CollegeCard';

const CollegeBrowse = ({ searchQuery, setSearchQuery, activeMode, setActiveMode }) => {
  const [allColleges, setAllColleges] = useState([]); // Used for statistics and counts
  const [colleges, setColleges] = useState([]); // Filtered by mode from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preselectedCollegeId, setPreselectedCollegeId] = useState(null);

  // Fetch all colleges once to populate initial counts and stat bar
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
      if (mode && mode !== 'All') {
        url += `?mode=${mode}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch colleges');
      }
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      console.error(err);
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

  // Statistics calculation
  const totalCount = allColleges.length;
  const onlineCount = allColleges.filter((c) => c.mode === 'Online').length;
  const offlineCount = allColleges.filter((c) => c.mode === 'Offline').length;

  // Real-time client-side search filtering
  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInquire = (id) => {
    setPreselectedCollegeId(id);
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans text-slate-600">
      {/* Header section */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="bg-section-light border border-academic-border text-academic-navy text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
          Partner Network
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-academic-navy tracking-tight mb-3">
          Explore Colleges
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mb-4 leading-relaxed">
          Find the best partner institutions and courses for your career
        </p>
        
        {/* Inline Stat Strip */}
        <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
          <div>
            <span className="text-academic-navy font-extrabold text-sm">{totalCount || '0'}</span> Colleges
          </div>
          <div className="w-px h-3 bg-academic-border"></div>
          <div>
            <span className="text-tag-accent font-extrabold text-sm">{onlineCount || '0'}</span> Online
          </div>
          <div className="w-px h-3 bg-academic-border"></div>
          <div>
            <span className="text-academic-navy font-extrabold text-sm">{offlineCount || '0'}</span> Offline
          </div>
        </div>

        <button
          onClick={() => {
            setPreselectedCollegeId(null);
            setIsFormOpen(true);
          }}
          className="mt-6 bg-academic-gold text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-full shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer border-none"
        >
          Interested? Get a free consultation
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row gap-5 items-center justify-between bg-white border border-academic-border rounded-2xl p-6 mb-10 shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            className="w-full pl-10 pr-12 py-2.5 rounded-full border border-academic-border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-academic-gold focus:ring-4 focus:ring-academic-gold/10 transition-all duration-150 box-sizing-border"
            placeholder="Search colleges by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="flex gap-2.5 flex-wrap">
          <button
            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeMode === 'All'
                ? 'bg-academic-gold border-academic-gold text-white shadow-sm'
                : 'bg-white border-academic-border text-slate-500 hover:bg-section-light'
            }`}
            onClick={() => setActiveMode('All')}
          >
            All <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'All' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{totalCount}</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeMode === 'Online'
                ? 'bg-academic-gold border-academic-gold text-white shadow-sm'
                : 'bg-white border-academic-border text-slate-500 hover:bg-section-light'
            }`}
            onClick={() => setActiveMode('Online')}
          >
            Online <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'Online' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{onlineCount}</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeMode === 'Offline'
                ? 'bg-academic-gold border-academic-gold text-white shadow-sm'
                : 'bg-white border-academic-border text-slate-500 hover:bg-section-light'
            }`}
            onClick={() => setActiveMode('Offline')}
          >
            Offline <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'Offline' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{offlineCount}</span>
          </button>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-academic-border rounded-2xl p-6 shadow-sm animate-pulse flex flex-col gap-4 max-w-[380px] w-full mx-auto">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="flex-grow flex flex-col gap-2">
                  <div className="w-3/5 h-4 bg-slate-200 rounded-full"></div>
                  <div className="w-2/5 h-3 bg-slate-200 rounded-full"></div>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full mt-4"></div>
              <div className="flex gap-2 mt-2">
                <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
                <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
                <div className="h-7 w-16 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center bg-section-light border border-academic-border text-red-700 rounded-2xl p-8 max-w-md mx-auto">
          <AlertTriangle className="mx-auto w-10 h-10 text-red-600 mb-3" />
          <h3 className="text-base font-bold mb-1 text-academic-navy">Something went wrong</h3>
          <p className="text-sm mb-4 text-red-600">{error}</p>
          <button
            className="bg-academic-navy hover:bg-opacity-90 text-white text-xs font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer flex items-center gap-2 mx-auto"
            onClick={() => fetchColleges(activeMode)}
          >
            <RotateCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : filteredColleges.length === 0 ? (
        <div className="text-center bg-white border border-academic-border rounded-2xl p-16 max-w-md mx-auto shadow-sm">
          <Inbox className="mx-auto w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-academic-navy mb-1">No Colleges Found</h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            We couldn't find any colleges matching your search query or filters.
          </p>
          <button
            className="bg-academic-gold text-white text-xs font-bold px-6 py-3 rounded-full border-none cursor-pointer transition-colors"
            onClick={() => {
              setSearchQuery('');
              setActiveMode('All');
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              onInquire={handleInquire}
            />
          ))}
        </div>
      )}
      
      {/* Inquiry Form Modal */}
      <InquiryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        preselectedCollegeId={preselectedCollegeId}
      />
    </div>
  );
};

export default CollegeBrowse;
