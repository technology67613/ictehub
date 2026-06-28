import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { Menu, X } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeMode, setActiveMode] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      navigate('/admin');
    } else if (userData.role === 'telecaller') {
      navigate('/telecaller');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const handleSetView = (view) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'browse':
        navigate('/colleges');
        break;
      case 'auth':
        navigate('/login');
        break;
      case 'checkStatus':
        navigate('/check-status');
        break;
      case 'leads':
        navigate('/admin');
        break;
      case 'manageColleges':
        navigate('/admin/colleges');
        break;
      case 'instituteCourses':
        navigate('/admin/institute-courses');
        break;
      case 'commissions':
        navigate('/admin/commissions');
        break;
      case 'users':
        navigate('/admin/team');
        break;
      case 'hotLeads':
        navigate('/admin/hot-leads');
        break;
      case 'partnerInquiries':
        navigate('/admin/partner-inquiries');
        break;
      case 'telecallerDashboard':
        navigate('/telecaller');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'privacy':
        navigate('/privacy');
        break;
      case 'terms':
        navigate('/terms');
        break;
      case 'disclaimer':
        navigate('/disclaimer');
        break;
      case 'partnerWithUs':
        navigate('/partner-with-us');
        break;
      default:
        navigate('/');
    }
  };

  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogoClick = () => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/telecaller');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600">
      {!isLoginPage && !isAdminPage && (
        <>
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={handleLogoClick}
            >
              <IcteLogo size={36} withText className="group-hover:opacity-90 transition-opacity" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1 h-full items-center">
              {!user ? (
                <>
                  <button
                    className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none bg-transparent ${
                      location.pathname === '/'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    onClick={() => navigate('/')}
                  >
                    Home
                  </button>
                  <button
                    className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none bg-transparent ${
                      location.pathname === '/colleges'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    onClick={() => navigate('/colleges')}
                  >
                    Colleges
                  </button>
                  <button
                    className={`h-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none bg-transparent ${
                      location.pathname === '/check-status'
                        ? 'text-indigo-600 bg-indigo-50'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                    onClick={() => navigate('/check-status')}
                  >
                    Check Status
                  </button>
                  <button
                    className={`ml-2 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      location.pathname === '/login'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  {user.role === 'telecaller' && (
                    <button
                      className={`h-full px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none bg-transparent ${
                        location.pathname === '/telecaller'
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      onClick={() => navigate('/telecaller')}
                    >
                      My Leads
                    </button>
                  )}
                  <div className="flex items-center gap-2.5 ml-2">
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover bg-slate-50 border border-slate-200 shadow-sm shrink-0 cursor-pointer"
                        onClick={() => navigate('/profile')}
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full bg-[#1E40FF] flex items-center justify-center font-bold text-white text-[10px] shrink-0 cursor-pointer"
                        onClick={() => navigate('/profile')}
                      >
                        {(user.name || user.email).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] font-bold text-slate-600 hidden md:inline">Logged in as {user.name || user.email.split('@')[0]}</span>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer border-none bg-transparent"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </header>

        {/* Backdrop for Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Slide-in Drawer */}
        <aside
          className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } h-full p-6 shadow-2xl`}
        >
          {/* Header: Logo + Close Button */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 shrink-0">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
            >
              <IcteLogo size={32} withText />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors border-none bg-transparent cursor-pointer"
              title="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav links stacked vertically */}
          <nav className="flex flex-col gap-4 overflow-y-auto">
            {!user ? (
              <>
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                    location.pathname === '/' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-55'
                  }`}
                  onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                >
                  Home
                </button>
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                    location.pathname === '/colleges' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-50'
                  }`}
                  onClick={() => { navigate('/colleges'); setMobileMenuOpen(false); }}
                >
                  Colleges
                </button>
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                    location.pathname === '/check-status' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-50'
                  }`}
                  onClick={() => { navigate('/check-status'); setMobileMenuOpen(false); }}
                >
                  Check Status
                </button>
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                    location.pathname === '/login' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-50'
                  }`}
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                {user.role === 'telecaller' && (
                  <button
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                      location.pathname === '/telecaller' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-50'
                    }`}
                    onClick={() => { navigate('/telecaller'); setMobileMenuOpen(false); }}
                  >
                    My Leads
                  </button>
                )}
                <button
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left transition-all border-none bg-transparent cursor-pointer ${
                    location.pathname === '/profile' ? 'text-[#1E40FF] bg-[#EEF2FF]' : 'text-slate-600 hover:text-[#1E40FF] hover:bg-slate-50'
                  }`}
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                >
                  Profile
                </button>
                <button
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-left text-red-500 hover:bg-red-50 transition-all border-none bg-transparent cursor-pointer"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                >
                  Logout
                </button>
              </>
            )}
          </nav>
        </aside>
      </>
    )}

      <main>
        <Routes>
          <Route path="/" element={
            <HomePage
              setView={handleSetView}
              setSearchQuery={setSearchQuery}
              setActiveMode={setActiveMode}
            />
          } />
          <Route path="/colleges" element={
            <CollegeBrowse
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeMode={activeMode}
              setActiveMode={setActiveMode}
              setView={handleSetView}
            />
          } />
          <Route path="/check-status" element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/telecaller'} replace />
            ) : (
              <CheckStatus />
            )
          } />
          <Route path="/login" element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/telecaller'} replace />
            ) : (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            )
          } />
          <Route path="/partner-with-us" element={
            <PartnerWithUs setView={handleSetView} />
          } />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/disclaimer" element={<Disclaimer />} />

          {/* Protected Route Wrapper */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage
                user={user}
                token={token}
                onProfileUpdate={(updatedUser) => {
                  setUser(updatedUser);
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }}
              />
            </ProtectedRoute>
          } />

          {/* Admin Protected Routes with Left Sidebar Layout */}
          <Route element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout user={user} handleLogout={handleLogout} />
            </ProtectedRoute>
          }>
            <Route path="/admin" element={<AdminLeads token={token} />} />
            <Route path="/admin/colleges" element={<AdminColleges token={token} />} />
            <Route path="/admin/institute-courses" element={<AdminInstituteCourses token={token} />} />
            <Route path="/admin/team" element={<AdminUsers token={token} />} />
            <Route path="/admin/commissions" element={<AdminCommissions token={token} />} />
            <Route path="/admin/hot-leads" element={<AdminHotLeads token={token} />} />
            <Route path="/admin/partner-inquiries" element={<AdminPartnerInquiries token={token} />} />
          </Route>

          {/* Telecaller Protected Routes */}
          <Route path="/telecaller" element={
            <ProtectedRoute allowedRoles={['telecaller']}>
              <TelecallerDashboard token={token} user={user} />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
