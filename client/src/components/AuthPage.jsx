import React, { useState } from 'react';
import { Loader2, Lock, Mail, Shield, Phone, Eye, EyeOff, GraduationCap, UserCheck, HelpCircle } from 'lucide-react';
import IcteLogo from './IcteLogo';

const API = 'https://ictehub.onrender.com';

const AuthPage = ({ onAuthSuccess }) => {
  const [loginType, setLoginType] = useState('student'); // 'student' | 'staff'
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Keep only digits and max 10 chars
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    let loginEmail = '';
    if (loginType === 'student') {
      const cleanPhone = formData.phone.trim();
      if (!cleanPhone || cleanPhone.length !== 10) {
        setError('Please enter a valid 10-digit registered mobile number.');
        setIsLoading(false);
        return;
      }
      if (!formData.password) {
        setError('Please enter your password (default is your Date of Birth in DDMMYYYY format, e.g. 15082002).');
        setIsLoading(false);
        return;
      }
      loginEmail = `${cleanPhone}@student.ictehub`.toLowerCase();
    } else {
      if (!formData.email.trim() || !formData.password) {
        setError('Please fill in your staff email and password.');
        setIsLoading(false);
        return;
      }
      loginEmail = formData.email.trim().toLowerCase();
    }

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid login credentials. Please verify and try again.');
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Login successful! Redirecting to dashboard...');
      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans flex items-center justify-center p-4 overflow-hidden bg-slate-50 selection:bg-blue-500/20">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-500/15 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Glass Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-3xl p-8 sm:p-10 transform transition-all duration-300">
          
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Buddha College of Nursing" className="h-16 w-auto object-contain drop-shadow-sm" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {loginType === 'student' ? 'Student Portal Login' : 'Staff & Administration Login'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {loginType === 'student'
                ? 'Track your application status, documents & admission updates'
                : 'Sign in to access lead management and college workspace'}
            </p>
          </div>

          {/* Login Type Switcher Tab */}
          <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center mb-6 border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setLoginType('student');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer border-none ${
                loginType === 'student'
                  ? 'bg-[#1E40FF] text-white shadow-md shadow-blue-500/20'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={15} /> Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('staff');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer border-none ${
                loginType === 'staff'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={15} /> Staff Login
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-xl p-3.5 mb-5 font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Shield size={16} className="shrink-0 text-red-600" /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs rounded-xl p-3.5 mb-5 font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Shield size={16} className="shrink-0 text-emerald-600" /> {success}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            
            {loginType === 'student' ? (
              /* Student Phone Number Field */
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Registered Mobile Number
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-500 font-bold text-xs pointer-events-none">
                    <Phone size={15} className="text-[#1E40FF]" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-20 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/70 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all font-bold text-sm tracking-wider shadow-sm"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              /* Staff Email Field */
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                  Staff Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <Mail size={16} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="staff@ictehub.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/80 bg-white/70 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all font-medium text-sm shadow-sm"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  Password
                </label>
                {loginType === 'student' && (
                  <span className="text-[10px] font-bold text-[#1E40FF]">
                    Default = DOB (DDMMYYYY)
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                  <Lock size={16} className="text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={loginType === 'student' ? 'e.g. 15082002 or custom password' : '••••••••'}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200/80 bg-white/70 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all font-medium text-sm shadow-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Helper Notice for Student */}
            {loginType === 'student' && (
              <div className="bg-blue-50/80 border border-blue-200/70 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed font-medium flex items-start gap-2">
                <HelpCircle size={15} className="text-[#1E40FF] shrink-0 mt-0.5" />
                <span>
                  <strong>First time logging in?</strong> Your default password is your Date of Birth in <strong>DDMMYYYY</strong> format (e.g. if born on 15 Aug 2002, enter <strong>15082002</strong>). You can update it anytime in your dashboard.
                </span>
              </div>
            )}

            <button
              type="submit"
              className={`relative w-full min-h-[44px] mt-2 py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider text-white shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 overflow-hidden cursor-pointer border-none ${
                loginType === 'student'
                  ? 'bg-[#1E40FF] hover:bg-blue-700 shadow-blue-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin shrink-0" /> Signing in...</>
              ) : (
                loginType === 'student' ? 'Sign In to Student Portal' : 'Sign In as Staff'
              )}
            </button>

            {/* Forgot Password / Help Link */}
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs font-bold text-slate-500 hover:text-[#1E40FF] transition-colors border-none bg-transparent cursor-pointer"
              >
                Forgot Password or Need Help?
              </button>
            </div>

          </form>
          
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-xs font-semibold text-slate-500 mt-6 opacity-80">
          Buddha College of Nursing & Admissions Portal
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <HelpCircle className="text-[#1E40FF]" size={20} /> Account Assistance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              If you are a student and need password assistance or admission help:
            </p>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-[11px] text-blue-900 mb-4 font-medium">
              💡 <strong>Default Password:</strong> Your Date of Birth in <strong>DDMMYYYY</strong> format (e.g. 15082002) as submitted in your application.
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs font-bold text-slate-800 mb-6">
              <div>📞 Admissions Helpline: <a href="tel:+919876543210" className="text-[#1E40FF] underline">+91 98765 43210</a></div>
              <div>✉️ Email: <span className="text-slate-600 font-medium">admissions@buddhacollegeofnursing.edu</span></div>
              <div>⏰ Hours: 9:00 AM – 6:00 PM (Mon – Sat)</div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white font-extrabold text-xs uppercase tracking-wider hover:bg-slate-800 transition-all border-none cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;
