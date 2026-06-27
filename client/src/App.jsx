import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import HomePage from './components/HomePage';
import CollegeBrowse from './components/CollegeBrowse';
import AuthPage from './components/AuthPage';
import AdminLeads from './components/AdminLeads';
import AdminCommissions from './components/AdminCommissions';
import AdminHotLeads from './components/AdminHotLeads';
import AdminColleges from './components/AdminColleges';
import AdminInstituteCourses from './components/AdminInstituteCourses';
import AdminUsers from './components/AdminUsers';
import TelecallerDashboard from './components/TelecallerDashboard';
import ProfilePage from './components/ProfilePage';
import CheckStatus from './components/CheckStatus';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Disclaimer from './components/Disclaimer';
import PartnerWithUs from './components/PartnerWithUs';
import AdminPartnerInquiries from './components/AdminPartnerInquiries';
import IcteLogo from './components/IcteLogo';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'browse', 'auth', 'leads', 'telecallerDashboard'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState('All');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    if (userData.role === 'admin') {
      setCurrentView('leads');
    } else if (userData.role === 'telecaller') {
      setCurrentView('telecallerDashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentView('home')}
          >
            <IcteLogo size={36} withText className="group-hover:opacity-90 transition-opacity" />
          </div>
          <nav className="flex gap-1 h-full items-center">
            <button
              className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                currentView === 'home'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button
              className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                currentView === 'browse'
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              onClick={() => setCurrentView('browse')}
            >
              Colleges
            </button>
            {!user && (
              <button
                className={`h-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none bg-transparent ${
                  currentView === 'checkStatus'
                    ? 'text-[#1E40FF]'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setCurrentView('checkStatus')}
              >
                Check Status
              </button>
            )}
            {user && user.role === 'admin' && (
              <>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'leads'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('leads')}
                >
                  Leads
                </button>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'manageColleges'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('manageColleges')}
                >
                  Manage Colleges
                </button>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'instituteCourses'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('instituteCourses')}
                >
                  Institute Courses
                </button>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'users'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('users')}
                >
                  Team
                </button>
                 <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'commissions'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('commissions')}
                >
                  Commissions
                </button>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    currentView === 'partnerInquiries'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('partnerInquiries')}
                >
                  Partner Inquiries
                </button>
                <button
                  className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1 ${
                    currentView === 'hotLeads'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('hotLeads')}
                >
                  <Flame size={13} className="text-amber-500 animate-pulse" />
                  Hot Leads
                </button>
              </>
            )}
             {user && user.role === 'telecaller' && (
              <button
                className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  currentView === 'telecallerDashboard'
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                onClick={() => setCurrentView('telecallerDashboard')}
              >
                My Leads
              </button>
            )}
            {!user ? (
              <button
                className={`ml-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  currentView === 'auth'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                }`}
                onClick={() => setCurrentView('auth')}
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-2.5 ml-2">
                {user.profile_picture_url ? (
                  <img
                    src={user.profile_picture_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover bg-slate-50 border border-slate-200 shadow-sm shrink-0 cursor-pointer"
                    onClick={() => setCurrentView('profile')}
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full bg-[#1E40FF] flex items-center justify-center font-bold text-white text-[10px] shrink-0 cursor-pointer"
                    onClick={() => setCurrentView('profile')}
                  >
                    {(user.name || user.email).slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-600 hidden md:inline">Logged in as {user.name || user.email.split('@')[0]}</span>
                <button
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer border-none"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {currentView === 'home' && (
          <HomePage
            setView={setCurrentView}
            setSearchQuery={setSearchQuery}
            setActiveMode={setActiveMode}
          />
        )}
         {currentView === 'browse' && (
          <CollegeBrowse
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            setView={setCurrentView}
          />
        )}
        {currentView === 'checkStatus' && (
          <CheckStatus />
        )}
        {currentView === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {currentView === 'leads' && user && user.role === 'admin' && (
          <AdminLeads token={token} />
        )}
        {currentView === 'manageColleges' && user && user.role === 'admin' && (
          <AdminColleges token={token} />
        )}
        {currentView === 'instituteCourses' && user && user.role === 'admin' && (
          <AdminInstituteCourses token={token} />
        )}
        {currentView === 'commissions' && user && user.role === 'admin' && (
          <AdminCommissions token={token} />
        )}
        {currentView === 'users' && user && user.role === 'admin' && (
          <AdminUsers token={token} />
        )}
        {currentView === 'hotLeads' && user && user.role === 'admin' && (
          <AdminHotLeads token={token} />
        )}
        {currentView === 'telecallerDashboard' && user && user.role === 'telecaller' && (
          <TelecallerDashboard token={token} user={user} />
        )}
        {currentView === 'profile' && user && (
          <ProfilePage
            user={user}
            token={token}
            onProfileUpdate={(updatedUser) => {
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }}
          />
        )}
        {currentView === 'privacy' && <PrivacyPolicy />}
        {currentView === 'terms' && <TermsOfService />}
        {currentView === 'disclaimer' && <Disclaimer />}
        {currentView === 'partnerWithUs' && <PartnerWithUs setView={setCurrentView} />}
        {currentView === 'partnerInquiries' && user && user.role === 'admin' && (
          <AdminPartnerInquiries token={token} />
        )}
      </main>
    </div>
  );
}

export default App;
