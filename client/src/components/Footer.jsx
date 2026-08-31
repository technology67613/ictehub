import React from 'react';
import { Mail, MapPin } from 'lucide-react';

export default function Footer({ setView }) {
  const id = "buddha-college-footer";

  return (
    <footer id={id} className="w-full bg-[#0A0A0A] border-t border-slate-900 py-12 px-6 sm:px-10 text-slate-400 font-sans z-10 relative overflow-hidden">
      <div className="max-w-[1800px] mx-auto space-y-10">
        
        {/* Top Grid Section: College Info | Quick Links | For Partners | Payment QR | Legal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-6 items-start">
          
          {/* 1. College Info */}
          <div className="space-y-4 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView && setView('home')}>
              <div className="bg-white px-3.5 py-2 rounded-2xl inline-flex items-center shadow-inner">
                <img src="/logo.png" className="h-10 w-auto object-contain" alt="Buddha College of Nursing" />
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-400">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Buddha College of Nursing
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                (Behind Brathanand Narayaan Specialty Hospital)<br />
                Tamulia, P.S.: Kadali, Dist.: Seraikela-Kharsawan, Jharkhand-831020
              </p>
              <p className="text-slate-400 text-xs">
                Email:{' '}
                <a 
                  href="mailto:buddhacollegeofnurrsskh@gmail.com" 
                  className="text-slate-300 hover:text-[#1E40FF] transition-colors underline-offset-2 hover:underline"
                >
                  buddhacollegeofnurrsskh@gmail.com
                </a>
              </p>
              <div className="pt-1 text-[11px] text-slate-500 leading-snug space-y-0.5">
                <p><span className="font-semibold text-slate-400">Affiliated by:</span> Health Education & Family Welfare Department</p>
                <p><span className="font-semibold text-slate-400">JNRC Ranchi,</span> Govt. of Jharkhand</p>
              </div>
            </div>
          </div>

          {/* 2. Quick Links */}
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

          {/* 3. For Partners */}
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

          {/* 4. Payment QR */}
          <div className="space-y-3 flex flex-col items-start sm:items-start">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">Payment</h4>
            <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-800 inline-block w-[170px] sm:w-[185px] lg:w-[190px] mx-auto sm:mx-0">
              <img 
                src="/canara-qr.png" 
                alt="Canara Bank Scan & Pay QR" 
                className="w-full h-auto object-contain rounded-lg block" 
              />
            </div>
          </div>

          {/* 5. Legal */}
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-6 text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#1E40FF] shrink-0" />
            <span>Tamulia, Seraikela-Kharsawan, Jharkhand – 831020</span>
          </div>
          <a href="mailto:buddhacollegeofnurrsskh@gmail.com" className="flex items-center gap-2 hover:text-[#1E40FF] transition-colors">
            <Mail size={14} className="text-[#1E40FF] shrink-0" />
            <span>buddhacollegeofnurrsskh@gmail.com</span>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          <span>© 2026 BUDDHA COLLEGE OF NURSING. ALL RIGHTS RESERVED.</span>
          <span>BUILT WITH CARE IN INDIA</span>
        </div>

      </div>
    </footer>
  );
}
