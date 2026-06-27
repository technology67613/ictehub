import React, { useState } from 'react';
import { MapPin, Globe } from 'lucide-react';

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

  return (
    <div
      className={`bg-white border border-academic-border rounded-2xl p-6 shadow-sm hover:-translate-y-1.5 hover:shadow-md transition-all duration-250 flex flex-col justify-between relative overflow-hidden max-w-[380px] w-full mx-auto ${
        college.mode === 'Online' ? 'border-l-4 border-l-tag-accent' : 'border-l-4 border-l-academic-gold'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-start gap-4 relative">
          <div className="w-12 h-12 rounded-full border-2 border-academic-gold bg-white flex items-center justify-center font-extrabold text-academic-navy shadow-sm flex-shrink-0">
            {getInitials(college.name)}
          </div>
          <div className="flex-grow min-w-0 pr-16">
            <h3 className="text-base font-bold text-academic-navy leading-snug">
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
            className="absolute top-0 right-0 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-tag-accent/15 text-tag-accent"
          >
            {college.mode}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-auto">
        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
          Courses Offered
        </span>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {coursesToShow.map((course, idx) => (
            <span
              key={idx}
              className="bg-tag-accent/15 text-tag-accent text-[11px] font-semibold px-2.5 py-1 rounded-lg"
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
          onClick={() => onInquire(college.id)}
          className="w-full py-2 border border-academic-border rounded-xl text-academic-navy hover:text-white hover:bg-academic-navy text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer bg-white"
        >
          Request Info
        </button>
      </div>
    </div>
  );
};

export default CollegeCard;
