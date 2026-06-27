import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CollegeBrowse from './components/CollegeBrowse';
import AuthPage from './components/AuthPage';
import AdminLeads from './components/AdminLeads';
import TelecallerDashboard from './components/TelecallerDashboard';

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
      <header className="sticky top-0 z-50 bg-white border-b border-academic-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-2xl font-extrabold text-academic-navy tracking-tight cursor-pointer" onClick={() => setCurrentView('home')}>
            ICTE Hub
          </div>
          <nav className="flex gap-8 h-full">
            <button
              className={`h-full px-1 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                currentView === 'home'
                  ? 'border-b-2 border-academic-gold text-academic-gold'
                  : 'border-transparent text-slate-500 hover:text-academic-navy'
              }`}
              onClick={() => setCurrentView('home')}
            >
              Home
            </button>
            <button
              className={`h-full px-1 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                currentView === 'browse'
                  ? 'border-b-2 border-academic-gold text-academic-gold'
                  : 'border-transparent text-slate-500 hover:text-academic-navy'
              }`}
              onClick={() => setCurrentView('browse')}
            >
              Colleges
            </button>
            {user && user.role === 'admin' && (
              <button
                className={`h-full px-1 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  currentView === 'leads'
                    ? 'border-b-2 border-academic-gold text-academic-gold'
                    : 'border-transparent text-slate-500 hover:text-academic-navy'
                }`}
                onClick={() => setCurrentView('leads')}
              >
                Leads
              </button>
            )}
            {user && user.role === 'telecaller' && (
              <button
                className={`h-full px-1 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  currentView === 'telecallerDashboard'
                    ? 'border-b-2 border-academic-gold text-academic-gold'
                    : 'border-transparent text-slate-500 hover:text-academic-navy'
                }`}
                onClick={() => setCurrentView('telecallerDashboard')}
              >
                My Leads
              </button>
            )}
            {!user ? (
              <button
                className={`h-full px-1 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                  currentView === 'auth'
                    ? 'border-b-2 border-academic-gold text-academic-gold'
                    : 'border-transparent text-slate-500 hover:text-academic-navy'
                }`}
                onClick={() => setCurrentView('auth')}
              >
                Login/Signup
              </button>
            ) : (
              <button
                className="h-full px-1 border-b-2 border-transparent text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-all duration-150 cursor-pointer"
                onClick={handleLogout}
              >
                Logout ({user.name || user.role})
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)]">
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
        {currentView === 'telecallerDashboard' && user && user.role === 'telecaller' && (
          <TelecallerDashboard token={token} user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
