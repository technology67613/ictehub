import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8FAFC] font-sans py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-8 sm:p-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">Privacy Policy</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Updated: June 2026</p>

        <hr className="border-slate-100" />

        <div className="space-y-6 text-sm text-slate-600 font-medium leading-relaxed">
          <p>
            Welcome to ICTE Hub. We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and share your information when you use our platform.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">1. Information We Collect</h2>
          <p>
            We collect personal data you provide directly to us (such as name, email address, phone number, and academic preferences) when you request university counseling or sign up. We also automatically track visitor activity such as mode filters and college profile views to optimize lead management.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to provide educational guidance, coordinate with our partner universities, assign leads to counselor teams, track enrollment status, and analyze anonymous platform metrics.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">3. Sharing with Third-Party Colleges</h2>
          <p>
            ICTE Hub functions as an educational consultancy. When you express interest in specific universities or courses, we share your basic contact info and preferences with the respective partner institutions so they can follow up with your enrollment query.
          </p>

          <h2 className="text-lg font-extrabold text-slate-800 mt-6">4. Data Integrity & Safety</h2>
          <p>
            Your information is stored securely in our systems. We do not sell your personal data to unauthorized advertising networks or target you with unrelated commercial solicitations.
          </p>
        </div>
      </div>
    </div>
  );
}
