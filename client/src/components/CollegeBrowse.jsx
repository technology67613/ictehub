import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Search, RotateCw, Inbox, AlertTriangle } from 'lucide-react';

const CollegeBrowse = () => {
  const [allColleges, setAllColleges] = useState([]); // Used for statistics and counts
  const [colleges, setColleges] = useState([]); // Filtered by mode from API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCards, setExpandedCards] = useState({});

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

  const getInitials = (name) => {
    if (!name) return 'UN';
    const cleanName = name.replace(/(University|College|Institute|Academy|School|of|and|the)/gi, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans text-slate-600">
      {/* Header section */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="bg-[#FAF8F3] border border-academic-border text-academic-navy text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-4">
          Partner Network
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-academic-navy tracking-tight mb-3">
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
            <span className="text-[#2F6F4E] font-extrabold text-sm">{onlineCount || '0'}</span> Online
          </div>
          <div className="w-px h-3 bg-academic-border"></div>
          <div>
            <span className="text-[#1B2A4A] font-extrabold text-sm">{offlineCount || '0'}</span> Offline
          </div>
        </div>
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
                : 'bg-white border-academic-border text-slate-500 hover:bg-[#FAF8F3]'
            }`}
            onClick={() => setActiveMode('All')}
          >
            All <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'All' ? 'bg-[#FAF8F3]/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{totalCount}</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeMode === 'Online'
                ? 'bg-academic-gold border-academic-gold text-white shadow-sm'
                : 'bg-white border-academic-border text-slate-500 hover:bg-[#FAF8F3]'
            }`}
            onClick={() => setActiveMode('Online')}
          >
            Online <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'Online' ? 'bg-[#FAF8F3]/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{onlineCount}</span>
          </button>
          <button
            className={`px-5 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-2 ${
              activeMode === 'Offline'
                ? 'bg-academic-gold border-academic-gold text-white shadow-sm'
                : 'bg-white border-academic-border text-slate-500 hover:bg-[#FAF8F3]'
            }`}
            onClick={() => setActiveMode('Offline')}
          >
            Offline <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeMode === 'Offline' ? 'bg-[#FAF8F3]/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{offlineCount}</span>
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
        <div className="text-center bg-[#FAF8F3] border border-[#E7E2D6] text-red-700 rounded-2xl p-8 max-w-md mx-auto">
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
          {filteredColleges.map((college) => {
            const hasMoreCourses = college.courses_offered && college.courses_offered.length > 3;
            const isExpanded = expandedCards[college.id];
            const coursesToShow = isExpanded
              ? college.courses_offered
              : (college.courses_offered || []).slice(0, 3);

            return (
              <div
                key={college.id}
                className={`bg-white border border-academic-border rounded-2xl p-6 shadow-sm hover:-translate-y-1.5 hover:shadow-md transition-all duration-250 flex flex-col justify-between relative overflow-hidden max-w-[380px] w-full mx-auto ${
                  college.mode === 'Online' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-blue-700'
                }`}
              >
                <div className="mb-4">
                  <div className="flex items-start gap-4 relative">
                    {/* Circle initials badge with thin gold ring border (seal) */}
                    <div className="w-12 h-12 rounded-full border-2 border-academic-gold bg-white flex items-center justify-center font-serif font-extrabold text-academic-navy shadow-sm flex-shrink-0">
                      {getInitials(college.name)}
                    </div>
                    <div className="flex-grow min-w-0 pr-16">
                      <h3 className="text-base font-serif font-bold text-academic-navy leading-snug">
                        {college.name}
                      </h3>
                      {college.mode === 'Offline' && college.location ? (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {college.location}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" /> Fully Virtual
                        </span>
                      )}
                    </div>
                    <span
                      className={`absolute top-0 right-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        college.mode === 'Online'
                          ? 'bg-[#E8F3EC] text-[#2F6F4E]'
                          : 'bg-[#E8ECF3] text-[#1B2A4A]'
                      }`}
                    >
                      {college.mode}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-auto">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Courses Offered
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {coursesToShow.map((course, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-50 text-slate-600 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-100"
                      >
                        {course}
                      </span>
                    ))}
                    {hasMoreCourses && (
                      <button
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border-none cursor-pointer transition-colors ${
                          isExpanded
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                        onClick={(e) => toggleExpand(college.id, e)}
                      >
                        {isExpanded ? 'Show less' : `+${college.courses_offered.length - 3} more`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CollegeBrowse;
