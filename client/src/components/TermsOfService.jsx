import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Terms of Service</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated: June 2026</p>

        <hr className="border-slate-100" />

        <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            By using the ICTE Hub platform, you agree to comply with and be bound by the following Terms of Service. Please review these terms carefully before submitting inquiries.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">1. Consultancy & Advisory Role</h2>
          <p>
            ICTE Hub is an independent guidance platform that connects students with universities and colleges. We do not guarantee admission to any college, and we do not issue official degrees. All degrees, admissions, and tuition collections are directly managed by the respective academic institutions.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">2. Accurate Information Submission</h2>
          <p>
            Students must submit authentic contact names and phone numbers. Falsified contact logs are subject to immediate removal from our advisory queues.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">3. Platform Communication</h2>
          <p>
            By sharing your phone number and submitting an inquiry form, you consent to receive calls, SMS messages, and emails from our academic operators regarding admission updates and university programs.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">4. Intellectual Property</h2>
          <p>
            All website structure, branding assets, custom widgets, and logo properties displayed on ICTE Hub belong to our team. Logo assets of partner universities are properties of the respective institutions.
          </p>
        </div>
      </div>
    </div>
  );
}
