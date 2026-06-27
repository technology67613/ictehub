import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CollegeBrowse from './components/CollegeBrowse';
import AuthPage from './components/AuthPage';
import AdminLeads from './components/AdminLeads';
import AdminCommissions from './components/AdminCommissions';
import TelecallerDashboard from './components/TelecallerDashboard';
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
                    currentView === 'commissions'
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  onClick={() => setCurrentView('commissions')}
                >
                  Commissions
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
              <button
                className="ml-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </button>
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
          />
        )}
        {currentView === 'auth' && <AuthPage onAuthSuccess={handleAuthSuccess} />}
        {currentView === 'leads' && user && user.role === 'admin' && (
          <AdminLeads token={token} />
        )}
        {currentView === 'commissions' && user && user.role === 'admin' && (
          <AdminCommissions token={token} />
        )}
        {currentView === 'telecallerDashboard' && user && user.role === 'telecaller' && (
          <TelecallerDashboard token={token} user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
