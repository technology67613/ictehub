import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer({ setView }) {
  const id = "icte-grad-footer";

  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-slate-900 py-16 px-6 sm:px-10 text-slate-400 font-sans z-10 relative">
      <div className="max-w-[1800px] mx-auto space-y-12">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Logo & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView && setView('home')}>
              <div className="bg-white px-3.5 py-2 rounded-xl inline-flex items-center shadow-inner">
                <img src="/logo.png" className="h-8 w-auto object-contain" alt="ICTE Logo" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 max-w-sm">
              Find the right university for your future. Accompanying you at every step of your educational roadmap.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider">
              <li>
                <button onClick={() => setView && setView('home')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setView && setView('browse')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Colleges
                </button>
              </li>
              <li>
                <button onClick={() => setView && setView('checkStatus')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Check Status
                </button>
              </li>
            </ul>
          </div>

          {/* For Partners */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">For Partners</h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider">
              <li>
                <button onClick={() => setView && setView('partnerWithUs')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Partner With Us
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Legal</h4>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider">
              <li>
                <button onClick={() => setView && setView('privacy')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setView && setView('terms')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => setView && setView('disclaimer')} className="bg-transparent border-none text-slate-500 hover:text-[#1E40FF] transition-colors cursor-pointer outline-none p-0">
                  Disclaimer
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-slate-900" />

        {/* Contact Info Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-900 pb-8 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#1E40FF]" />
            <span>+91 XXXXX XXXXX</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-[#1E40FF]" />
            <span>info@ictehub.com</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#1E40FF]" />
            <span>New Delhi, India</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <span>© {new Date().getFullYear()} ICTE Hub. All rights reserved.</span>
          <span>Built with care in India</span>
        </div>

      </div>
    </footer>
  );
}
