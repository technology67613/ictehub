import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Calculator, 
  Award, 
  Check, 
  Send,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import CollegeCard from './CollegeCard';
import InquiryForm from './InquiryForm';

const HomePage = ({ setView, setSearchQuery, setActiveMode }) => {
  const [colleges, setColleges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedCollegeId, setPreselectedCollegeId] = useState(null);

  // Stats
  const [totalCount, setTotalCount] = useState(0);

  // Smart Search states
  const [searchVal, setSearchVal] = useState('');
  const [modeVal, setModeVal] = useState('All');

  // Inline Form States
  const [inlineData, setInlineData] = useState({
    name: '',
    phone: '',
    email: '',
    interested_college_ids: [],
  });
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState(false);
  const [inlineError, setInlineError] = useState('');

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://ictehub.onrender.com/colleges');
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
          setTotalCount(data.length);
        }
      } catch (err) {
        console.error('Error fetching colleges on homepage:', err);
      }
    };
    fetchColleges();
  }, []);

  const handleInquire = (id) => {
    setPreselectedCollegeId(id);
    setIsModalOpen(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchVal);
    setActiveMode(modeVal);
    setView('browse');
  };

  const handleInlineChange = (e) => {
    setInlineData({
      ...inlineData,
      [e.target.name]: e.target.value,
    });
    setInlineError('');
  };

  const handleInlineCheckboxChange = (id) => {
    setInlineData((prev) => {
      const selected = prev.interested_college_ids.includes(id)
        ? prev.interested_college_ids.filter((item) => item !== id)
        : [...prev.interested_college_ids, id];
      return {
        ...prev,
        interested_college_ids: selected,
      };
    });
  };

  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setInlineLoading(true);
    setInlineError('');
    setInlineSuccess(false);

    if (!inlineData.name.trim() || !inlineData.phone.trim()) {
      setInlineError('Name and Phone Number are required.');
      setInlineLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ictehub.onrender.com/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inlineData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit inquiry.');
      }

      setInlineSuccess(true);
      setInlineData({
        name: '',
        phone: '',
        email: '',
        interested_college_ids: [],
      });
    } catch (err) {
      setInlineError(err.message || 'Server error. Please try again.');
    } finally {
      setInlineLoading(false);
    }
  };

  // Top picks: first 3 colleges
  const topPicks = colleges.slice(0, 3);
  
  // Featured colleges: up to 6
  const featured = colleges.slice(0, 6);

  // Unique courses count
  const uniqueCoursesCount = new Set(colleges.flatMap(c => c.courses_offered || [])).size;

  // Static course categories
  const categories = [
    { name: 'BCA', label: 'Computer Applications', icon: GraduationCap },
    { name: 'BBA', label: 'Business Administration', icon: Briefcase },
    { name: 'MBA', label: 'Business Mgmt (Masters)', icon: Award },
    { name: 'BSc', label: 'Science & Technology', icon: Award },
    { name: 'MSc', label: 'Advanced Science', icon: GraduationCap },
    { name: 'BCom', label: 'Commerce & Finance', icon: Calculator },
  ];

  return (
    <div className="w-full bg-academic-bg text-slate-700 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start">
          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-6">
            Welcome to ICTE Hub
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-academic-navy tracking-tight leading-tight mb-6">
            Find the Right University for Your Future
          </h1>
          <p className="text-slate-500 text-base md:text-lg mb-8 max-w-xl leading-relaxed">
            Discover accredited partner colleges offering distance, online, and offline degree programs. Request a free counseling session and secure your admission today.
          </p>
          <div className="flex flex-wrap gap-4 mb-10 w-full sm:w-auto">
            <button
              onClick={() => {
                setPreselectedCollegeId(null);
                setIsModalOpen(true);
              }}
              className="bg-academic-gold text-white text-xs font-bold uppercase tracking-wider px-7 py-4 rounded-full shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer border-none"
            >
              Get Free Consultation
            </button>
            <button
              onClick={() => setView('browse')}
              className="bg-transparent border border-academic-border text-academic-navy text-xs font-bold uppercase tracking-wider px-7 py-4 rounded-full hover:bg-white active:scale-[0.98] transition-all cursor-pointer"
            >
              Browse Colleges
            </button>
          </div>
          
          {/* Stat strip below buttons */}
          <div className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-slate-400 border-t border-academic-border pt-8 w-full">
            <div>
              <span className="text-academic-navy font-extrabold text-sm">{totalCount || '20'}+</span> Universities
            </div>
            <div className="w-px h-3 bg-academic-border"></div>
            <div>
              <span className="text-academic-navy font-extrabold text-sm">{uniqueCoursesCount}+</span> Courses
            </div>
            <div className="w-px h-3 bg-academic-border"></div>
            <div>
              <span className="text-academic-gold font-extrabold text-sm">100%</span> Free Service
            </div>
          </div>
        </div>

        {/* Hero Right: "Your Top Picks" card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white border border-academic-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-academic-navy mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-academic-gold" />
              Your Top Picks
            </h3>
            {topPicks.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Loading recommendations...</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topPicks.map((pick) => (
                  <div key={pick.id} className="flex justify-between items-center p-3.5 bg-section-light border border-academic-border/60 rounded-xl hover:border-academic-gold/40 transition-colors">
                    <div className="min-w-0 pr-4">
                      <h4 className="font-bold text-slate-800 text-xs truncate">{pick.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{pick.mode === 'Offline' ? `📍 ${pick.location || 'Offline'}` : '🌐 Online'}</p>
                    </div>
                    <button
                      onClick={() => handleInquire(pick.id)}
                      className="bg-white border border-academic-border rounded-lg text-academic-navy px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:bg-academic-navy hover:text-white transition-all cursor-pointer shrink-0"
                    >
                      Inquire
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. SMART SEARCH SECTION */}
      <section className="bg-[#0A0A0A] text-white w-full py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-8 text-center">
            Smart University Finder
          </h2>
          <form onSubmit={handleSearchSubmit} className="w-full flex flex-col md:flex-row gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-300">College Name</label>
              <input
                type="text"
                placeholder="Search by keyword..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-academic-gold text-sm"
              />
            </div>
            <div className="md:w-48 flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Mode</label>
              <select
                value={modeVal}
                onChange={(e) => setModeVal(e.target.value)}
                className="w-full bg-white text-slate-900 px-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-academic-gold text-sm"
              >
                <option value="All">All Modes</option>
                <option value="Online">Online Only</option>
                <option value="Offline">Offline Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full md:w-auto bg-academic-gold hover:bg-opacity-95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl border-none cursor-pointer active:scale-[0.98] transition-all"
              >
                Find Universities
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. FEATURED UNIVERSITIES */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="flex justify-between items-end mb-10 pb-4 border-b border-academic-border">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Curated Choices</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-academic-navy mt-1">Featured Universities</h2>
          </div>
          <button
            onClick={() => setView('browse')}
            className="text-academic-gold hover:text-opacity-80 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 bg-transparent border-none cursor-pointer"
          >
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-academic-border rounded-2xl p-6 shadow-sm animate-pulse h-48 w-full max-w-[380px] mx-auto"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                onInquire={handleInquire}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. BROWSE BY COURSE */}
      <section className="bg-white border-t border-b border-academic-border py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Filter Academics</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-academic-navy mt-1">Browse by Course</h2>
            <p className="text-slate-500 text-sm mt-2">Explore undergraduate and postgraduate majors</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchQuery(cat.name);
                    setActiveMode('All');
                    setView('browse');
                  }}
                  className="bg-section-light border border-academic-border rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-academic-gold hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-academic-gold bg-white flex items-center justify-center mb-4 text-academic-navy">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-academic-navy text-sm">{cat.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">{cat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. INLINE CTA SECTION */}
      <section className="bg-[#0A0A0A] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* CTA Left: copy info */}
          <div className="lg:col-span-6">
            <span className="text-academic-gold text-[10px] font-bold uppercase tracking-wider mb-4 block">Enrollment Counseling</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Talk to an Academic Counselor — 100% Free
            </h2>
            <p className="text-slate-300 text-sm mb-8 max-w-lg leading-relaxed">
              Have questions about qualifications, syllabus, duration, or tuition fees? Fill out the form and our experienced team will assist you in mapping your education roadmap.
            </p>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-tag-accent/15 flex items-center justify-center text-tag-accent shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Get direct admission updates in partner universities</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-tag-accent/15 flex items-center justify-center text-tag-accent shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Compare online degrees vs offline structures</span>
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full bg-tag-accent/15 flex items-center justify-center text-tag-accent shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>No charges or service commission billed to students</span>
              </li>
            </ul>
          </div>

          {/* CTA Right: inline form */}
          <div className="lg:col-span-6 w-full max-w-lg bg-white text-slate-700 border border-academic-border rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-extrabold text-academic-navy mb-5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-academic-gold" />
              Inquiry Form
            </h3>
            
            {inlineSuccess ? (
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-academic-navy mb-2">Request Submitted!</h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  Thank you for submitting your request. We will contact you soon.
                </p>
                <button
                  onClick={() => setInlineSuccess(false)}
                  className="bg-academic-navy text-white text-xs font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleInlineSubmit} className="flex flex-col gap-4">
                {inlineError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg p-3 flex items-center gap-2">
                    <span>{inlineError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400" htmlFor="inline-name">Full Name</label>
                  <input
                    type="text"
                    id="inline-name"
                    name="name"
                    placeholder="John Doe"
                    value={inlineData.name}
                    onChange={handleInlineChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-academic-gold text-sm bg-slate-50"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400" htmlFor="inline-phone">Phone Number</label>
                  <input
                    type="tel"
                    id="inline-phone"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={inlineData.phone}
                    onChange={handleInlineChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-academic-gold text-sm bg-slate-50"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400" htmlFor="inline-email">Email (Optional)</label>
                  <input
                    type="email"
                    id="inline-email"
                    name="email"
                    placeholder="name@example.com"
                    value={inlineData.email}
                    onChange={handleInlineChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-academic-gold text-sm bg-slate-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Select Colleges of Interest</label>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-32 overflow-y-auto flex flex-col gap-1.5">
                    {colleges.length === 0 ? (
                      <span className="text-[11px] text-slate-400">Loading colleges...</span>
                    ) : (
                      colleges.map((college) => (
                        <label key={college.id} className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inlineData.interested_college_ids.includes(college.id)}
                            onChange={() => handleInlineCheckboxChange(college.id)}
                            className="w-3.5 h-3.5 rounded text-academic-gold border-slate-300"
                          />
                          <span className="truncate">{college.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={inlineLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-academic-navy text-white font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
                >
                  {inlineLoading ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit Inquiry</>}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Inquiry Form Modal Overlay */}
      <InquiryForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedCollegeId={preselectedCollegeId}
      />
    </div>
  );
};

export default HomePage;
