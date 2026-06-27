import React, { useState } from 'react';
import { MapPin, Globe, ArrowRight } from 'lucide-react';
import { trackCollegeView } from '../utils/tracking';

const CollegeCard = ({ college, onInquire }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'UN';
    const cleanName = name.replace(/(University|College|Institute|Academy|School|of|and|the)/gi, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  const hasMoreCourses = college.courses_offered && college.courses_offered.length > 3;
  const coursesToShow = isExpanded
    ? college.courses_offered
    : (college.courses_offered || []).slice(0, 3);

  const isOnline = college.mode === 'Online';
  const colorClass = isOnline ? 'cyan' : 'indigo';

  const handleInquireClick = () => {
    trackCollegeView(college.id, college.name);
    onInquire(college.id);
  };

  return (
    <div className="group relative bg-white/90 backdrop-blur-xl rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-visible h-full w-full">
      
      {/* Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${colorClass}-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none -z-10 blur-xl`}></div>
      
      {/* Top Gradient Border */}
      <div className={`h-1.5 w-full bg-gradient-to-r from-${colorClass}-400 to-${colorClass}-600 rounded-t-[2rem] shrink-0`}></div>

      <div className="p-6 sm:p-8 flex flex-col flex-1 relative z-10 min-w-0">
        
        {/* Header Area */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="relative shrink-0">
            {college.logo_url ? (
              <img
                src={college.logo_url}
                alt={`${college.name} Logo`}
                className="w-14 h-14 rounded-2xl object-contain bg-slate-50 border border-slate-200 shadow-inner p-1 transform group-hover:rotate-6 transition-transform shrink-0"
              />
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-white flex items-center justify-center font-extrabold text-${colorClass}-600 text-xl shadow-inner border border-slate-200 transform group-hover:rotate-6 transition-transform shrink-0`}>
                {getInitials(college.name)}
              </div>
            )}
          </div>
          
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${colorClass}-50 text-${colorClass}-700 border border-${colorClass}-100 shrink-0`}>
            {college.mode}
          </span>
        </div>

        {/* Title and Location */}
        <div className="flex-1 min-w-0 mb-6">
          <h3 className="text-xl font-extrabold text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {college.name}
          </h3>
          {isOnline ? (
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Globe size={14} className="text-slate-400" /> Fully Virtual Campus
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <MapPin size={14} className="text-slate-400" /> {college.location || 'Campus Location'}
            </span>
          )}
        </div>

        {/* Courses Offered */}
        <div className="border-t border-slate-100 pt-5 mt-auto">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            Top Courses
          </span>
          <div className="flex flex-wrap gap-2 mb-6">
            {coursesToShow.map((course, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                {course}
              </span>
            ))}
            {hasMoreCourses && (
              <button
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer transition-colors ${
                  isExpanded ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Show less' : `+${college.courses_offered.length - 3} more`}
              </button>
            )}
          </div>
          
          <button
            onClick={handleInquireClick}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 group/btn outline-none"
          >
            Request Info <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollegeCard;
