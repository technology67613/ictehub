import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Briefcase, Calculator, Award, Check, 
  Send, BookOpen, ArrowRight, Search, Atom, User, MonitorPlay, MapPin, Clock
} from 'lucide-react';
import CollegeCard from './CollegeCard';
import InquiryForm from './InquiryForm';

const HomePage = ({ setView, setSearchQuery, setActiveMode }) => {
  const [colleges, setColleges] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedCollegeId, setPreselectedCollegeId] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const [searchVal, setSearchVal] = useState('');
  const [modeVal, setModeVal] = useState('All');

  const [inlineData, setInlineData] = useState({
    name: '',
    phone: '',
    email: '',
    interested_college_ids: [],
  });
  const [inlineLoading, setInlineLoading] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [instituteCourses, setInstituteCourses] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('https://ictehub.onrender.com/colleges');
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
          setTotalCount(data.length);
        }
      } catch (err) {}
    };

    const fetchInstituteCourses = async () => {
      try {
        const res = await fetch('https://ictehub.onrender.com/institute-courses');
        if (res.ok) {
          const data = await res.json();
          setInstituteCourses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Error fetching institute courses:', e);
      }
    };

    fetchColleges();
    fetchInstituteCourses();
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
    setInlineData({ ...inlineData, [e.target.name]: e.target.value });
    setInlineError('');
  };

  const handleInlineCheckboxChange = (id) => {
    setInlineData((prev) => {
      const selected = prev.interested_college_ids.includes(id)
        ? prev.interested_college_ids.filter((item) => item !== id)
        : [...prev.interested_college_ids, id];
      return { ...prev, interested_college_ids: selected };
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inlineData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit inquiry.');
      setInlineSuccess(true);
      setInlineData({ name: '', phone: '', email: '', interested_college_ids: [] });
    } catch (err) {
      setInlineError(err.message || 'Server error. Please try again.');
    } finally {
      setInlineLoading(false);
    }
  };

  const topPicks = colleges.slice(0, 3);
  const featured = colleges.slice(0, 6);
  const uniqueCoursesCount = new Set(colleges.flatMap(c => c.courses_offered || [])).size;

  const categories = [
    { name: 'BCA', label: 'Computer Applications', icon: MonitorPlay, color: 'blue' },
    { name: 'BBA', label: 'Business Administration', icon: Briefcase, color: 'indigo' },
    { name: 'MBA', label: 'Business Mgmt (Masters)', icon: Award, color: 'purple' },
    { name: 'BSc', label: 'Science & Technology', icon: Atom, color: 'cyan' },
    { name: 'MSc', label: 'Advanced Science', icon: GraduationCap, color: 'emerald' },
    { name: 'BCom', label: 'Commerce & Finance', icon: Calculator, color: 'amber' },
  ];

  return (
    <div className="w-full bg-slate-50 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 relative overflow-x-hidden">
      
      {/* Dynamic Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 h-[800px]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] rounded-full bg-indigo-400/20 mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[70%] rounded-full bg-cyan-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[70%] rounded-full bg-purple-400/20 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative z-10 max-w-[1800px] mx-auto px-6 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center min-h-[90vh]">
        <div className="lg:col-span-7 flex flex-col items-start relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700">Welcome to ICTE Hub</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Find the Right <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">University</span> For Your Future
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 font-medium mb-10 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Discover accredited partner colleges offering distance, online, and offline degree programs. Request a free counseling session and secure your admission today.
          </p>
          
          <div className="flex flex-wrap gap-4 mb-14 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <button
              onClick={() => { setPreselectedCollegeId(null); setIsModalOpen(true); }}
              className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-xl shadow-xl shadow-indigo-500/30 hover:-translate-y-1 hover:shadow-indigo-500/40 transition-all cursor-pointer border-none overflow-hidden group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              Get Free Consultation
            </button>
            <button
              onClick={() => setView('browse')}
              className="bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-indigo-600 text-sm font-bold uppercase tracking-wider px-8 py-4 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
            >
              Browse Colleges
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-sm font-bold text-slate-500 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"><BookOpen size={16} className="text-indigo-500" /></div><span className="text-slate-800 text-lg">{totalCount || '20'}+</span> Universities</div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"><GraduationCap size={16} className="text-cyan-500" /></div><span className="text-slate-800 text-lg">{uniqueCoursesCount}+</span> Courses</div>
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"><Check size={16} className="text-emerald-500" /></div><span className="text-slate-800 text-lg">100% Free</span> Service</div>
          </div>
        </div>

        {/* Hero Right: "Your Top Picks" Glass Card */}
        <div className="lg:col-span-5 w-full relative z-20 animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 backdrop-blur-3xl rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] -z-10 transform rotate-3 scale-105"></div>
          <div className="bg-white/90 backdrop-blur-2xl border border-white shadow-2xl rounded-[2rem] p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30 flex items-center justify-center">
                  <StarIcon />
                </div>
                Top Recommendations
              </h3>
            </div>
            
            {topPicks.length === 0 ? (
              <div className="py-10 text-center text-sm font-semibold text-slate-400">Loading picks...</div>
            ) : (
              <div className="flex flex-col gap-4">
                {topPicks.map((pick, i) => (
                  <div key={pick.id} className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-100 p-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 flex items-center justify-between gap-4 cursor-pointer" onClick={() => handleInquire(pick.id)}>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-sm truncate group-hover:text-indigo-600 transition-colors">{pick.name}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                        {pick.mode === 'Offline' ? <MapPin size={12} className="text-slate-400" /> : <MonitorPlay size={12} className="text-slate-400" />}
                        {pick.mode === 'Offline' ? (pick.location || 'Offline') : 'Fully Virtual'}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-20 -mt-10 max-w-5xl mx-auto px-6">
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          {/* Repeating Dot Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen z-0">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="dot-grid-search" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-grid-search)" />
            </svg>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[50px]"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold text-white mb-6 text-center">Smart University Finder</h2>
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by keyword, name, or course..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 px-12 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/20 focus:ring-4 focus:ring-indigo-500/20 transition-all font-semibold"
                />
              </div>
              <div className="md:w-56 relative">
                <MonitorPlay size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={modeVal}
                  onChange={(e) => setModeVal(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white px-12 py-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white/20 focus:ring-4 focus:ring-indigo-500/20 transition-all font-semibold appearance-none cursor-pointer"
                >
                  <option value="All" className="text-slate-900">All Modes</option>
                  <option value="Online" className="text-slate-900">Online Only</option>
                  <option value="Offline" className="text-slate-900">Offline Only</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-2xl shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all outline-none"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. FEATURED UNIVERSITIES */}
      <section className="max-w-[1800px] mx-auto px-6 py-24 lg:py-32">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-2 block">Curated Choices</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Universities</h2>
          </div>
          <button
            onClick={() => setView('browse')}
            className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-wider"
          >
            View All Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm animate-pulse h-64 w-full"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
      <section className="bg-white py-24 px-6 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-[1800px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-500 mb-2 block">Filter Academics</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Browse by Category</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Explore top undergraduate and postgraduate majors tailored for your career path.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => { setSearchQuery(cat.name); setActiveMode('All'); setView('browse'); }}
                  className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-indigo-100 rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-300"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-${cat.color}-100 text-${cat.color}-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner`}>
                    <IconComp size={28} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-xs font-semibold text-slate-500">{cat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Degree Programs Section */}
      {instituteCourses.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-6 py-24 lg:py-32">
          <div className="text-center mb-16">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-500 mb-2 block">Direct Enrollment</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Our Own Degree Programs</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">Can't decide on a partner university? Enroll directly with us.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {instituteCourses.map((course) => (
              <div
                key={course.id}
                className="group relative bg-white border border-slate-100 shadow-sm hover:shadow-xl rounded-[2rem] p-8 flex flex-col justify-between hover:-translate-y-2 transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#1E40FF] flex items-center justify-center mb-6">
                    <GraduationCap size={24} />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-lg mb-2 leading-snug">{course.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-6">
                    <Clock size={12} />
                    <span>Duration: {course.duration || '2 years'}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 pt-5 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Program Fees</span>
                    <span className="text-base font-extrabold text-[#1E40FF]">
                      {course.fees !== null && course.fees !== undefined ? `₹${course.fees.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => { setPreselectedCollegeId(null); setIsModalOpen(true); }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-[#1E40FF] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors outline-none"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. INLINE CTA SECTION */}
      <section className="bg-slate-900 text-white py-24 px-6 relative overflow-hidden">
        {/* Repeating Dot Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen z-0">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dot-grid-cta" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#ffffff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dot-grid-cta)" />
          </svg>
        </div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
        </div>
        
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          <div className="lg:col-span-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-6 border border-indigo-500/30">
              <User size={24} />
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
              Talk to an Academic Counselor — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">100% Free</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl leading-relaxed">
              Have questions about qualifications, syllabus, duration, or tuition fees? Fill out the form and our experienced team will assist you in mapping your education roadmap.
            </p>
            <ul className="flex flex-col gap-5">
              <li className="flex items-center gap-4 text-slate-200 font-semibold text-base">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30"><Check size={14} /></div>
                Get direct admission updates in partner universities
              </li>
              <li className="flex items-center gap-4 text-slate-200 font-semibold text-base">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30"><Check size={14} /></div>
                Compare online degrees vs offline structures
              </li>
              <li className="flex items-center gap-4 text-slate-200 font-semibold text-base">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30"><Check size={14} /></div>
                No charges or service commission billed to students
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 w-full max-w-xl ml-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] p-8 sm:p-10 shadow-2xl">
              <h3 className="text-2xl font-extrabold text-white mb-8 flex items-center gap-3">
                <Send className="text-indigo-400" size={24} /> Drop an Inquiry
              </h3>
              
              {inlineSuccess ? (
                <div className="flex flex-col items-center text-center py-10 animate-in fade-in zoom-in-95">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <Check size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Request Submitted!</h4>
                  <p className="text-sm font-medium text-slate-400 max-w-sm mb-8">
                    Thank you! Our academic counselor will reach out to you shortly.
                  </p>
                  <button onClick={() => setInlineSuccess(false)} className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-xl transition-all">
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInlineSubmit} className="flex flex-col gap-5">
                  {inlineError && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 text-sm font-semibold rounded-xl p-4 flex items-center gap-2">
                      <span className="shrink-0">⚠️</span> {inlineError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input type="text" name="name" value={inlineData.name} onChange={handleInlineChange} className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="John Doe" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input type="tel" name="phone" value={inlineData.phone} onChange={handleInlineChange} className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="+1 234 567 890" required />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <input type="email" name="email" value={inlineData.email} onChange={handleInlineChange} className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm" placeholder="Optional" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 ml-1">Interested Colleges</label>
                    <div className="border border-white/10 rounded-xl p-4 bg-white/5 max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                      {colleges.length === 0 ? (
                        <span className="text-xs font-semibold text-slate-500">Loading colleges...</span>
                      ) : (
                        colleges.map((college) => (
                          <label key={college.id} className="flex items-center gap-3 text-sm font-medium text-slate-300 cursor-pointer hover:text-white transition-colors group">
                            <input type="checkbox" checked={inlineData.interested_college_ids.includes(college.id)} onChange={() => handleInlineCheckboxChange(college.id)} className="w-4 h-4 rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500/30" />
                            <span className="truncate">{college.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={inlineLoading} className="relative w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 overflow-hidden group border-none outline-none disabled:opacity-50">
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {inlineLoading ? 'Submitting...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <InquiryForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} preselectedCollegeId={preselectedCollegeId} />
    </div>
  );
};

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default HomePage;
