import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, ArrowLeft, Camera, CheckCircle2, AlertCircle,
  Loader2, Shield, Phone, Mail, GraduationCap
} from 'lucide-react';
import IcteLogo from './IcteLogo';

const API = 'https://ictehub.onrender.com';

export default function StudentProfile({ user, token, onProfileUpdate, handleLogout }) {
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [profilePicUrl, setProfilePicUrl] = useState(user?.profile_picture_url || '');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfilePicUrl(user.profile_picture_url || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Profile image must be less than 2MB.');
      return;
    }

    setUploadingPic(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'profile-picture');

      const authToken = token || localStorage.getItem('token');
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.message || 'Image upload failed');
      }

      setProfilePicUrl(data.url);
      setSuccess('Profile picture uploaded! Click "Save Changes" to apply.');
    } catch (err) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const authToken = token || localStorage.getItem('token');
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: name.trim(),
          profile_picture_url: profilePicUrl || null
        })
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.message || 'Failed to update profile');
      }

      if (onProfileUpdate) {
        onProfileUpdate(updated);
      }
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Server error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-blue-500/20 text-slate-700 pb-16">
      
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border-none cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          </div>
          <IcteLogo size={32} withText />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
          
          <div className="border-b border-slate-100 pb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
            
            {/* Avatar with Camera Overlay */}
            <div className="relative group">
              {profilePicUrl ? (
                <img
                  src={profilePicUrl}
                  alt={name || 'Student'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1E40FF] text-white flex items-center justify-center text-2xl font-black shadow-xl border-4 border-white">
                  {(name || user?.email || 'S').slice(0, 2).toUpperCase()}
                </div>
              )}

              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 hover:bg-[#1E40FF] text-white transition-colors shadow-lg cursor-pointer border-2 border-white">
                {uploadingPic ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingPic}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1E40FF] bg-blue-50 px-2.5 py-1 rounded-md">
                Student Account
              </span>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {name || 'Student Profile'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {user?.email || 'student@student.ictehub'}
              </p>
            </div>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl p-3.5 font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-[#1E40FF] focus:ring-4 focus:ring-[#1E40FF]/15 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Account Role</span>
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-[#1E40FF]" /> Student
                </span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Account Status</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> Active
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-[#1E40FF] hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60 cursor-pointer border-none flex items-center gap-2"
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>

          </form>

        </div>

      </main>

    </div>
  );
}
