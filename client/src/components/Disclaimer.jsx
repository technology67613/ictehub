import React from 'react';

export default function Disclaimer() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Disclaimer</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated: June 2026</p>

        <hr className="border-slate-100" />

        <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            The information contained on the ICTE Hub platform is provided for general informational and academic guidance purposes only.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">1. No Affiliation Notice</h2>
          <p>
            ICTE Hub is an independent educational consultancy platform. We are not directly owned by, officially affiliated with, or run by any of the partner universities or colleges listed in our catalog.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">2. Third-Party Information Accuracy</h2>
          <p>
            While we make every effort to display accurate and current college details (including fees, courses, structure, and location details), all admissions, tuition amounts, policy details, and criteria are governed solely by the respective colleges. ICTE Hub is not liable for any discrepancies or sudden updates in university fees or guidelines.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">3. External Links</h2>
          <p>
            Our platform may contain links or redirect requests to external university portals. We are not responsible for the privacy practices, content, or accuracy of third-party websites.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">4. Financial Transactions</h2>
          <p>
            ICTE Hub does not collect tuition fees on behalf of colleges directly from students. All program fees, admission costs, and enrollment bills should be paid directly to the official bank accounts of the chosen universities.
          </p>
        </div>
      </div>
    </div>
  );
}
