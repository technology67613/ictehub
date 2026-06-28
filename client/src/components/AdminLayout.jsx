import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Building2,
  GraduationCap,
  DollarSign,
  UserCog,
  Flame,
  Handshake,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react';
import IcteLogo from './IcteLogo';

const AdminLayout = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { name: 'Leads', path: '/admin', icon: Users, exact: true },
    { name: 'Colleges', path: '/admin/colleges', icon: Building2 },
    { name: 'Institute Courses', path: '/admin/institute-courses', icon: GraduationCap },
    { name: 'Team', path: '/admin/team', icon: UserCog },
    { name: 'Commissions', path: '/admin/commissions', icon: DollarSign },
    { name: 'Partner Inquiries', path: '/admin/partner-inquiries', icon: Handshake },
    { name: 'Hot Leads', path: '/admin/hot-leads', icon: Flame, isHot: true },
  ];

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const isActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
          <IcteLogo size={32} withText />
          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold uppercase px-2 py-0.5 rounded-full border border-indigo-100">
            Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar (Desktop & Mobile Panel) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } h-full`}
      >
        {/* Top Section */}
        <div>
          {/* Logo Container (Hidden on mobile top header layout to prevent double logo, shown on desktop sidebar) */}
          <div className="h-16 px-6 border-b border-slate-200/80 items-center gap-3 hidden md:flex">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
              <IcteLogo size={34} withText />
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-extrabold uppercase px-2 py-0.5 rounded-full border border-indigo-100 shrink-0">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer border-none text-left ${
                    active
                      ? 'text-[#1E40FF] bg-[#EEF2FF]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${
                      item.isHot && !active ? 'text-amber-500 animate-pulse' : ''
                    } ${active ? 'text-[#1E40FF]' : 'text-slate-400'}`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Section */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt=""
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1E40FF] flex items-center justify-center font-bold text-white text-xs shrink-0">
                {(user?.name || user?.email || 'AD').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-800 truncate">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] font-semibold text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNavClick('/profile')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors ${
                location.pathname === '/profile'
                  ? 'text-[#1E40FF] border-[#1E40FF]/30 bg-blue-50/20'
                  : 'text-slate-600'
              }`}
            >
              <User size={12} />
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[10px] font-extrabold uppercase text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-all bg-transparent"
            >
              <LogOut size={12} />
              Logout
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 min-h-screen flex flex-col overflow-x-hidden">
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
