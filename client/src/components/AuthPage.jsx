import React, { useState } from 'react';
import { Loader2, Lock, Mail, Shield } from 'lucide-react';
import IcteLogo from './IcteLogo';

const AuthPage = ({ onAuthSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://ictehub.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Login successful!');
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
    <div className="min-h-screen relative font-sans flex items-center justify-center p-4 overflow-hidden bg-slate-50">
      
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 mix-blend-multiply filter blur-[120px] animate-blob"></div>
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-pink-500/20 mix-blend-multiply filter blur-[120px] animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl p-8 sm:p-10 transform hover:scale-[1.01] transition-transform duration-500">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-5">
              <IcteLogo size={56} withText />
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-sm rounded-xl p-4 mb-6 font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Shield size={16} className="shrink-0" style={{ width: '16px', height: '16px' }} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm rounded-xl p-4 mb-6 font-semibold flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Shield size={16} className="shrink-0" style={{ width: '16px', height: '16px' }} /> {success}
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Mail size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" style={{ width: '16px', height: '16px' }} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Lock size={16} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" style={{ width: '16px', height: '16px' }} />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 focus:bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-sm shadow-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="relative w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 overflow-hidden group"
              disabled={isLoading}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin shrink-0" style={{ width: '16px', height: '16px' }} /> Processing...</>
              ) : (
                'Sign In Securely'
              )}
            </button>
          </form>
          
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-xs font-semibold text-slate-500 mt-8 opacity-70">
          Powered by ictEHub Education Workspace
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
