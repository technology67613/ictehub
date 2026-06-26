import React, { useState } from 'react';
import CollegeBrowse from './components/CollegeBrowse';
import AuthPage from './components/AuthPage';

function App() {
  const [currentView, setCurrentView] = useState('browse'); // 'browse' or 'auth'

  return (
    <div className="min-h-screen bg-academic-bg font-sans text-slate-600">
      <header className="sticky top-0 z-50 bg-white border-b border-academic-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-2xl font-serif font-extrabold text-academic-navy tracking-tight">
            ICTE Hub
          </div>
          <nav className="flex gap-8 h-full">
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
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)]">
        {currentView === 'browse' ? <CollegeBrowse /> : <AuthPage />}
      </main>
    </div>
  );
}

export default App;
